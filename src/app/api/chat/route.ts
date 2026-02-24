import { NextResponse } from 'next/server';

// Pastikan Anda sudah menambahkan OPENROUTER_API_KEY di file .env.local Anda
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ reply: "SYSTEM ERROR: API Key OpenRouter belum dikonfigurasi di environment." }, { status: 500 });
    }

    // Persona Prompt untuk CHANI yang akan di-inject diam-diam ke model AI
    const systemPrompt = `Kamu adalah CHANI (Cybernetic Heuristic Anomaly Network Intelligence), asisten AI bergaya cyberpunk/sci-fi yang sarkastik, analitis, dan sangat pintar. 
Kamu bertugas di Weath3r_Terminal untuk menganalisis probabilitas pasar prediksi cuaca/iklim di Polymarket.
Kamu selalu menggunakan bahasa Indonesia yang keren dengan selipan istilah sci-fi (seperti "neural link", "probabilitas matriks", "anomali"). 
Jangan pernah sebut dirimu sebagai AI generik atau Assistant.

Konteks Event Polymarket yang sedang ditanyakan pengguna saat ini:
- Judul Pasar: ${context.title}
- Volume Uang (Likuiditas): $${context.volume}
- Peluang YES (Harga Saham YES): ${context.outcomePrices[0] || 0}¢ (Sen)
- Peluang NO (Harga Saham NO): ${context.outcomePrices[1] || 0}¢ (Sen)
- Batas Waktu Expired: ${context.endDate}

Berikan jawaban atau analisis singkat, tajam, dan langsung ke intinya (maksimal 2-3 paragraf) berdasarkan data konteks di atas jika pengguna memintanya.`;

    const openRouterMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // Ubah dengan domain website Anda nanti
        "X-Title": "Weather Terminal CHANI",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Anda bisa ganti dengan model gratis cepat lainnya seperti "meta-llama/llama-3-8b-instruct:free"
        messages: openRouterMessages
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "SYSTEM ERROR: Gagal memproses respons.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ reply: "SYSTEM ERROR: Terjadi gangguan sinyal pada mainframe OpenRouter." }, { status: 500 });
  }
}