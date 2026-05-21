import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ priorities: [] });

  const { message, chat_id } = await request.json();
  if (!message || message.length < 30) return NextResponse.json({ priorities: [] });

  try {
    const res = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": process.env.SARVAM_API_KEY,
      },
      body: JSON.stringify({
        model: "sarvam-m",
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: "You extract high priority action items from AI responses. Return only valid JSON, no markdown, no explanation."
          },
          {
            role: "user",
            content: `Extract HIGH PRIORITY action items from this AI response to a founder. Only extract urgent or critical next steps. Return JSON only: {"priorities": [{"title": "short action under 60 chars", "urgency": "high"}]}. Return empty array if nothing urgent. Max 2 items.\n\nAI response:\n${message.slice(0, 600)}`
          }
        ]
      })
    });

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    const items = parsed.priorities || [];

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
