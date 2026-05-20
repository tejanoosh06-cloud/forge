import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: list all chats for current user
export async function GET(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const projectId = url.searchParams.get("project_id");

  let query = supabase
    .from("chats")
    .select("id, title, project_id, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (projectId === "none") {
    query = query.is("project_id", null);
  } else if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ chats: data || [] });
}

// POST: create new chat
export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, project_id } = await request.json();
  const insertData = { user_id: user.id, title: title || "New chat" };
  if (project_id) insertData.project_id = project_id;

  const { data, error } = await supabase
    .from("chats")
    .insert(insertData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ chat: data });
}

// PATCH: update chat (e.g. move to project)
export async function PATCH(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, project_id } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const update = { updated_at: new Date().toISOString() };
  update.project_id = project_id || null;

  const { error } = await supabase
    .from("chats")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
