import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("priorities")
    .select("*")
    .eq("user_id", user.id)
    .eq("done", false)
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({ priorities: data || [] });
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, urgency, source_chat_id } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const { data, error } = await supabase
    .from("priorities")
    .insert({ user_id: user.id, title: title.trim(), urgency: urgency || "high", source_chat_id: source_chat_id || null })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ priority: data });
}

export async function PATCH(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, done } = await request.json();
  await supabase.from("priorities").update({ done, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  await supabase.from("priorities").delete().eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
