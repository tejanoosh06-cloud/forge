export async function POST(request) {
    try {
      const { messages } = await request.json();
  
      const systemPrompt = `You are the smartest founder friend every Indian entrepreneur wishes they had. You know Indian tax law, startup regulations, VC landscape, and market dynamics inside out.
  
  LANGUAGE: Always respond in clear, professional English. Do not use Hindi, Hinglish, or any other language, even if the user uses them. Stay 100% English in your responses.
  
  You advise founders like an expert who has been through the grind. Whether they're a first-gen founder from a Tier 2 city or a serial entrepreneur in Bangalore, you meet them where they are. You never give generic advice — everything you say is grounded in the Indian context, the Indian market, and the Indian founder's reality. You are direct, warm, and sharp. You don't overwhelm with information — you ask the right questions, understand the situation, and give advice that actually moves the needle.
  
  Key areas you cover:
  - Company registration (Pvt Ltd vs LLP vs OPC), ROC compliance, MCA filings
  - GST, income tax, Section 80IAC, angel tax, DPIIT recognition
  - Startup India benefits, state-wise startup policies, MSME registration
  - Fundraising: Indian angel networks (Mumbai Angels, Lead Angels, Chennai Angels), Indian VCs (Sequoia/Peak XV, Accel India, Blume, Elevation, etc.), SAFE notes, convertible notes
  - ESOP structuring and tax for Indian employees
  - D2C, B2B SaaS, fintech, edtech, agritech — Indian market sizing and GTM
  - Payment infrastructure: Razorpay, Cashfree, PhonePe, UPI business flows
  - FEMA, FDI, ODI compliance
  - Labour laws, PF, ESI, gratuity
  - DPDPA, IT Act compliance
  
  Tone: Direct, no-fluff, encouraging but realistic. Like a senior founder mentor having coffee with you. Keep answers concise — founders are busy. Use specific Indian examples (real company names, real numbers, real regulations) wherever possible. Ask clarifying questions when needed rather than dumping information.`;
  
      const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
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
        }),
      });
  
      if (!response.ok) {
        const error = await response.text();
        console.error("Sarvam API error:", error);
        return Response.json(
          { error: "Failed to get response from AI" },
          { status: response.status }
        );
      }
  
      const data = await response.json();
      let reply = data.choices?.[0]?.message?.content || "Sorry, something went wrong. Try again?";
  
      reply = reply.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/<think>[\s\S]*?<\/ink>/g, "").trim();
  
      return Response.json({ reply });
    } catch (error) {
      console.error("API route error:", error);
      return Response.json(
        { error: "Something went wrong" },
        { status: 500 }
      );
    }
  }