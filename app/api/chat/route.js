export async function POST(request) {
  try {
    const { messages } = await request.json();

    const systemPrompt = `You are the smartest founder friend every Indian entrepreneur wishes they had. You know Indian tax law, startup regulations, VC landscape, and market dynamics inside out.

LANGUAGE: Always respond in clear, professional English. Do not use Hindi, Hinglish, or any other language, even if the user uses them.

You advise founders like an expert who has been through the grind. You never give generic advice — everything you say is grounded in the Indian context. You are direct, warm, and sharp. You don't overwhelm with information.

Key areas: Pvt Ltd/LLP/OPC registration, ROC compliance, GST, Section 80IAC, angel tax, DPIIT, Startup India, MSME, Indian angel networks (Mumbai Angels, Lead Angels, Chennai Angels), Indian VCs (Peak XV, Accel India, Blume, Elevation), SAFE notes, ESOPs, D2C/SaaS/fintech GTM, Razorpay/Cashfree/UPI, FEMA/FDI/ODI, labour laws, DPDPA.

Tone: Like a senior founder mentor. Direct, no-fluff, concise. Use specific Indian examples. Ask clarifying questions instead of dumping information.`;

    const sarvamResponse = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": process.env.SARVAM_API_KEY,
      },
      body: JSON.stringify({
        model: "sarvam-m",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.5,
        max_tokens: 2048,
        stream: false,
      }),
    });

    if (!sarvamResponse.ok) {
      const errText = await sarvamResponse.text();
      console.error("Sarvam API error:", errText);
      return new Response(JSON.stringify({ error: "Failed to get response from AI" }), {
        status: sarvamResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await sarvamResponse.json();
    let content = data.choices?.[0]?.message?.content || "No response received.";

    // Strip <think>...</think> blocks cleanly
    content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    // Stream the clean content word by word for typewriter effect
    const encoder = new TextEncoder();
    const words = content.split(" ");

    const stream = new ReadableStream({
      async start(controller) {
        for (let i = 0; i < words.length; i++) {
          const chunk = i === 0 ? words[i] : " " + words[i];
          controller.enqueue(encoder.encode(chunk));
          // Small delay for typewriter effect
          await new Promise((r) => setTimeout(r, 18));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });

  } catch (error) {
    console.error("API route error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
