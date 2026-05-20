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
        .orb { position: absolute; border-radius: 50%; filter: blur(120px); will-change: transform; }
        .orb-amber  { width: 700px; height: 700px; background: radial-gradient(circle, rgba(251,146,60,0.9) 0%, rgba(234,88,12,0.6) 40%, transparent 70%); top: -250px; left: -200px; animation: floatAmber 20s ease-in-out infinite; }
        .orb-purple { width: 650px; height: 650px; background: radial-gradient(circle, rgba(109,40,150,0.8) 0%, rgba(76,29,149,0.6) 40%, transparent 70%); top: 10%; left: 15%; animation: floatPurple 26s ease-in-out infinite; }
        .orb-coral  { width: 750px; height: 750px; background: radial-gradient(circle, rgba(239,68,68,0.8) 0%, rgba(220,38,38,0.5) 40%, transparent 70%); bottom: -250px; right: -200px; animation: floatCoral 22s ease-in-out infinite; }
        .orb-pink   { width: 500px; height: 500px; background: radial-gradient(circle, rgba(236,72,153,0.6) 0%, rgba(219,39,119,0.3) 40%, transparent 70%); top: 20%; right: 5%; animation: floatPink 28s ease-in-out infinite; }
        @media (max-width: 640px) {
          .orb-amber  { width: 400px; height: 400px; top: -150px; left: -150px; }
          .orb-purple { width: 380px; height: 380px; }
          .orb-coral  { width: 420px; height: 420px; bottom: -150px; right: -150px; }
          .orb-pink   { width: 300px; height: 300px; }
        }
        @keyframes floatAmber  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,40px) scale(1.08)} 66%{transform:translate(20px,70px) scale(0.95)} }
        @keyframes floatPurple { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-50px,60px)} 66%{transform:translate(40px,30px)} }
        @keyframes floatCoral  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-70px,-50px) scale(1.06)} 66%{transform:translate(-30px,-80px) scale(0.97)} }
        @keyframes floatPink   { 0%,100%{transform:translate(0,0)} 33%{transform:translate(40px,50px)} 66%{transform:translate(-20px,30px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { opacity: 0; animation: fadeIn 1s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>
    </div>
  );
}
