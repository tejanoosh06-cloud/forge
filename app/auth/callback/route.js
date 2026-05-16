import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  console.log("=== AUTH CALLBACK HIT ===");
  console.log("Code received:", code ? "YES" : "NO");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("Error from Supabase:", error ? error.message : "none");
    console.log("User email:", data?.user?.email || "none");

    if (!error) {
      console.log("=== SUCCESS ===");
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  console.log("=== FAILED ===");
  return NextResponse.redirect(`${origin}/auth/error`);
}
