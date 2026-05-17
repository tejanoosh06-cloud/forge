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
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-neutral-100 px-6">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-semibold mb-3 tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-300 bg-clip-text text-transparent">
            Welcome to Forge
          </span>
        </h1>
        <p className="text-neutral-500 mb-12 leading-relaxed text-[15px]">
          Your AI co-founder for India. Sign in to save your conversations and project context.
        </p>

        <div className="relative w-full">
          <div className="absolute -inset-6 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-300/10 blur-3xl opacity-50 rounded-full pointer-events-none"></div>
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

        <p className="text-[11px] text-neutral-700 text-center mt-8">
          By signing in, you agree to keep your conversations with Forge private to you.
        </p>
      </div>

      <style jsx global>{`
        @keyframes forgeGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .forge-gradient-border {
          background: linear-gradient(90deg, rgba(96, 165, 250, 0.6), rgba(168, 85, 247, 0.5), rgba(244, 114, 182, 0.5), rgba(168, 85, 247, 0.5), rgba(96, 165, 250, 0.6));
          background-size: 300% 100%;
          animation: forgeGradient 8s ease infinite;
        }
      `}</style>

      <div className="absolute bottom-6 left-0 right-0 text-center text-[12px]">
        <a href="/privacy" className="text-neutral-400 hover:text-neutral-200 transition-colors mr-5 underline-offset-4 hover:underline">Privacy Policy</a>
        <a href="/terms" className="text-neutral-400 hover:text-neutral-200 transition-colors underline-offset-4 hover:underline">Terms of Service</a>
      </div>
    </div>
  );
}
