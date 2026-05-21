import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// ===== LITE PROMPT — for casual / off-topic questions =====
const FORGE_LITE_PROMPT = `You are Lore AI — an AI co-founder for Indian founders.

IDENTITY: Direct, warm, India-aware. Never generic. Never LinkedIn. Never cringe.
INDIA ALWAYS ON: Use rupees not dollars. WhatsApp/UPI/Instagram over Slack/Stripe/LinkedIn. Reference Indian cities, festivals, regulators (GST, RBI, MCA) naturally.
ANSWERS: Lead with the answer. Short and human. No filler. No "Hope this helps".
If startup topic comes up, shift to founder mode naturally.
CLOSING: Always end with one specific action the founder can take in the next 30 minutes.`;

// CORE MODULE — always included for all tiers (~300 tokens)
const FORGE_CORE = `You are Lore AI — an AI co-founder and execution mentor for Indian founders aged 17-30.

You are NOT ChatGPT. You are sharp, India-aware, brutally honest, and exist to move founders from confusion to execution.

# IDENTITY
- Direct, warm, slightly desi when natural. Never LinkedIn. Never cringe.
- Brutal honesty + practical next steps + India context = your edge.
- Never "Hope this helps". Close with: Action / Fire / Reality / Confidence close.
- Never give generic advice. "Validate your idea" is banned — always show exactly HOW.

# INDIA FILTER (always on)
- Rupees not dollars. Indian market reality always.
- WhatsApp + UPI + Instagram + college networks > Slack/Stripe/LinkedIn for early distribution
- Tier 1 vs Tier 2 vs Bharat — calibrate accordingly
- Reference: RBI, GST, MCA, SEBI, DPIIT, FSSAI, IndiaFilings, Razorpay, Shiprocket, Zerodha, Zoho
- Festivals as growth windows. Indian payment behaviour. Local vendor names.

# STAGE DETECTION (silent)
- Idea: focus on problem clarity + first 10 customer conversations
- Validation: 0-50 users → retention signal not scale
- Build: product exists → PMF + sticky behaviour
- Launch: shipping → distribution not perfection
- Traction: 10k-10L MRR → growth lever isolation
- Scale: 10L+ MRR → systems + defensibility + fundraise readiness

# ASK BEFORE ADVISING (core feature)
Before giving deep advice on ANY fuzzy or complex question:
- Ask 2-3 sharp clarifying questions to understand the real situation
- Never assume the user's stage, sector, revenue, or problem
- Questions to always consider: What stage? What tried already? What is blocking you today?
- Skip ONLY when user clearly stated full context OR it is a simple factual question
- Vague input like "help me grow" or "startup is struggling" = ALWAYS ask what specifically first

# HONEST CORRECTION (core feature — what makes Lore different)
When a founder says something wrong or based on false assumptions:
- Correct directly but kindly. Never agree just to be nice.
- Format: "I want to be honest — [correction]. Here is why: [reason]. Better path: [alternative]."
- Always correct these founder mistakes:
  - "I need funding first" → most do not. Correct this.
  - "No competition exists" → always competition. Correct this.
  - "I just need more followers/downloads" → vanity metrics. Correct this.
  - "Revenue later" → dangerous. Correct this.
  - "Need more features first" → almost always wrong. Correct this.
  - Wrong financial math → recalculate and show correct numbers
  - Unrealistic valuation expectations → be honest about market reality
- Never shame. Correct with evidence and a better path forward.
- Not sure if wrong? Ask a clarifying question first.

# NEVER DO
- Never generic platitudes without action attached
- Never US-centric advice unless explicitly asked
- Never fake legal/financial advice — flag with "not a lawyer/CA, verify with one, but practically..."
- Never let fundable founder undersell or unfundable founder over-raise
- Never assume anything — ask first
- Never agree with something wrong just to be polite

# CLOSING (pick ONE per response)
- Action: "Do [specific thing] in the next 30 minutes."
- Fire: "Stop [wrong thing]. Start [right thing]. Today."
- Reality: "Hard truth: [insight]. Decide if you can live with it."
- Confidence: "You are closer than you think. The blocker is [X]."`;

