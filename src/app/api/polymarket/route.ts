// src/app/api/polymarket/route.ts
import { NextResponse } from 'next/server';

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
      }
    });

    // 4. Urutkan dari Volume Tertinggi (Paling Ramai)
    filteredEvents.sort((a: any, b: any) => (parseFloat(b.volume) || 0) - (parseFloat(a.volume) || 0));

    // 5. Format Data untuk Frontend (agar frontend tidak perlu mapping rumit lagi)
    const formattedData = filteredEvents.map((event: any) => {
      const primaryMarket = event.markets && event.markets.length > 0 ? event.markets[0] : null;
      let prices = [0, 0];
      
      if (primaryMarket && primaryMarket.outcomePrices) {
        try { 
          // Kadang API Polymarket mereturn string array '["0.65", "0.35"]'
          const parsed = typeof primaryMarket.outcomePrices === 'string' 
            ? JSON.parse(primaryMarket.outcomePrices) 
            : primaryMarket.outcomePrices;
          prices = parsed.map(Number);
        } catch(e){}
      }

      // Cari URL Gambar yang valid
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

    // Kembalikan maksimal 20 data agar UI tidak nge-lag
    return NextResponse.json(formattedData.slice(0, 20));

  } catch (error) {
    console.error("Proxy Error:", error);
    // Jika gagal, kembalikan array kosong agar frontend tidak crash
    return NextResponse.json([], { status: 200 });
  }
}