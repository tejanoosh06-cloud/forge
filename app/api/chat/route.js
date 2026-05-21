import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// ===== LITE PROMPT — for casual / off-topic questions =====
const FORGE_LITE_PROMPT = `You are Lore AI — an AI co-founder for Indian founders. Be direct, warm, India-aware. Use rupees not dollars. WhatsApp/UPI/Instagram over Slack/Stripe/LinkedIn. Lead with the answer. No filler. End with one specific action in next 30 minutes.`;



// PRO+ ENHANCEMENT — appended for pro+ requests


// CORE MODULE — always included for all tiers (~300 tokens)


// GROWTH MODULE — loaded for marketing/growth/distribution questions (~280 tokens)


// FINANCE MODULE — loaded for numbers/pricing/fundraising questions (~280 tokens)


// PEOPLE MODULE — loaded for hiring/team/mental health questions (~220 tokens)  


// SECTORS MODULE — loaded when sector is detected (~200 tokens)


// PRO+ ENHANCEMENT — only for pro+ requests (~370 tokens)
const FORGE_PRO_PLUS_ENHANCEMENT = `# PRO+ MODE — make this answer count

This founder used their daily Pro+ credit. Give dramatically more value than standard.

## DEPTH
- Consider 2-3 angles before committing to your view
- Surface edge cases the user did not mention
- Question your first instinct then commit to the best one
- Show the math, show the reasoning, show the decision

## VOICE
- Varied rhythm — mix short punches with longer texture
- Lead with the single sharpest insight
- Bold ONLY 1-2 truly critical phrases
- Specific numbers and concrete India references always

## ENERGY MATCH
- Tired founder: empathy first, then direction
- Excited founder: channel into action immediately
- Stuck founder: break into ONE tiny next move
- Skeptical founder: grounded reasoning, zero hype

## LENGTH
- Premium = sharper, not longer
- Every paragraph earns its place
- End with a line the founder will remember tomorrow — specific, grounded, actionable`;

// MODULE SELECTOR — picks which modules to add based on query + tier


// ===== FULL PROMPT — for serious founder / startup questions =====




function isStartupQuery(text) {
  if (!text) return false;
  const q = text.toLowerCase();
  const startupKeywords = [
    "startup","founder","company","business","revenue","customer","user","product","market","launch","mvp",
    "pitch","investor","vc","angel","raise","seed","series","funding","valuation","term sheet","safe","esop",
    "gst","tax","compliance","incorporation","registration","roc","mca","dpiit","fema","fdi","msme","80iac",
    "hire","hiring","employee","cofounder","co-founder","team","salary","equity","stake","share","stock",
    "growth","gtm","go to market","marketing","sales","pricing","pricing strategy","price","cac","ltv",
    "saas","d2c","fintech","edtech","agritech","healthtech","b2b","b2c","marketplace","app","platform",
    "razorpay","cashfree","stripe","upi","payment","onboarding","retention","churn","conversion",
    "metric","kpi","dashboard","analytics","data","feature","roadmap","strategy","plan","build","ship",
    "competition","competitor","moat","positioning","brand","pmf","traction","mrr","arr","burn","runway",
    "advice","help me","how do i","should i","my company","my business","my product","my startup","my idea","i am building","i'm building",
    "indian","india","bharat","mumbai","bangalore","bengaluru","hyderabad","delhi","chennai","pune","kolkata",
    "validate","validation","prototype","manufacturing","supplier","factory","cad","design","logo","website",
    "instagram","whatsapp","reels","content","influencer","reach","followers",
    "regulation","license","fssai","cdsco","rbi","sebi","dpdp",
    "last time","previously","remember","earlier","before","we discussed","we talked","where did we","what did we","yesterday","my idea","my project"
  ];
  return startupKeywords.some(kw => q.includes(kw));
}

function isHeavyAnalysisQuery(text) {
  if (!text || text.length < 200) return false;
  const q = text.toLowerCase();
  const heavyKeywords = [
    "roadmap","plan","analyze","analyse","analysis","strategy","compare","comparison",
    "pros and cons","walk me through","step by step","step-by-step","business plan",
    "review my","should i invest","detailed breakdown","deep dive","comprehensive",
    "in depth","in-depth","full analysis","complete plan","entire","full review",
    "12 month","12-month","6 month","6-month","quarterly","yearly plan"
  ];
  return heavyKeywords.some(kw => q.includes(kw));
}

