// src/app/api/polymarket/route.ts
import { NextResponse } from 'next/server';

<<<<<<< HEAD
// ─── Module-level in-memory cache ────────────────────────────────────────────
// Next.js data cache rejects responses > 2MB (Polymarket returns ~2 MB even at
// limit=100). Using our own cache avoids the warning AND the repeat ECONNRESET
// that happens when every request hits Polymarket cold.
let _cache: { data: any[]; ts: number } | null = null;
const CACHE_TTL = 60_000; // 60 seconds

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 400 * (attempt + 1))); // backoff: 400ms, 800ms
    }
  }
  throw new Error('All retries exhausted');
}

async function getPolymarketEvents(): Promise<any[]> {
  // Return cached result if still fresh
  if (_cache && Date.now() - _cache.ts < CACHE_TTL) return _cache.data;

  // limit=30 ≈ 600 KB — well under the 2 MB TCP / cache threshold
  const res = await fetchWithRetry(
    `https://gamma-api.polymarket.com/events?active=true&closed=false&limit=30&tag_slug=weather`,
    {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Weath3rBot/1.0)',
      },
      cache: 'no-store', // we manage caching ourselves
    }
  );

  const data = await res.json();
  _cache = { data: Array.isArray(data) ? data : [], ts: Date.now() };
  return _cache.data;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') || 'temperature';

  try {
    const allEvents = await getPolymarketEvents();

    // 2. Keywords — Daily_Temp targets short-term/forecast type markets only.
    //    Exclusions prevent annual climate record questions from leaking in.
    const tempKeywords = ['temperature', 'temp ', 'degrees', 'celsius', 'fahrenheit', 'coldest day', 'hottest day', 'high temp', 'low temp', 'heat index', 'below zero', 'above average'];
    const tempExclusions = ['on record', 'rank', 'all-time', 'hottest year', 'warmest year', 'coldest year', 'annual', 'decade', 'century', 'millenium', 'climate change', 'global warm'];
    const weatherKeywords = ['hurricane', 'storm', 'rainfall', 'snowfall', 'flood', 'typhoon', 'tornado', 'cyclone', 'drought', 'blizzard', 'heatwave', 'heat wave', 'wildfire', 'lightning'];

    // 3. Filter by tab only — show all global markets for each tab.
    // The left panel provides city-specific forecast for decision-making;
    // the right panel shows the full global market board.
    let filteredEvents = allEvents.filter((event: any) => {
      const textToSearch = ((event.title || '') + ' ' + (event.description || '')).toLowerCase();
      if (tab === 'temperature') {
        const hasKeyword = tempKeywords.some(kw => textToSearch.includes(kw));
        const hasExclusion = tempExclusions.some(ex => textToSearch.includes(ex));
        return hasKeyword && !hasExclusion;
      } else {
        return weatherKeywords.some(kw => textToSearch.includes(kw));
=======
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = (searchParams.get('city') || 'London').toLowerCase();
  const tab = searchParams.get('tab') || 'temperature';

  try {
    // 1. KUNCI PENYELESAIAN ECONNRESET: Gunakan Next.js Revalidate
    // Kita mengambil 100 data event Polymarket HANYA SEKALI setiap 60 detik.
    // Permintaan ke-2, ke-3, dst dalam menit yang sama tidak akan menembak API Polymarket, melainkan memori lokal.
    const res = await fetch(
      `https://gamma-api.polymarket.com/events?active=true&closed=false&limit=100`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Connection': 'keep-alive' // Membantu menjaga koneksi agar tidak di-reset TCP
        },
        next: { revalidate: 60 } // CACHE SELAMA 60 DETIK
>>>>>>> 5476ba3238dd1d5475c6b884cab524d549834f6f
      }
    });

<<<<<<< HEAD
    // 4. Urutkan dari Volume Tertinggi (Paling Ramai)
    filteredEvents.sort((a: any, b: any) => (parseFloat(b.volume) || 0) - (parseFloat(a.volume) || 0));

    // 5. Format Data untuk Frontend (agar frontend tidak perlu mapping rumit lagi)
=======
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const allEvents = await res.json();

    // 2. Keyword Filtering
    const tempKeywords = ['temp ', 'temperature', 'degree', 'hottest', 'coldest', 'heat', 'warm', 'celsius', 'fahrenheit'];
    const weatherKeywords = ['weather', 'hurricane', 'storm', 'rain', 'snow', 'flood', 'earthquake', 'disaster', 'climate', 'typhoon'];

    // 3. Filter Data secara LOKAL (Sangat cepat dan tidak memakan API rate limit)
    let filteredEvents = allEvents.filter((event: any) => {
      const title = (event.title || '').toLowerCase();
      const desc = (event.description || '').toLowerCase();
      const textToSearch = title + " " + desc;
      
      const isCityMatch = textToSearch.includes(city);
      const keywords = tab === 'temperature' ? tempKeywords : weatherKeywords;
      const isCategoryMatch = keywords.some(kw => textToSearch.includes(kw));

      return isCityMatch && isCategoryMatch;
    });

    filteredEvents.sort((a: any, b: any) => (parseFloat(b.volume) || 0) - (parseFloat(a.volume) || 0));

    // 4. Formatting untuk Frontend
>>>>>>> 5476ba3238dd1d5475c6b884cab524d549834f6f
    const formattedData = filteredEvents.map((event: any) => {
      const primaryMarket = event.markets && event.markets.length > 0 ? event.markets[0] : null;
      let prices = [0, 0];
      
      if (primaryMarket && primaryMarket.outcomePrices) {
        try { 
<<<<<<< HEAD
          // Kadang API Polymarket mereturn string array '["0.65", "0.35"]'
=======
>>>>>>> 5476ba3238dd1d5475c6b884cab524d549834f6f
          const parsed = typeof primaryMarket.outcomePrices === 'string' 
            ? JSON.parse(primaryMarket.outcomePrices) 
            : primaryMarket.outcomePrices;
          prices = parsed.map(Number);
        } catch(e){}
      }

<<<<<<< HEAD
      // Cari URL Gambar yang valid
=======
>>>>>>> 5476ba3238dd1d5475c6b884cab524d549834f6f
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

<<<<<<< HEAD
    // Kembalikan maksimal 20 data agar UI tidak nge-lag
    return NextResponse.json(formattedData.slice(0, 20));

  } catch (error) {
    console.error("Proxy Error:", error);
    // Jika gagal, kembalikan array kosong agar frontend tidak crash
=======
    return NextResponse.json(formattedData);

  } catch (error) {
    console.error("Proxy Error:", error);
>>>>>>> 5476ba3238dd1d5475c6b884cab524d549834f6f
    return NextResponse.json([], { status: 200 });
  }
}