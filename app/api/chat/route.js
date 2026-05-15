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
        stream: true,
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

    // Transform Sarvam's SSE stream into clean text chunks for the browser
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = sarvamResponse.body.getReader();
        let buffer = "";
        let insideThinkBlock = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;
              const data = trimmed.slice(6);
              if (data === "[DONE]") {
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                let content = parsed.choices?.[0]?.delta?.content || "";
                if (!content) continue;

                // Filter out <think>...</think> blocks across chunks
                let output = "";
                let i = 0;
                while (i < content.length) {
                  if (!insideThinkBlock) {
                    const thinkStart = content.indexOf("<think>", i);
                    if (thinkStart === -1) {
                      output += content.slice(i);
                      break;
                    } else {
                      output += content.slice(i, thinkStart);
                      i = thinkStart + 7;
                      insideThinkBlock = true;
                    }
                  } else {
                    const thinkEnd = content.indexOf("</think>", i);
                    const thinkEndAlt = content.indexOf("</ink>", i);
                    const endIdx = thinkEnd !== -1 ? thinkEnd : thinkEndAlt;
                    if (endIdx === -1) {
                      i = content.length;
                      break;
                    } else {
                      i = endIdx + (thinkEnd !== -1 ? 8 : 6);
                      insideThinkBlock = false;
                    }
                  }
                }

                if (output) {
                  controller.enqueue(encoder.encode(output));
                }
              } catch {
                // Skip malformed JSON chunks silently
              }
            }
          }
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("API route error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}