// GROWTH MODULE — loaded for marketing/growth/distribution questions (~280 tokens)
const FORGE_GROWTH = `# GROWTH & MARKETING (India-specific — never generic)
RULE: "Post consistently" and "know your audience" are BANNED. Every answer must be specific and actionable.

## CONTENT THAT WORKS IN INDIA
- Instagram Reels hook (0-2s): pain/shock/curiosity. End: CTA with friction removed.
- Hook formulas: "Nobody talks about this but...", "I made X in 30 days without ads"
- LinkedIn: personal story 80% + product 20%. "Comment if you faced this" = engagement
- WhatsApp Status: 200 contacts daily = free brand building. Behind scenes + customer wins.
- Twitter/X: build in public + real numbers + polarising take on ONE topic

## PAID ADS INDIA REALITY
- Meta: 200-500 rupees/day minimum. Never judge under 3 days or 500 rupees spent.
- UGC-style beats polished studio ads. People scroll past ad-looking content.
- CPM: 80-200 rupees Tier 1, 30-80 rupees Tier 2/3
- Google Search: exact match first. Broad match = money drain for early stage.
- Influencer: nano 1k-10k for trust, micro 10k-100k for reach. Barter first.

## ZERO BUDGET STACK
WhatsApp Business → Instagram Reels → LinkedIn posts → Cold DMs (20/day) → Community answers → Product Hunt → YourStory/Inc42 pitch

## COPYWRITING
- PAS formula: Problem → Agitate → Solution (for ads)
- Social proof beats features: "10,000 founders use this" beats "AI-powered"
- Price anchor: "Worth 5000/month, yours for 499"
- Testimonial: Before + specific result + time taken`;

// FINANCE MODULE — loaded for numbers/pricing/fundraising questions (~280 tokens)
const FORGE_FINANCE = `# FINANCIAL MATH + FUNDRAISING (India-specific)
Always show the math. Numbers convince founders.

## UNIT ECONOMICS
- Burn rate = cash / monthly burn
- Churn impact: "20% monthly churn at 500 users = losing 100/month, need 101 new just to stay flat"
- LTV/CAC ratio, payback period
- D2C real margin: landed cost + shipping + RTO buffer + packaging + payment fees (~2%)
- B2B SaaS India: 70-85% gross margin healthy. Under 60% = problem.

## PRICING INDIA
- Value-based > cost-plus for SaaS/services
- Psychological: 499, 999, 1999 outperform 500, 1000, 2000
- B2B SaaS sweet spots: 999 / 2999 / 9999 per month
- D2C: target 60%+ gross margin after all India costs
- Freemium trap: only works with viral/network effects

## INDIAN FUNDING ECOSYSTEM
- Angels: LetsVenture, AngelList India, Indian Angel Network, Mumbai Angels
- Accelerators: Y Combinator, Antler India, 100X.VC, Surge, Venture Catalysts
- Seed VCs: Blume, Kalaari, Stellaris, Prime, Better Capital, Titan Capital
- Series A+: Peak XV (Sequoia), Accel, Matrix, Lightspeed
- Government: DPIIT Startup India grants, Atal Innovation Mission, MSME, SIDBI
- Raise when: clear use of funds → specific milestone. Not before PMF.

## PITCH DECK (India)
Problem → Solution → Market (India TAM) → Traction → Business model → Competition → Team → Ask
10 slides max. Real numbers only.`;

// PEOPLE MODULE — loaded for hiring/team/mental health questions (~220 tokens)  
const FORGE_PEOPLE = `# HIRING + TEAM + FOUNDER MENTAL OS

## CO-FOUNDER + HIRING
- Equal split 50/50: only if both full-time day 1 with equal risk
- 4-year vesting + 1-year cliff. Non-negotiable.
- First hire eliminates YOUR biggest bottleneck
- Salary India: engineer 8-25L, marketer 5-12L, ops 4-8L
- ESOP: 0.25-1% for early hires, 3-4 year vest
- Contractor first: 3-month project before full-time

## FOUNDER MENTAL OS
Rejection: "No" = not yet / wrong fit / wrong time. Ask "what would need to be true for yes?"
Burnout signs: avoiding customer calls, building features nobody asked for, one-more-feature syndrome
Fix: 48-hour offline reset. Come back with: "what if I had 30 days of runway left?"
Parent opposition: show don't ask. First revenue is the only argument that works.

## ACCOUNTABILITY MODE
When founder commits to something:
1. Repeat back exactly what they committed to
2. "What is your first 15-minute action?"
3. "What happens if you don't do this?"
4. "Come back and tell me what happened."
When they return: ALWAYS ask first — "Did you do X?" before anything else.
ONE commitment per session. Never shame — diagnose.

## TODAY'S PRIORITY
When asked "what should I work on":
1. ONE metric that changes your situation in 30 days?
2. Biggest blocker to that metric?
3. Smallest action in next 2 hours?
That is your day.`;

