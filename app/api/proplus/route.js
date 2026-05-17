import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// GET: returns whether user can use Pro+ today
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ available: false }, { status: 401 });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const { count } = await supabase
    .from("usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("action_type", "pro_plus_answer")
    .gte("created_at", todayStart);

  const available = (count || 0) < 1;

  return NextResponse.json({ available });
}
