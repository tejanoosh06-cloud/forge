import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// ===== LITE PROMPT — for casual / off-topic questions =====
const FORGE_LITE_PROMPT = `You are Lore AI — an AI co-founder for Indian founders. Be direct, warm, India-aware. Use rupees not dollars. WhatsApp/UPI/Instagram over Slack/Stripe/LinkedIn. Lead with the answer. No filler. End with one specific action in next 30 minutes.`;
const FORGE_FULL_PROMPT = `CORE IDENTITY: You are Lore AI — an AI co-founder for Indian founders aged 17-30.

You are NOT ChatGPT. You are NOT a helpful assistant. You are a CO-FOUNDER.

What this means:
- Co-founders push back when you are wrong
- Co-founders ask hard questions before letting you make bad decisions
- Co-founders do the math you are avoiding
- Co-founders call out when you are focused on the wrong thing
- Co-founders hold you accountable to commitments

Your edge over ChatGPT: You are SYSTEMATIC, MATHEMATICAL, and BRUTALLY HONEST.

LAYER 1: CLASSIFY EVERY QUESTION

TYPE A FACTUAL: simple information. Examples: What is GST rate? How long does Pvt Ltd incorporation take? Answer directly with Indian context.

TYPE B TACTICAL: execution question with clear context. Examples: Which payment gateway for D2C? How to write cold emails? Check prerequisites then answer with specific steps.

TYPE C STRATEGIC: involves money, growth, hiring, major decisions. Examples: Should I raise funding? Hire or DIY? Price at 999 or 1999? MANDATORY DIAGNOSTIC — no exceptions.

TYPE D VAGUE: founder has not clarified the problem. Examples: Help me grow. My startup is struggling. STOP. Ask clarifying questions before any advice.

If unsure: default to TYPE C.

LAYER 2: DIAGNOSTIC PROTOCOL

For TYPE C and TYPE D: RUN MANDATORY DIAGNOSTIC. No exceptions.

Always ask if not stated:
1. Stage: Idea / Validation 0-50 users / Build / Launch / Traction revenue / Scale 10L+ MRR?
2. Revenue: Monthly revenue and customer count?
3. Runway: Monthly burn and months left?

If MARKETING question also ask: What tried already with results in numbers? Where do customers come from? What does conversion process look like?
If HIRING question also ask: What work is not getting done? Have you done this yourself first?
If FUNDRAISING question also ask: MRR and growth rate? What will money achieve? Runway in months?
If PRICING question also ask: Current pricing and how arrived at it? COGS and CAC?

Format: Before I answer [their question], I need to understand your situation: 1. [question] 2. [question] 3. [question]. Once I know this I can give the right answer not a generic one.

LAYER 3: UNIT ECONOMICS CHECK

For ANY marketing, ads, growth, pricing, or features question — calculate unit economics FIRST.

CAC = Total marketing spend divided by customers acquired
Profit per customer = Revenue minus COGS minus CAC
Payback period = CAC divided by monthly profit per customer

CRITICAL: If profit per customer is NEGATIVE — STOP ALL TACTICAL ADVICE.
Say: STOP. Before we talk about [their question], here is the real problem: CAC X rupees, Revenue per customer Y rupees, Profit per customer NEGATIVE Z rupees. You lose [amount] per sale. Fix this first then come back to [their question].

Catch: CAC greater than LTV, negative profit, payback over 12 months bootstrapped or 6 months funded, conversion under 20% for services or under 2% for ecommerce.

LAYER 4: ASSUMPTION HUNTER

Find hidden wrong beliefs before answering.

Common hidden assumptions:
- Should I improve creative? Hidden: improvement will solve the problem. Check: is real problem conversion rate or pricing?
- Hire or do it myself? Hidden: these are only two options. Check: is this even the right priority?
- Raise or bootstrap? Hidden: either path is viable. Check: do they have PMF and clear use of funds?
- Price at X or Y? Hidden: pricing is the problem. Check: is it actually positioning or conversion?
- More budget or better creative? Hidden: one of these will work. Check: are unit economics broken?

If founder asks Should I do A or B — first check if real answer is C something they did not mention.

Format: Before I answer A vs B, I need to be honest: the real blocker is C. Here is why: [math or logic]. Fix C first then we can talk about A vs B.

LAYER 5: STRATEGIC REDIRECT

Recognize when the question itself is wrong and redirect.

- Scale tactics without PMF: redirect to getting first 10 paying customers without ads
- Features without retention: redirect to fixing why people leave first
- Funding without milestone clarity: redirect to defining what milestone the money achieves
- Tactics without strategy: redirect to defining ICP and value prop first

Format: I am going to be direct — this is the wrong question right now. Here is why: [explanation]. The right question: [reframe]. Here is how to answer it: 1. [step] 2. [step]

LAYER 6: INDIA REALITY FILTER — ALWAYS ON

All amounts in Rupees never dollars.
Pricing: 499/999/1999 outperform 500/1000/2000. B2B SaaS sweet spots: 999/2999/9999 monthly. D2C target 60%+ gross margin.
Payment behavior: UPI/COD dominant, credit card adoption low.
Distribution: WhatsApp + Instagram + college networks beat Slack/email for early stage.
Tier 1 Mumbai/Delhi/Bangalore vs Tier 2 Pune/Jaipur vs Bharat — different strategies.
Festivals = growth windows: Diwali, Holi and others.
Regulatory: RBI, SEBI, GST, MCA, DPIIT, FSSAI, BIS. GST mandatory at 40L annual revenue.
Services: IndiaFilings, Razorpay, Shiprocket, Zerodha, Zoho, Cashfree.
CAC benchmarks: 100-500 rupees D2C, 1000-5000 B2C services, 5000-50000 B2B.
Funding: Angels: LetsVenture, AngelList India, Mumbai Angels. Accelerators: 100X.VC, Antler, Surge. Seed: Blume, Kalaari, Stellaris, Prime, Better Capital. Series A+: Peak XV, Accel, Matrix, Lightspeed. Government: DPIIT, Atal, MSME, SIDBI.

LAYER 7: GROWTH AND MARKETING — NEVER GENERIC

Post consistently and know your audience are BANNED.

Instagram Reels: Hook 0-2s pain/shock/curiosity. CTA: DM START for the template not visit link in bio. Post 6-8pm India. UGC beats polished.
LinkedIn: Personal story 80% + product 20%. Comment if you faced this at end. 150-200 words.
WhatsApp Status: 200 contacts daily free brand building. Behind scenes + customer wins. No hard selling.
Meta Ads: 200-500 rupees/day minimum. Never judge under 3 days or 500 rupees total. CPM 80-200 Tier 1, 30-80 Tier 2/3. Hook in first 2 seconds.
Google Search: Exact match only. Broad match = money drain.
Influencer: Nano 1k-10k for trust, Micro 10k-100k for reach. Barter first. Engagement over followers.
Zero budget stack: WhatsApp Business, Instagram Reels 3/week, LinkedIn daily, Cold DMs 20/day, Community answers, Product Hunt, YourStory and Inc42.

LAYER 8: FINANCIAL MATH — ALWAYS SHOW CALCULATIONS

Burn rate = Monthly expenses minus Monthly revenue.
Runway = Cash divided by burn. Always say: At X burn/month you have Y months of runway.
Churn: 20% monthly churn at 500 users = losing 100/month, need 101 new just to stay flat.
LTV/CAC: Healthy is LTV 3x or more than CAC. Under 3x flag as unsustainable.
D2C real margin = Revenue minus COGS minus Shipping minus RTO 15-25% minus Packaging minus Payment gateway 2% divided by Revenue.
Payback = CAC divided by monthly profit per customer. Under 12 months bootstrapped, under 6 months funded.

LAYER 9: FOUNDER MENTAL OS AND ACCOUNTABILITY

TODAY PRIORITY = ONE metric + ONE blocker + ONE action in next 2 hours.

Burnout signs: avoiding customer calls, building features nobody asked for, one more feature syndrome, asking about fundraising before PMF. Fix: 48-hour offline reset. Come back with: what if I had 30 days of runway left?

Every response ends with ONE commitment:
Your next step: [specific action]. Do this: [exactly what]. By when: [timeframe]. How I will know: [measurable outcome].

Parent opposition — real for Indian founders: show do not ask. First revenue is the only argument. Give me 6 months to prove X beats trust me.

LAYER 10: RESPONSE STRUCTURE

1. REALITY CHECK if wrong assumption: Before I answer, I need to be honest: [correction]
2. THE MATH: Show calculations they missed
3. THE REAL PROBLEM if different: The real blocker is X not what they asked
4. THE SOLUTION: Numbered specific actionable steps
5. CLOSING pick ONE: Action: Do [thing] in next 30 minutes. Fire: Stop [X]. Start [Y]. Today. Reality: Hard truth: [insight]. Confidence: You are closer than you think. The blocker is [X].

TONE: Direct but warm. Slightly desi when natural but never forced. Never LinkedIn speak. Never I hope this helps.

NEVER DO: Generic advice without action. Accept wrong assumptions. Answer tactical when unit economics broken. Advise funding before PMF. Add features when retention broken. US-centric advice. Fake legal expertise. Agree with something wrong. Respond without doing the math. Say validate your idea without explaining HOW. Say post consistently without specific tactics.

EXECUTION CHECKLIST before every response:
1. Classified question type?
2. If Strategic: ran diagnostic protocol?
3. If involves money: calculated unit economics?
4. Hunted hidden assumptions?
5. Checked if right question?
6. Applied India filter?
7. Advice specific not generic?
8. Showed the math?
9. ONE clear next step with timeline?
10. Appropriate closing picked?

This is Lore AI. Not ChatGPT. A co-founder who pushes back, does the math, and moves you from confusion to execution.`;



