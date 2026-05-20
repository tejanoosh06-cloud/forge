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
    if (error) { console.error(error); setLoading(false); }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-amber" />
        <div className="orb orb-purple" />
        <div className="orb orb-coral" />
        <div className="orb orb-pink" />
      </div>
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="fade-in font-black tracking-tight leading-none mb-4" style={{ animationDelay: "0s", fontSize: "clamp(64px, 12vw, 128px)", letterSpacing: "-0.04em" }}>
          Lore AI<span style={{ color: "#f97316" }}>.</span>
        </h1>
        <p className="fade-in text-white/50 mb-14 font-light tracking-wide" style={{ animationDelay: "0.15s", fontSize: "clamp(15px, 1.6vw, 19px)" }}>
          From idea to execution.
        </p>
        <button onClick={signInWithGoogle} disabled={loading} className="fade-in inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white text-black text-[14px] font-medium hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50" style={{ animationDelay: "0.3s" }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>{loading ? "Signing in..." : "Continue with Google"}</span>
        </button>
      </main>
      <footer className="relative z-10 pb-8 flex items-center justify-center gap-6 text-[12px] text-white/25">
        <a href="/privacy" className="hover:text-white/60 transition-colors">Privacy</a>
        <span>·</span>
        <a href="/terms" className="hover:text-white/60 transition-colors">Terms</a>
      </footer>
      <style jsx global>{`
        body { background: #000; }
        .orb { position: absolute; border-radius: 50%; filter: blur(130px); will-change: transform; }

        /* TOP-LEFT: warm amber — logo exact */
        .orb-amber {
          width: 680px; height: 680px;
          background: radial-gradient(circle, rgba(220,120,30,0.65) 0%, rgba(180,80,10,0.4) 45%, transparent 70%);
          top: -240px; left: -180px;
          animation: floatAmber 18s ease-in-out infinite;
        }

        /* CENTER: dark maroon-purple — logo exact */
        .orb-purple {
          width: 580px; height: 580px;
          background: radial-gradient(circle, rgba(90,40,80,0.55) 0%, rgba(60,20,60,0.35) 50%, transparent 70%);
          top: 15%; left: 12%;
          animation: floatPurple 24s ease-in-out infinite;
        }

        /* BOTTOM-RIGHT: salmon coral pink — logo exact */
        .orb-coral {
          width: 720px; height: 720px;
          background: radial-gradient(circle, rgba(210,90,90,0.6) 0%, rgba(180,60,70,0.38) 42%, transparent 70%);
          bottom: -240px; right: -180px;
          animation: floatCoral 20s ease-in-out infinite;
        }

        /* RIGHT: soft grey-white — logo exact */
        .orb-pink {
          width: 480px; height: 480px;
          background: radial-gradient(circle, rgba(180,175,175,0.18) 0%, rgba(140,135,135,0.09) 50%, transparent 70%);
          top: 18%; right: -60px;
          animation: floatPink 26s ease-in-out infinite;
        }

        @media (max-width: 640px) {
          .orb-amber  { width: 420px; height: 420px; top: -160px; left: -160px; }
          .orb-purple { width: 300px; height: 300px; }
          .orb-coral  { width: 440px; height: 440px; bottom: -160px; right: -160px; }
          .orb-pink   { width: 280px; height: 280px; }
        }

        @keyframes floatAmber  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(50px,35px) scale(1.06)} 66%{transform:translate(15px,60px) scale(0.97)} }
        @keyframes floatPurple { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-30px,50px)} 66%{transform:translate(30px,20px)} }
        @keyframes floatCoral  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-60px,-45px) scale(1.05)} 66%{transform:translate(-25px,-70px) scale(0.96)} }
        @keyframes floatPink   { 0%,100%{transform:translate(0,0)} 33%{transform:translate(30px,40px)} 66%{transform:translate(-15px,25px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { opacity: 0; animation: fadeIn 1s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>
    </div>
  );
}
