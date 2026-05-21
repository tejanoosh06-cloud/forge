import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const user = data.user;

      try {
        // Upsert profile
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url || null,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id", ignoreDuplicates: false });

        // Check if onboarding complete
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, what_building")
          .eq("id", user.id)
          .single();

        if (!profile?.full_name || !profile?.what_building) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      } catch (e) {
        console.error("Profile upsert error:", e);
        // Don't block login if profile fails
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
