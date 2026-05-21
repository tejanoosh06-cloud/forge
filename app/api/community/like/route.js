import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { post_id, unlike } = await request.json();

  if (unlike) {
    await supabase.from("post_likes").delete().eq("post_id", post_id).eq("user_id", user.id);
    await supabase.from("community_posts").update({ likes_count: supabase.rpc ? undefined : 0 }).eq("id", post_id);
    const { data } = await supabase.from("post_likes").select("id", { count: "exact" }).eq("post_id", post_id);
    await supabase.from("community_posts").update({ likes_count: data?.length || 0 }).eq("id", post_id);
  } else {
    await supabase.from("post_likes").insert({ post_id, user_id: user.id });
    const { count } = await supabase.from("post_likes").select("*", { count: "exact", head: true }).eq("post_id", post_id);
    await supabase.from("community_posts").update({ likes_count: count || 0 }).eq("id", post_id);
  }

  return NextResponse.json({ ok: true });
}
