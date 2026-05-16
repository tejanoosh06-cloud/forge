import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chat_id, role, content } = await request.json();
  if (!chat_id || !role || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({ chat_id, role, content })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // bump the chat's updated_at
  await supabase
    .from("chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", chat_id);

  return NextResponse.json({ message: data });
}
