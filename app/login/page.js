"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const arr = Array.from({ length: 350 }, (_, i) => {
      const size = Math.random();
      let r, o;
      // 60% tiny pixel stars, 30% small, 10% bright accent stars
      if (size < 0.6) { r = 0.4; o = Math.random() * 0.5 + 0.3; }
      else if (size < 0.9) { r = 0.6; o = Math.random() * 0.4 + 0.6; }
      else { r = 0.9; o = Math.random() * 0.3 + 0.7; }
      return {
        x: Math.random() * 100,
        y: Math.random() * 50,
        r,
        o,
        twinkle: i % 7 === 0,
        delay: Math.random() * 8,
        duration: Math.random() * 3 + 2,
      };
    });
    setStars(arr);
  }, []);

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

  const linkStyle = {
    color: "rgba(255,255,255,0.5)",
    fontSize: "13px",
    fontFamily: "'Inter', -apple-system, sans-serif",
    textDecoration: "none",
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#08060A] text-white">
      <div
        className="absolute inset-0 earth-bg"
        style={{
          backgroundImage: "url('/earth.png')",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: "60%",
          background: "linear-gradient(180deg, rgba(8,6,10,0.5) 0%, rgba(8,6,10,0.2) 50%, rgba(8,6,10,0) 100%)",
        }}
      />

      <svg
        className="absolute inset-x-0 top-0 w-full pointer-events-none"
        style={{ height: "55vh" }}
        preserveAspectRatio="none"
        viewBox="0 0 100 55"
      >
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r * 0.08}
            fill="white"
            opacity={s.o}
            style={{
              filter: s.r > 0.7 ? "drop-shadow(0 0 0.3px rgba(255,255,255,0.8))" : "none",
              animation: s.twinkle ? `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite` : "none",
            }}
          />
        ))}
      </svg>

      <div className="relative z-10 h-full flex flex-col items-center px-6" style={{ paddingTop: "18vh" }}>
        <h1
          className="font-bold tracking-tight text-white text-center fade-in-up"
          style={{
            fontSize: "clamp(48px, 8vw, 96px)",
            letterSpacing: "-2px",
            lineHeight: 1,
            fontFamily: "'Inter', -apple-system, sans-serif",
            textShadow: "0 4px 30px rgba(0,0,0,0.6)",
          }}
        >
          Lore AI
          <span
            style={{
              display: "inline-block",
              width: "0.13em",
              height: "0.13em",
              borderRadius: "50%",
              background: "#F97316",
              marginLeft: "6px",
              verticalAlign: "middle",
              marginBottom: "0.08em",
            }}
          ></span>
        </h1>

        <p
          className="text-center fade-in-up"
          style={{
            fontSize: "clamp(15px, 2.2vw, 22px)",
            color: "rgba(255,255,255,0.9)",
            marginTop: "14px",
            letterSpacing: "-0.3px",
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontWeight: 400,
            textShadow: "0 2px 20px rgba(0,0,0,0.7)",
          }}
        >
          From idea to execution.
        </p>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="fade-in-up-delay"
          style={{
            marginTop: "32px",
            background: "rgba(20, 17, 25, 0.85)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "100px",
            padding: "13px 28px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: loading ? "default" : "pointer",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            transition: "all 0.2s ease",
            color: "white",
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontWeight: 500,
            fontSize: "15px",
            opacity: loading ? 0.6 : 1,
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
          }}
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

      <div className="absolute left-0 right-0 z-20 text-center" style={{ bottom: "20px" }}>
        <a href="/privacy" style={{ ...linkStyle, marginRight: "24px" }}>Privacy Policy</a>
        <a href="/terms" style={linkStyle}>Terms of Service</a>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

        /* Earth background — responsive: zoomed-out on desktop, zoomed-in on phone */
        .earth-bg {
          background-size: 115% auto;
          background-position: center 75%;
        }
        @media (max-width: 768px) {
          .earth-bg {
            background-size: auto 75%;
            background-position: center 92%;
          }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          40% { opacity: 0.4; }
          60% { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .fade-in-up-delay { opacity: 0; animation: fadeInUp 0.6s ease-out 0.15s forwards; }
      `}</style>
    </div>
  );
}
