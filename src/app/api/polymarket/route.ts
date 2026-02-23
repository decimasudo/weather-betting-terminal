// src/app/api/polymarket/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Ambil keyword pencarian dari URL (contoh: /api/polymarket?query=Denpasar)
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Keyword pencarian diperlukan' }, { status: 400 });
  }

  try {
    // Modifikasi query untuk mencari pasar cuaca GLOBAL
    // Kita hapus filter lokasi spesifik agar user tetap melihat pasar cuaca 
    // meskipun tidak ada yang spesifik untuk kota tersebut
    
    // Lakukan fetch ke Polymarket dari SERVER-SIDE (bebas dari CORS)
    // Gunakan tag_slug=weather untuk memastikan hanya event cuaca
    // Urutkan berdasarkan volume agar event paling likuid muncul paling atas
    const res = await fetch(
      `https://gamma-api.polymarket.com/events?active=true&closed=false&limit=20&tag_slug=weather&sort=volume`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Weath3rBet-Terminal/1.0'
        }
      }
    );

    if (!res.ok) {
      throw new Error(`Polymarket API responded with status: ${res.status}`);
    }

    const data = await res.json();
    
    // Server-side filtering: Kita akan menampilkan SEMUA pasar cuaca yang tersedia (Global)
    // Tidak lagi membatasi hanya untuk kota yang dicari
    // Namun kita bisa memprioritaskan yang relevan jika ada (optional sorting)
    
    let relevantData = data;
    
    // Jika ada query lokasi, kita bisa coba taruh di paling atas (opsional), 
    // tapi untuk sekarang kita return saja semua data cuaca dari Polymarket
    // agar user selalu melihat pasar yang aktif.

    // Kembalikan data ke frontend kita
    return NextResponse.json(relevantData);
  } catch (error) {
    console.error("Server Proxy Error:", error);
    return NextResponse.json({ error: 'Gagal mengambil data dari Polymarket' }, { status: 500 });
  }
}