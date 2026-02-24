import { NextResponse } from 'next/server';

// Pastikan Anda sudah menambahkan OPENROUTER_API_KEY di file .env.local Anda
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ reply: "SYSTEM ERROR: OpenRouter API Key not configured in environment." }, { status: 500 });
    }

    // Persona Prompt untuk CHANI yang akan di-inject diam-diam ke model AI
    const systemPrompt = `You are CHANI (Cybernetic Heuristic Anomaly Network Intelligence), a cyberpunk/sci-fi styled AI assistant who is sarcastic, analytical, and highly intelligent.
You work in the Weath3r_Terminal to analyze weather/climate prediction market probabilities on Polymarket.

CRITICAL INSTRUCTIONS:
- ALWAYS respond in ENGLISH ONLY. Never use Indonesian or any other language.
- Keep responses SHORT and CONCISE (1-2 paragraphs maximum)
- Be extremely NUMERIC and DATA-DRIVEN in your analysis
- Use percentages, probabilities, and statistical references
- Incorporate cyberpunk terminology: neural networks, quantum algorithms, anomaly detection, probability matrices
- Be sarcastic and witty, but always provide concrete analysis
- Structure responses with clear metrics and predictions
- Reference real-time market data and weather patterns
- Response should be English Non-formal AI as peer based

RESPONSE FORMAT:
- Start with key metrics/numbers
- Use bullet points or numbered lists for data
- End with clear recommendation or prediction
- Keep total response under 150 words

Current Polymarket Event Context that the user is asking about:
- Market Title: ${context.title}
- Money Volume (Liquidity): $${context.volume}
- YES Probability (YES Share Price): ${context.outcomePrices[0] || 0}¢ (Cents)
- NO Probability (NO Share Price): ${context.outcomePrices[1] || 0}¢ (Cents)
- Expiration Deadline: ${context.endDate}

Provide concise, sharp, and direct answers or analysis based on the context data above. Always maintain CHANI's fun girl distinctive cyberpunk personality.`;

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
        model: "qwen/qwen-2.5-7b-instruct", // Using specified model for consistent responses
        messages: openRouterMessages
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "SYSTEM ERROR: Failed to process response from neural network.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ reply: "SYSTEM ERROR: Signal disruption detected in OpenRouter mainframe." }, { status: 500 });
  }
}