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
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white flex flex-col">

      {/* Brand gradient orbs - matching the Lore AI PDF colors exactly */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-amber" />
        <div className="orb orb-maroon" />
        <div className="orb orb-coral" />
        <div className="orb orb-teal" />
      </div>

      {/* Subtle noise texture */}
      <div className="absolute inset-0 noise pointer-events-none opacity-[0.025]" />

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">

        <h1 className="fade-in font-bold tracking-tight leading-[1] mb-5" style={{ animationDelay: "0s", fontSize: "clamp(56px, 10vw, 112px)", letterSpacing: "-0.05em" }}>
          Lore AI<span className="text-orange-500">.</span>
        </h1>

        <p className="fade-in text-white/60 mb-14 font-light" style={{ animationDelay: "0.15s", fontSize: "clamp(16px, 1.8vw, 20px)", letterSpacing: "0.01em" }}>
          From idea to execution.
        </p>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="fade-in group relative inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-full bg-white text-black text-[14px] font-medium hover:bg-white/90 transition-all disabled:opacity-50"
          style={{ animationDelay: "0.3s" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>{loading ? "Signing in..." : "Continue with Google"}</span>
        </button>
      </main>

      <footer className="relative z-10 pb-8 flex items-center justify-center gap-6 text-[12px] text-white/30">
        <a href="/privacy" className="hover:text-white/60 transition-colors">Privacy</a>
        <span className="text-white/15">·</span>
        <a href="/terms" className="hover:text-white/60 transition-colors">Terms</a>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap');

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #000;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
        }

        /* Top-left: warm amber/peach */
        .orb-amber {
          width: 800px; height: 800px;
          background: radial-gradient(circle, #f4a261 0%, #e89149 40%, transparent 70%);
          top: -300px; left: -300px;
          opacity: 0.55;
          animation: float1 24s ease-in-out infinite;
        }

        /* Center-left: deep maroon/purple — bridges amber to dark */
        .orb-maroon {
          width: 600px; height: 600px;
          background: radial-gradient(circle, #6b4564 0%, #4a2d4a 40%, transparent 70%);
          top: 15%; left: 8%;
          opacity: 0.5;
          animation: float2 28s ease-in-out infinite;
        }

        /* Bottom-right: coral/pink/red — the warm reddish-pink from PDF */
        .orb-coral {
          width: 800px; height: 800px;
          background: radial-gradient(circle, #f56565 0%, #e85a4f 35%, #c44545 60%, transparent 80%);
          bottom: -300px; right: -250px;
          opacity: 0.5;
          animation: float3 26s ease-in-out infinite;
        }

        /* Upper-right: faint teal/grey accent */
        .orb-teal {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #5a7a7a 0%, #3d5a5a 40%, transparent 70%);
          top: 25%; right: 10%;
          opacity: 0.25;
          animation: float4 30s ease-in-out infinite;
        }

        @media (max-width: 640px) {
          .orb-amber { width: 450px; height: 450px; top: -150px; left: -150px; }
          .orb-maroon { width: 350px; height: 350px; }
          .orb-coral { width: 450px; height: 450px; bottom: -150px; right: -150px; }
          .orb-teal { width: 300px; height: 300px; opacity: 0.18; }
        }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, 30px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-40px, 50px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-60px, -40px) scale(1.05); }
        }
        @keyframes float4 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 40px); }
        }

        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          opacity: 0;
          animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
