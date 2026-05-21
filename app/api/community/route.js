import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FREE_LIMIT = 40;

async function canAccessCommunity(supabase, user) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro, user_number")
    .eq("id", user.id)
    .single();
  if (!profile) return false;
  if (profile.is_pro) return true;
  if (profile.user_number && profile.user_number <= FREE_LIMIT) return true;
  return false;
}

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hasAccess = await canAccessCommunity(supabase, user);
  if (!hasAccess) return NextResponse.json({ error: "pro_required" }, { status: 403 });

  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "all";

  let query = supabase
    .from("community_posts")
    .select(`*, profiles(full_name, avatar_url, company_name, user_number)`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (type !== "all") query = query.eq("post_type", type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Check which posts the current user liked
  const postIds = (data || []).map(p => p.id);
  let likedIds = new Set();
  if (postIds.length > 0) {
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", postIds);
    likedIds = new Set((likes || []).map(l => l.post_id));
  }

  const posts = (data || []).map(p => ({ ...p, liked_by_me: likedIds.has(p.id) }));
  return NextResponse.json({ posts, access: true });
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hasAccess = await canAccessCommunity(supabase, user);
  if (!hasAccess) return NextResponse.json({ error: "pro_required" }, { status: 403 });

  const { content, post_type, emoji } = await request.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const { data, error } = await supabase
    .from("community_posts")
    .insert({ user_id: user.id, content: content.trim(), post_type: post_type || "message", emoji: emoji || "💬" })
    .select(`*, profiles(full_name, avatar_url, company_name, user_number)`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: { ...data, liked_by_me: false } });
}

export async function DELETE(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  const { error } = await supabase.from("community_posts").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