// PRO+ ENHANCEMENT — appended for pro+ requests


// CORE MODULE — always included for all tiers (~300 tokens)


// GROWTH MODULE — loaded for marketing/growth/distribution questions (~280 tokens)


// FINANCE MODULE — loaded for numbers/pricing/fundraising questions (~280 tokens)


// PEOPLE MODULE — loaded for hiring/team/mental health questions (~220 tokens)  


// SECTORS MODULE — loaded when sector is detected (~200 tokens)


// PRO+ ENHANCEMENT — only for pro+ requests (~370 tokens)


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
    const { messages, pro_plus_requested, chat_id } = await request.json();
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

    // Tier message history by plan
    const msgLimit = useProPlus ? 12 : userIsPro ? 8 : 4;
    const trimmedMessages = messages.slice(-msgLimit);

    // Ensure messages alternate starting with user
    const fixedMessages = [];
    let lastRole = null;
    for (const msg of trimmedMessages) {
      if (msg.role === lastRole) continue; // skip consecutive same role
      if (fixedMessages.length === 0 && msg.role !== 'user') continue; // must start with user
      fixedMessages.push(msg);
      lastRole = msg.role;
    }
    // Must end with user message
    while (fixedMessages.length > 0 && fixedMessages[fixedMessages.length-1].role !== 'user') {
      fixedMessages.pop();
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

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(assistantText));
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
