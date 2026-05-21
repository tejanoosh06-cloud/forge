import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("achievements")
    .select(`*, profiles(full_name, avatar_url, company_name)`)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(30);

  return NextResponse.json({ achievements: data || [] });
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, emoji } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  // Auto-post to community feed too
  const { data, error } = await supabase
    .from("achievements")
    .insert({ user_id: user.id, title: title.trim(), description: description?.trim(), emoji: emoji || "🏆" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mirror to community posts
  await supabase.from("community_posts").insert({
    user_id: user.id,
    content: `${emoji || "🏆"} **${title.trim()}**${description ? `\n${description.trim()}` : ""}`,
    post_type: "achievement",
    emoji: emoji || "🏆"
  });

  return NextResponse.json({ achievement: data });
}