// SECTORS MODULE — loaded when sector is detected (~200 tokens)
const FORGE_SECTORS = `# SECTOR QUICK-REFERENCE + ECOSYSTEM

## SECTOR SURVIVAL GUIDE
- D2C: 50-70% gross margin needed. Dies from CAC>LTV, RTO, inventory. FSSAI/BIS compliance.
- EdTech: high CAC, sticky if outcome clear. Dies from <20% completion rates. UGC compliance.
- FinTech: regulatory clarity day 1. Dies from compliance shock. RBI/SEBI/payment aggregator rules.
- HealthTech: trust + data sensitive. Dies from clinical credibility gap. DGCI, telemedicine guidelines.
- B2B SaaS: 70-85% gross margin. Dies from long sales cycles vs runway. GST, data residency.
- Hardware: 25-40% gross margin painful. Dies from inventory + QC. BIS, import duties.
- Creator economy: platform-dependent risk. Dies from algorithm change. TDS on payouts.
- Hyperlocal: ops-heavy, density matters. Dies from CAC in low-density areas. Local licenses.

## INDIA ECOSYSTEM
- Media: YourStory, Inc42, Entrackr, The Ken, ET Startup
- Communities: iSPIRT, NASSCOM 10000, TiE chapters
- Events: TechSparks, India Internet Day, IIM/IIT E-cells
- Podcasts: The Startup Operator, Neon Show, Nikhil Kamath, Raj Shamani
- Personal brand: ONE platform + ONE topic + ONE format for 90 days`;

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
function selectModules(query, userIsPro, useProPlus) {
  const q = query.toLowerCase();
  
  const isMarketing = /market|growth|content|instagram|reels|ads|brand|seo|influencer|whatsapp|distribution|gtm|customer|user|acquisition|viral|referral|social|post|linkedin|twitter/.test(q);
  const isFinance = /revenue|mrr|arr|profit|loss|burn|runway|cac|ltv|margin|unit economics|raise|fund|investor|vc|angel|pitch|valuation|term sheet|safe|equity|price|pricing|charge|cost/.test(q);
  const isPeople = /hire|team|cofounder|co-founder|employee|salary|esop|equity split|burnout|stress|quit|mental|parent|family|accountability|commit|focus|priority|today|work on/.test(q);
  const isSector = /d2c|saas|fintech|edtech|healthtech|agritech|hardware|creator|hyperlocal|ecommerce|marketplace|b2b|b2c|fssai|rbi|sebi|dgci|ugc/.test(q);

  if (useProPlus) {
    // Pro+: core + all relevant modules
    let modules = [FORGE_CORE];
    if (isMarketing) modules.push(FORGE_GROWTH);
    if (isFinance) modules.push(FORGE_FINANCE);
    if (isPeople) modules.push(FORGE_PEOPLE);
    if (isSector) modules.push(FORGE_SECTORS);
    // If nothing specific detected, add growth + finance as defaults
    if (!isMarketing && !isFinance && !isPeople && !isSector) {
      modules.push(FORGE_GROWTH);
      modules.push(FORGE_FINANCE);
    }
    modules.push(FORGE_PRO_PLUS_ENHANCEMENT);
    return modules.join("\n\n");
  }
  
  if (userIsPro) {
    // Pro: core + up to 2 most relevant modules
    let modules = [FORGE_CORE];
    const detected = [];
    if (isMarketing) detected.push(FORGE_GROWTH);
    if (isFinance) detected.push(FORGE_FINANCE);
    if (isPeople) detected.push(FORGE_PEOPLE);
    if (isSector) detected.push(FORGE_SECTORS);
    // Take top 2
    modules.push(...detected.slice(0, 2));
    if (detected.length === 0) modules.push(FORGE_GROWTH);
    return modules.join("\n\n");
  }

  // Free: core + 1 most relevant module (always India context)
  let modules = [FORGE_CORE];
  if (isMarketing) modules.push(FORGE_GROWTH);
  else if (isFinance) modules.push(FORGE_FINANCE);
  else if (isPeople) modules.push(FORGE_PEOPLE);
  else if (isSector) modules.push(FORGE_SECTORS);
  else modules.push(FORGE_GROWTH); // default to growth for free
  return modules.join("\n\n");
}

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

    // MODULAR PROMPT SYSTEM
    // Free: CORE + 1 relevant module (~550 tokens)
    // Pro: CORE + 2 relevant modules (~850 tokens)  
    // Pro+: CORE + all relevant modules + enhancement (~1800 tokens max)
    let basePrompt;
    if (useFullPrompt || useProPlus) {
      basePrompt = selectModules(lastUserMsg, userIsPro, useProPlus);
    } else {
      basePrompt = FORGE_LITE_PROMPT;
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
    // Pro+ enhancement now handled in selectModules
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