export async function POST(request) {
  try {
    const { messages, pro_plus_requested } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // ===== RATE LIMITING =====
    if (user) {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();

      // Daily cap: 30 messages
      const { count: todayCount } = await supabase
        .from("usage_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action_type", "chat")
        .gte("created_at", todayStart);

      if (todayCount !== null && todayCount >= 30) {
        return NextResponse.json({
          error: "daily_limit",
          message: "You have used Forge a lot today (30 messages). Your limit resets at midnight. Premium tier with unlimited messages is coming soon."
        }, { status: 429 });
      }

      // Per-minute burst cap: 10 messages
      const { count: minuteCount } = await supabase
        .from("usage_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action_type", "chat")
        .gte("created_at", oneMinuteAgo);

      if (minuteCount !== null && minuteCount >= 10) {
        return NextResponse.json({
          error: "burst_limit",
          message: "Slow down a bit. You can send up to 10 messages per minute."
        }, { status: 429 });
      }

      // Log this usage (fire-and-forget so we don't slow the response)
      supabase
        .from("usage_logs")
        .insert({ user_id: user.id, action_type: "chat" })
        .then(() => {});
    }
    // ===== END RATE LIMITING =====

    const lastUserMsg = messages.length > 0 ? messages[messages.length - 1].content : "";
    const useFullPrompt = isStartupQuery(lastUserMsg);

    // Fetch is_pro early so it's available for tiering
    let userIsPro = false;
    if (user) {
      const { data: proCheck } = await supabase
        .from("profiles").select("is_pro").eq("id", user.id).single();
      userIsPro = proCheck?.is_pro || false;
    }

    // ===== PRO+ TIER CHECK =====
    let useProPlus = false;
    if (pro_plus_requested && user) {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      // Check if user already used their daily Pro+ credit
      const { count: proPlusToday } = await supabase
        .from("usage_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action_type", "pro_plus_answer")
        .gte("created_at", todayStart);

      if (proPlusToday !== null && proPlusToday >= 1) {
        return NextResponse.json({
          error: "pro_plus_used",
          message: "You have already used today's Pro+ answer. Resets at midnight. Get unlimited Pro+ with the upcoming premium tier."
        }, { status: 429 });
      }

      useProPlus = true;
      // Log the Pro+ usage now (so concurrent requests don't double-spend)
      supabase
        .from("usage_logs")
        .insert({ user_id: user.id, action_type: "pro_plus_answer" })
        .then(() => {});
    }
    // ===== END PRO+ TIER CHECK =====

    // PROMPT TIER SYSTEM
    // Free: LITE for casual, FULL for startup queries (3020 tokens, safe)
    // Pro: FULL always (3020 tokens + more history)
    // Pro+: FULL + enhancement (3020 + 370 tokens)
    let basePrompt;
    if (useProPlus || userIsPro) {
      basePrompt = FORGE_FULL_PROMPT;
    } else {
      basePrompt = useFullPrompt ? FORGE_FULL_PROMPT : FORGE_LITE_PROMPT;
    }

    // === Inject project context if this chat belongs to a project ===
    try {
      if (chat_id) {
        const { data: chatRow } = await supabase
          .from("chats")
          .select("project_id")
          .eq("id", chat_id)
          .maybeSingle();
        if (chatRow?.project_id) {
          const { data: project } = await supabase
            .from("projects")
            .select("name, description, emoji")
            .eq("id", chatRow.project_id)
            .maybeSingle();
          if (project) {
            const projectBlock = `\n\n[PROJECT CONTEXT]\nProject: ${project.emoji || "📁"} ${project.name}${project.description ? `\nAbout: ${project.description}` : ""}\n\nThe user is working inside this project. Tailor every answer to this specific project's stage, goals, and constraints. Remember details from previous chats in this project when relevant.`;
            basePrompt += projectBlock;
          }
        }
      }
    } catch (projectErr) {
      console.error("[chat] project context injection failed:", projectErr);
    }
    if (useProPlus) {
      basePrompt += FORGE_PRO_PLUS_ENHANCEMENT;
    }
    let founderContext = "";

    if (user && (userIsPro || useProPlus) && useFullPrompt) {
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

        founderContext = "\n\n# FOUNDER CONTEXT (the person you are talking to):\n" + parts.join("\n") + "\n\nUse this context only if directly relevant. Don't force-relate everything to their startup. Don't ask them to restate what's already here.\n";
      }
    }

    // Load memories for ANY logged-in user (not gated by useFullPrompt)
    if (user) {
      const { data: memories } = await supabase
        .from("user_memories")
        .select("memory_text, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(useProPlus ? 6 : userIsPro ? 4 : 2);

      if (memories && memories.length > 0) {
        const memoryLines = memories.map((m, i) => `${i + 1}. ${m.memory_text}`).join("\n");
        founderContext += "\n\n# WHAT YOU REMEMBER FROM PAST CONVERSATIONS WITH THIS FOUNDER:\n" + memoryLines + "\n\nUse these memories to give continuity. If the user references something from before or asks about past discussions, use these memories to respond naturally. Do NOT explicitly say 'I remember' or 'from your past chats' \u2014 just behave like a co-founder who naturally remembers what was discussed.\n";
      }
    }

    const systemPrompt = basePrompt + founderContext;

    // Filter out our own error/fallback messages so they don't pollute Sarvam history
    const errorPhrases = [
      "Something went wrong",
      "AI service had an issue",
      "AI service unavailable",
      "Rate limit reached",
      "Network issue",
      "Sorry, your message hit a length limit",
      "Sorry, I got stuck thinking",
      "Pro+ used today",
      "You have already used today's Pro+",
      "You have used Forge a lot today",
      "Slow down a bit"
    ];
    const cleanMessages = messages.filter(m => {
      if (m.role !== "assistant") return true;
      return !errorPhrases.some(phrase => (m.content || "").includes(phrase));
    });

    // Truncate to last 10 messages to fit Sarvam Starter input limit
    const recentMessages = cleanMessages.slice(-10);

    // Ensure the conversation starts with a user message (Sarvam requirement)
    while (recentMessages.length > 0 && recentMessages[0].role !== "user") {
      recentMessages.shift();
    }

    const sarvamMessages = [
      { role: "system", content: systemPrompt },
      ...recentMessages.map(m => ({ role: m.role, content: m.content })),
    ];

    const sarvamRes = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": process.env.SARVAM_API_KEY,
      },
      body: JSON.stringify({
        model: "sarvam-m",
        messages: sarvamMessages,
        stream: false,
        max_tokens: useProPlus ? 1400 : userIsPro ? 1000 : 700,
        reasoning_effort: useProPlus ? "medium" : userIsPro ? "low" : "low",
        temperature: useProPlus ? 0.6 : userIsPro ? 0.65 : 0.7,
      }),
    });

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      console.error("Sarvam error:", errText);

      // Try to extract a useful error message from Sarvam's response
      let userMessage = "AI service had an issue. Please try again.";
      try {
        const errJson = JSON.parse(errText);
        if (errJson?.error?.message) {
          if (errJson.error.message.includes("max_tokens")) {
            userMessage = "Sorry, your message hit a length limit. Try a shorter question.";
          } else if (errJson.error.message.includes("rate")) {
            userMessage = "AI service is busy right now. Try again in a moment.";
          }
        }
      } catch {}

      return NextResponse.json({ error: "ai_error", message: userMessage }, { status: 500 });
    }

    const sarvamData = await sarvamRes.json();
    let assistantText = sarvamData?.choices?.[0]?.message?.content || "";

    // Robust <think> stripping — covers all leak patterns
    // 1. Standard closed think blocks
    assistantText = assistantText.replace(/<think>[\s\S]*?<\/think>/g, "");
    // 2. Unclosed think at start (we ran out of tokens during reasoning)
    if (assistantText.trim().startsWith("<think>")) {
      assistantText = "";
    }
    // 3. Reasoning prose that leaked without tags — detect common starters
    const reasoningStarters = /^(Wait,|Okay,|Hmm,|Let me think|First, let me|The user is asking|The assistant should|I need to|I should consider|Looking at the user)/i;
    if (reasoningStarters.test(assistantText.trim())) {
      // The whole response is leaked reasoning — strip everything before the first real answer marker
      // Real answers usually have a sentence-ending period followed by a new paragraph or a heading
      const match = assistantText.match(/\n\n(?=[A-Z]|\*|#|-)/);
      if (match) {
        assistantText = assistantText.slice(match.index + 2);
      } else {
        // Couldn't find a clean break - it's all reasoning, return a fallback
        assistantText = "Sorry, I got stuck thinking. Could you ask again?";
      }
    }
    // 4. Stray tags or fragments
    assistantText = assistantText
      .replace(/<\/?think>/g, "")
      .replace(/<\/?\w*$/g, "") // dangling open tag at end (e.g. "</")
      .trim();

    const words = assistantText.split(/(\s+)/);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for (const word of words) {
          controller.enqueue(encoder.encode(word));
          await new Promise(r => setTimeout(r, 18));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
