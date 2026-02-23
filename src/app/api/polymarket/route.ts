// src/app/api/polymarket/route.ts
import { NextResponse } from 'next/server';
import https from 'https';

// --- In-Memory Cache ---
let _cache: { data: any[]; ts: number } | null = null;
const CACHE_TTL = 60_000; // 60 detik

// Bypass Next.js Fetch/Undici! Menggunakan native Node.js HTTPS
function fetchPolymarketNative(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      timeout: 10000 // 10 detik timeout
    };

    const req = https.get(url, options, (res) => {
      // Jika status bukan 200, batalkan
      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        res.resume(); // Bersihkan memori buffer
        return reject(new Error(`HTTP ${res.statusCode}`));
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error('Gagal parse JSON dari Polymarket'));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Polymarket API Timeout'));
    });
  });
}

// Fungsi retry yang membungkus pemanggilan HTTPS native
async function getPolymarketDataWithRetry(url: string, retries = 3): Promise<any[]> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await fetchPolymarketNative(url);
      return Array.isArray(data) ? data : [];
    } catch (err: any) {
      if (attempt === retries) throw err;
      // Jeda 1 detik, 2 detik, 3 detik sebelum mencoba lagi
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); 
    }
  }
  return [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = (searchParams.get('city') || '').toLowerCase();
  const tab = searchParams.get('tab') || 'temperature';

  try {
    let allEvents = [];

    // Cek Cache
    if (_cache && Date.now() - _cache.ts < CACHE_TTL) {
      allEvents = _cache.data;
    } else {
      // Fetch menggunakan fungsi native HTTPS
      const url = `https://gamma-api.polymarket.com/events?active=true&closed=false&limit=60&tag_slug=weather`;
      allEvents = await getPolymarketDataWithRetry(url);
      
      // Simpan ke cache jika sukses
      if (allEvents.length > 0) {
        _cache = { data: allEvents, ts: Date.now() };
      }
    }

    // Keyword Filtering Sesuai Tab
    const tempKeywords = ['temperature', 'temp', 'degree', 'hottest', 'coldest', 'heat', 'warm', 'celsius', 'fahrenheit'];
    const weatherKeywords = ['snow', 'inches', 'rain', 'weather', 'hurricane', 'storm', 'flood', 'earthquake', 'typhoon', 'precip'];

    // Filter Data secara LOKAL
    let filteredEvents = allEvents.filter((event: any) => {
      const title = (event.title || '').toLowerCase();
      const desc = (event.description || '').toLowerCase();
      const textToSearch = title + " " + desc;
      
      // Jika city kosong (Mode GLOBAL), lewati pengecekan kota
      const isCityMatch = city ? textToSearch.includes(city) : true;
      const keywords = tab === 'temperature' ? tempKeywords : weatherKeywords;
      const isCategoryMatch = keywords.some(kw => textToSearch.includes(kw));

      return isCityMatch && isCategoryMatch;
    });

    // Urutkan berdasarkan Volume Tertinggi
    filteredEvents.sort((a: any, b: any) => (parseFloat(b.volume) || 0) - (parseFloat(a.volume) || 0));

    // Formatting Data untuk Frontend
    const formattedData = filteredEvents.map((event: any) => {
      const primaryMarket = event.markets && event.markets.length > 0 ? event.markets[0] : null;
      let prices = [0, 0];
      
      if (primaryMarket && primaryMarket.outcomePrices) {
        try { 
          const parsed = typeof primaryMarket.outcomePrices === 'string' 
            ? JSON.parse(primaryMarket.outcomePrices) 
            : primaryMarket.outcomePrices;
          prices = parsed.map(Number);
        } catch(e){}
      }

      const imageUrl = event.image || event.icon || (primaryMarket && primaryMarket.icon) || null;

      return {
        id: event.id,
        title: event.title,
        volume: event.volume || 0,
        endDate: new Date(event.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        outcomePrices: prices.map((p: any) => Math.round(Number(p) * 100)),
        image: imageUrl
      };
    });

    return NextResponse.json(formattedData.slice(0, 20));

  } catch (error) {
    console.error("Proxy Error API Polymarket Native HTTPS:", error);
    return NextResponse.json([], { status: 200 });
  }
}