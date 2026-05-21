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

      // Check if profile exists and onboarding is complete
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, what_building, user_number")
        .eq("id", user.id)
        .single();

      // If no profile or missing key fields → onboarding
      if (!profile || !profile.full_name || !profile.what_building) {
        // Create bare profile if doesn't exist
        if (!profile) {
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email,
            avatar_url: user.user_metadata?.avatar_url || null,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            updated_at: new Date().toISOString(),
          });
        }
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
