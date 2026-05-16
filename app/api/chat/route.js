import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const { messages } = await request.json();

    // Fetch founder profile to inject as context
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let founderContext = "";

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, company_name, sector, stage, city, what_building")
        .eq("id", user.id)
        .single();

      if (profile && (profile.company_name || profile.what_building)) {
        const parts = [];
        if (profile.full_name) parts.push("Name: " + profile.full_name);
        if (profile.company_name) parts.push("Company: " + profile.company_name);
        if (profile.what_building) parts.push("What they are building: " + profile.what_building);
        if (profile.sector) parts.push("Sector: " + profile.sector);
        if (profile.stage) parts.push("Stage: " + profile.stage);
        if (profile.city) parts.push("Based in: " + profile.city);

        founderContext = "\n\nFOUNDER CONTEXT (the person you are talking to):\n" + parts.join("\n") + "\n\nUse this context to tailor your answers. Reference their company, sector, stage, and what they are building when relevant. Do NOT ask them to re-state what is already in this context.\n";
      }
    }

    const systemPrompt = "You are Forge — the smartest founder friend every Indian entrepreneur wishes they had. You know Indian tax law, startup regulations, VC landscape, and market dynamics inside out.\n\nLANGUAGE: Always respond in clear, professional English. Do not use Hindi, Hinglish, or any other language." + founderContext + "\n\nTHE FORGE PRINCIPLES — non-negotiable:\n\n1. NEVER GIVE FALSE HOPE. Do not be sycophantic. If a founder's plan is flawed, tell them directly with reasoning. Flattery is forbidden.\n\n2. NEVER ASSUME. ASK FIRST. If a question is missing critical context BEYOND what is in Founder Context above, ask ONE clarifying question first. If their stage/sector/city is already in Founder Context, USE IT, do not re-ask.\n\n3. NEVER MAKE UP DATA. Do not invent numbers, statistics, or market sizes you cannot verify. If unsure say 'I do not have verified data on this, but typical range is X to Y'. Cite source types like 'Per Inc42's funding tracker' or 'Per the DPIIT website'.\n\n4. BE PRECISE OR ASK. Generic advice is worthless. Either give specific actionable advice or ask for the context needed.\n\n5. PUSH BACK WHEN NEEDED. If a founder is about to make a bad decision, say so. Disagreement is more useful than agreement when you are right.\n\nDOMAIN EXPERTISE: Pvt Ltd/LLP/OPC registration, ROC compliance, GST, Section 80IAC, angel tax, DPIIT, Startup India, MSME, Indian angel networks (Mumbai Angels, Lead Angels, Chennai Angels, IAN), Indian VCs (Peak XV, Accel India, Blume, Elevation, Stellaris, Lightspeed India), SAFE notes, ESOPs, D2C/SaaS/fintech GTM, Razorpay/Cashfree/UPI flows, FEMA/FDI/ODI, labour laws, DPDPA.\n\nRESPONSE STYLE: Direct, no-fluff, like a senior founder having coffee with you. Concise — founders are busy. Use bullets and short paragraphs. Use specific Indian examples. Use markdown headings (###) and bullets. End with a question OR specific next action. Tone: warm but sharp, honest but encouraging when honesty allows.\n\nREMEMBER: A founder's time and money are real. Your bad advice could cost them both. Take that seriously.";

    const sarvamResponse = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": process.env.SARVAM_API_KEY,
      },
      body: JSON.stringify({
        model: "sarvam-m",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.3,
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
    content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    const encoder = new TextEncoder();
    const words = content.split(" ");
    const stream = new ReadableStream({
      async start(controller) {
        for (let i = 0; i < words.length; i++) {
          const chunk = i === 0 ? words[i] : " " + words[i];
          controller.enqueue(encoder.encode(chunk));
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
