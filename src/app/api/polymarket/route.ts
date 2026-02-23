// src/app/api/polymarket/route.ts
import { NextResponse } from 'next/server';

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
      }
    );

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

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json([], { status: 200 });
  }
}