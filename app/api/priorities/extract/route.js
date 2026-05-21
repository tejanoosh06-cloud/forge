import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ priorities: [] });

  const { message, chat_id } = await request.json();
  if (!message || message.length < 30) return NextResponse.json({ priorities: [] });

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: `Extract HIGH PRIORITY action items from this AI response to a founder. 
Only extract things that are urgent, critical, or explicitly marked as the most important next step.
Return JSON only — no markdown, no explanation:
{"priorities": [{"title": "short action item under 60 chars", "urgency": "high|medium"}]}
Return empty array if nothing urgent found.
Max 2 items.

AI response:
${message.slice(0, 800)}`
      }]
    });

    const text = response.content[0]?.text || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    const items = parsed.priorities || [];

    // Save to DB
    for (const item of items.slice(0, 2)) {
      if (item.title?.trim()) {
        await supabase.from("priorities").insert({
          user_id: user.id,
          title: item.title.trim().slice(0, 80),
          urgency: item.urgency || "high",
          source_chat_id: chat_id || null
        });
      }
    }

    return NextResponse.json({ priorities: items });
  } catch (e) {
    console.error("[priorities] extract failed:", e);
    return NextResponse.json({ priorities: [] });
  }
}
