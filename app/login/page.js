"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-neutral-100 px-6">
      {/* Gradient blob background - recreates the Lore AI brand aesthetic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-left warm orange blob */}
        <div
          className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full opacity-50 blur-[120px]"
          style={{
            background: "radial-gradient(circle, #f59e0b 0%, #d97706 40%, transparent 70%)",
          }}
        />

        {/* Center-left maroon/purple blob */}
        <div
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full opacity-40 blur-[100px]"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, #5b21b6 50%, transparent 75%)",
          }}
        />

        {/* Bottom-right pink/red blob */}
        <div
          className="absolute -bottom-32 -right-32 w-[700px] h-[700px] rounded-full opacity-50 blur-[120px]"
          style={{
            background: "radial-gradient(circle, #fb7185 0%, #e11d48 40%, transparent 70%)",
          }}
        />

        {/* Center-right teal/grey accent */}
        <div
          className="absolute top-2/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-25 blur-[100px]"
          style={{
            background: "radial-gradient(circle, #14b8a6 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md flex flex-col items-center text-center">
          {/* Logo */}
          <h1 className="text-6xl md:text-7xl font-bold mb-3 tracking-tight text-white drop-shadow-lg">
            Lore AI<span className="text-orange-500">.</span>
          </h1>

          {/* Tagline */}
          <p className="text-neutral-300 mb-14 text-[15px] font-light tracking-wide">
            From idea to execution.
          </p>

          {/* Sign-in button */}
          <div className="relative w-full">
            <div className="absolute -inset-6 bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-pink-400/10 blur-3xl opacity-60 rounded-full pointer-events-none"></div>
            <div className="relative rounded-2xl p-[1.5px] forge-gradient-border">
              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full bg-neutral-950/90 backdrop-blur-2xl rounded-2xl px-6 py-4 flex items-center justify-center gap-3 text-[15px] font-medium text-neutral-100 hover:bg-neutral-900 transition-colors disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {loading ? "Signing in..." : "Continue with Google"}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-neutral-500 text-center mt-8">
            By signing in, you agree to keep your conversations with Lore AI private to you.
          </p>
        </div>
      </div>

      {/* Footer with legal links */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-[12px] z-10">
        <a href="/privacy" className="text-neutral-400 hover:text-white transition-colors mr-6">
          Privacy Policy
        </a>
        <a href="/terms" className="text-neutral-400 hover:text-white transition-colors">
          Terms of Service
        </a>
      </div>

      <style jsx global>{`
        @keyframes forgeGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .forge-gradient-border {
          background: linear-gradient(90deg, rgba(245, 158, 11, 0.6), rgba(168, 85, 247, 0.5), rgba(244, 114, 182, 0.5), rgba(168, 85, 247, 0.5), rgba(245, 158, 11, 0.6));
          background-size: 300% 100%;
          animation: forgeGradient 8s ease infinite;
        }
      `}</style>
    </div>
  );
}
