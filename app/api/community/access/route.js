import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FREE_LIMIT = 40;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ access: false, reason: "not_logged_in" });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro, user_number, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ access: false, reason: "no_profile" });

  const isEarlyAdopter = profile.user_number && profile.user_number <= FREE_LIMIT;
  const access = profile.is_pro || isEarlyAdopter;

  return NextResponse.json({
    access,
    is_pro: profile.is_pro || false,
    is_early_adopter: isEarlyAdopter || false,
    user_number: profile.user_number,
    reason: access ? null : "pro_required",
    free_limit: FREE_LIMIT
  });
}
