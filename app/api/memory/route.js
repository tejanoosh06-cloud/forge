import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

// POST: generate a memory from a chat's messages
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chat_id } = await request.json();
    if (!chat_id) return NextResponse.json({ error: "Missing chat_id" }, { status: 400 });

    // Verify user owns this chat
    const { data: chat } = await supabase
      .from("chats")
      .select("user_id, title")
      .eq("id", chat_id)
      .single();

    if (!chat || chat.user_id !== user.id) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Get the chat messages
    const { data: messages } = await supabase
      .from("messages")
      .select("role, content")
      .eq("chat_id", chat_id)
      .order("created_at", { ascending: true });

    if (!messages || messages.length < 4) {
      // Not enough content to generate a useful memory
      return NextResponse.json({ skipped: true, reason: "Too few messages" });
    }

    // Build the conversation transcript for summarization
    const transcript = messages
      .map(m => `${m.role === "user" ? "User" : "Forge"}: ${m.content}`)
      .join("\n\n");

    // Truncate if too long (keep last 8000 chars to stay within token limits)
    const truncatedTranscript = transcript.length > 8000
      ? "..." + transcript.slice(-8000)
      : transcript;

    // Ask Sarvam to summarize into a 2-3 sentence memory
    const summaryPrompt = `You are an AI memory generator. Read this founder conversation and extract a short, factual memory (2-3 sentences max) that captures:
- What the founder is working on or considering
- Key decisions made or being weighed
- Important context (budget, stage, sector, blockers)
- Action items or next steps mentioned

DO NOT include greetings, off-topic chat, or generic advice. Be specific. Use third person ("The founder is...").

If the conversation has NO useful founder context (just casual chat or off-topic), respond with exactly: SKIP

Conversation:
${truncatedTranscript}

Memory (2-3 sentences, factual, in third person):`;

    const sarvamRes = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": process.env.SARVAM_API_KEY,
      },
      body: JSON.stringify({
        model: "sarvam-m",
        messages: [{ role: "user", content: summaryPrompt }],
        stream: false,
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      console.error("Sarvam memory error:", errText);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 500 });
    }

    const sarvamData = await sarvamRes.json();
    let memoryText = sarvamData?.choices?.[0]?.message?.content || "";

    // Strip think blocks
    memoryText = memoryText
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .replace(/<think>[\s\S]*$/g, "")
      .replace(/<\/?think>/g, "")
      .trim();

    // If the AI said SKIP, don't save anything
    if (memoryText.toUpperCase().includes("SKIP") || memoryText.length < 20) {
      return NextResponse.json({ skipped: true, reason: "Not useful content" });
    }

    // Save the memory
    const { data: saved, error } = await supabase
      .from("user_memories")
      .insert({
        user_id: user.id,
        chat_id: chat_id,
        memory_text: memoryText,
      })
      .select()
      .single();

    if (error) {
      console.error("Memory save error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ memory: saved });
  } catch (error) {
    console.error("Memory generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: list user's memories
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_memories")
    .select("id, memory_text, created_at, chat_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ memories: data || [] });
}

// DELETE: delete a specific memory (or all memories if no id)
export async function DELETE(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const memoryId = searchParams.get("id");

  let query = supabase.from("user_memories").delete().eq("user_id", user.id);
  if (memoryId) query = query.eq("id", memoryId);

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
