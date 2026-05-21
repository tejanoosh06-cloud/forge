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
    <div className="root">
      {/* Full screen background */}
      <div className="bg" />

      {/* Dark overlay for text readability */}
      <div className="overlay" />

      {/* Subtle vignette */}
      <div className="vignette" />

      {/* Nav */}
      <nav className="nav">
        <div className="logo">Lore AI<span className="logo-dot">.</span></div>
        <a href="/pricing" className="nav-pricing">Pricing</a>
      </nav>

      {/* Hero */}
      <main className="hero">
        <div className="hero-inner">
          <div className="eyebrow">
            <div className="dot" />
            <span>Your AI co-founder for India</span>
          </div>

          <h1 className="h1">
            From idea<br />
            <span className="h1-dim">to</span> execution<span className="h1-accent">.</span>
          </h1>

          <p className="sub">
            Ask anything. Get answers that actually work in India.<br className="br" />
            Build faster, think clearer, move smarter.
          </p>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{flexShrink:0}}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <p className="fine">Free to start · No credit card · Made in India 🇮🇳</p>
        </div>

        {/* Floating cards */}
        <div className="cards">
          <div className="fc fc-a">
            <div className="fc-av-row">
              <div className="fc-av av1">T</div>
              <div className="fc-av av2">R</div>
              <div className="fc-av av3">A</div>
              <div className="fc-av av4">S</div>
            </div>
            <div className="fc-label">Active founders</div>
            <div className="fc-val">2,418</div>
            <div className="fc-sub">+12% this month</div>
            <div className="fc-bar"><div className="fc-fill" /></div>
          </div>

          <div className="fc fc-b">
            <div className="fc-live"><span className="live-dot" />Live now</div>
            <div className="fc-val" style={{fontSize:28}}>143</div>
            <div className="fc-sub">founders online</div>
          </div>

          <div className="fc fc-c">
            <div className="fc-icon">🚀</div>
            <div className="fc-txt">From zero to <span className="fc-o">funded</span></div>
          </div>

          <div className="fc fc-d">
            <div className="fc-label">Pitch score</div>
            <div className="fc-val">8.4<span style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>  /10</span></div>
            <div className="score-row">
              <div className="seg" style={{background:"rgba(255,165,90,0.7)"}} />
              <div className="seg" style={{background:"rgba(255,165,90,0.5)"}} />
              <div className="seg" style={{background:"rgba(190,165,240,0.4)"}} />
              <div className="seg" style={{background:"rgba(255,255,255,0.08)"}} />
            </div>
          </div>

          <div className="fc fc-e">
            <div className="india-row">
              <div className="india-item"><div className="india-val" style={{color:"rgba(255,165,90,0.9)"}}>Free</div><div className="india-lbl">To start</div></div>
              <div className="india-div" />
              <div className="india-item"><div className="india-val" style={{color:"rgba(190,165,240,0.9)"}}>24/7</div><div className="india-lbl">Always on</div></div>
              <div className="india-div" />
              <div className="india-item"><div className="india-val" style={{color:"rgba(255,255,255,0.8)"}}>India</div><div className="india-lbl">Built for you</div></div>
              <div className="india-div" />
              <div className="india-item"><div className="india-val" style={{color:"rgba(255,165,90,0.9)"}}>AI</div><div className="india-lbl">Co-founder</div></div>
            </div>
          </div>
        </div>
      </main>

      {/* Stats bar */}
      <div className="stats">
        <div className="stat"><div className="stat-n">2,400+</div><div className="stat-l">Founders</div></div>
        <div className="stat"><div className="stat-n">India-first</div><div className="stat-l">Built for Bharat</div></div>
        <div className="stat"><div className="stat-n">24/7</div><div className="stat-l">Always on</div></div>
        <div className="stat"><div className="stat-n">₹0</div><div className="stat-l">To get started</div></div>
      </div>

      <footer className="footer">
        <div className="footer-l">© 2025 Lore AI · loreai.in</div>
        <div className="footer-r">
          <a href="/pricing">Pricing</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </footer>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#000;overflow-x:hidden}

        .root{color:#fff;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif;min-height:100vh;position:relative;display:flex;flex-direction:column;overflow:hidden}

        /* Background image */
        .bg{
          position:fixed;inset:0;z-index:0;
          background:url('/landing-bg.jpg') center center / cover no-repeat;
          transform:scale(1.03);
        }

        /* Dark overlay so text is readable */
        .overlay{
          position:fixed;inset:0;z-index:1;
          background:linear-gradient(
            to bottom,
            rgba(0,0,0,0.55) 0%,
            rgba(0,0,0,0.35) 40%,
            rgba(0,0,0,0.6) 80%,
            rgba(0,0,0,0.85) 100%
          );
        }

        /* Vignette edges */
        .vignette{
          position:fixed;inset:0;z-index:2;
          background:radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%);
        }

        .nav{position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:28px 48px}
        .logo{font-weight:800;font-size:22px;letter-spacing:-0.02em;color:#fff}
        .logo-dot{color:rgba(255,165,90,0.95)}
        .nav-pricing{font-size:12px;color:rgba(255,255,255,0.45);background:rgba(255,255,255,0.08);border:0.5px solid rgba(255,255,255,0.15);border-radius:100px;padding:7px 18px;text-decoration:none;transition:all 0.2s;backdrop-filter:blur(10px)}
        .nav-pricing:hover{background:rgba(255,255,255,0.15);color:#fff}

        .hero{position:relative;z-index:20;display:grid;grid-template-columns:1fr 1fr;gap:0;padding:48px 48px 0;flex:1;align-items:center}

        .hero-inner{display:flex;flex-direction:column;justify-content:center}

        .eyebrow{display:inline-flex;align-items:center;gap:7px;margin-bottom:24px;font-size:11px;letter-spacing:0.12em;color:rgba(255,255,255,0.5);text-transform:uppercase;animation:fadeUp 0.8s ease forwards;opacity:0}
        .dot{width:5px;height:5px;border-radius:50%;background:rgba(255,165,90,0.9);animation:dpulse 2.5s ease-in-out infinite;flex-shrink:0}
        @keyframes dpulse{0%,100%{opacity:0.5;box-shadow:0 0 0 0 rgba(255,165,90,0.4)}50%{opacity:1;box-shadow:0 0 0 6px rgba(255,165,90,0)}}

        .h1{font-weight:800;font-size:clamp(48px,6vw,72px);line-height:0.95;letter-spacing:-0.045em;color:#fff;margin-bottom:6px;animation:fadeUp 0.8s 0.1s ease forwards;opacity:0;text-shadow:0 2px 40px rgba(0,0,0,0.5)}
        .h1-dim{color:rgba(255,255,255,0.2)}
        .h1-accent{color:rgba(255,165,90,0.95)}

        .sub{font-size:16px;color:rgba(255,255,255,0.55);font-weight:300;line-height:1.7;margin:24px 0 36px;animation:fadeUp 0.8s 0.2s ease forwards;opacity:0;max-width:420px;text-shadow:0 1px 20px rgba(0,0,0,0.8)}

        .btn{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.95);color:#111;font-size:14px;font-weight:600;border-radius:100px;padding:14px 28px;cursor:pointer;border:none;font-family:inherit;transition:all 0.2s;animation:fadeUp 0.8s 0.3s ease forwards;opacity:0;backdrop-filter:blur(10px)}
        .btn:hover{background:#fff;transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,0.3)}
        .btn:disabled{opacity:0.6;cursor:not-allowed;transform:none}

        .fine{font-size:11px;color:rgba(255,255,255,0.3);margin-top:18px;letter-spacing:0.04em;animation:fadeUp 0.8s 0.4s ease forwards;opacity:0}

        /* Cards */
        .cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-content:center;animation:fadeUp 0.8s 0.3s ease forwards;opacity:0}

        .fc{border-radius:16px;padding:20px;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
        .fc-a{background:rgba(0,0,0,0.35);border:0.5px solid rgba(255,255,255,0.15);animation:fl1 5s ease-in-out infinite}
        .fc-b{background:rgba(255,165,90,0.12);border:0.5px solid rgba(255,165,90,0.25);animation:fl2 6.5s ease-in-out infinite 0.7s}
        .fc-c{background:rgba(0,0,0,0.3);border:0.5px solid rgba(255,255,255,0.1);animation:fl3 7s ease-in-out infinite 0.4s}
        .fc-d{background:rgba(0,0,0,0.3);border:0.5px solid rgba(255,255,255,0.1);animation:fl1 5.5s ease-in-out infinite 1.1s}
        .fc-e{background:rgba(0,0,0,0.3);border:0.5px solid rgba(255,255,255,0.1);animation:fl2 6s ease-in-out infinite 0.5s;grid-column:1/span 2}

        @keyframes fl1{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes fl2{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes fl3{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}

        .fc-label{font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:6px}
        .fc-val{font-weight:800;font-size:24px;letter-spacing:-0.04em;color:#fff}
        .fc-sub{font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px}
        .fc-bar{margin-top:10px;height:1.5px;background:rgba(255,255,255,0.1);border-radius:2px}
        .fc-fill{height:100%;background:linear-gradient(90deg,rgba(255,165,90,0.8),rgba(255,165,90,0.1));border-radius:2px;animation:bfill 3.5s ease-in-out infinite}
        @keyframes bfill{0%,100%{width:62%}50%{width:82%}}
        .fc-icon{font-size:16px;margin-bottom:7px}
        .fc-txt{font-size:12px;color:rgba(255,255,255,0.6);line-height:1.55}
        .fc-o{color:rgba(255,165,90,0.9);font-weight:500}
        .fc-live{font-size:9px;color:rgba(255,255,255,0.45);letter-spacing:0.07em;text-transform:uppercase;margin-bottom:7px;display:flex;align-items:center;gap:5px}
        .live-dot{width:5px;height:5px;border-radius:50%;background:rgba(134,239,172,0.9);animation:livep 1.6s ease-in-out infinite;flex-shrink:0;box-shadow:0 0 6px rgba(134,239,172,0.6)}
        @keyframes livep{0%,100%{opacity:0.6}50%{opacity:1}}
        .fc-av-row{display:flex;margin-bottom:9px}
        .fc-av{width:20px;height:20px;border-radius:50%;border:1.5px solid rgba(0,0,0,0.5);margin-left:-4px;font-size:8px;display:flex;align-items:center;justify-content:center;font-weight:700}
        .fc-av:first-child{margin-left:0}
        .av1{background:rgba(255,165,90,0.4);color:rgba(255,165,90,0.9)}
        .av2{background:rgba(190,165,240,0.35);color:rgba(190,165,240,0.9)}
        .av3{background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.7)}
        .av4{background:rgba(255,165,90,0.25);color:rgba(255,165,90,0.8)}
        .score-row{display:flex;gap:4px;margin-top:10px}
        .seg{flex:1;height:2px;border-radius:2px}
        .india-row{display:flex;align-items:center;justify-content:space-between}
        .india-item{text-align:center}
        .india-val{font-weight:800;font-size:16px;letter-spacing:-0.02em}
        .india-lbl{font-size:8px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.07em;margin-top:3px}
        .india-div{width:0.5px;height:24px;background:rgba(255,255,255,0.1)}

        .stats{position:relative;z-index:20;display:grid;grid-template-columns:repeat(4,1fr);border-top:0.5px solid rgba(255,255,255,0.1);margin-top:40px;background:rgba(0,0,0,0.4);backdrop-filter:blur(20px)}
        .stat{padding:20px 48px;border-right:0.5px solid rgba(255,255,255,0.08)}
        .stat:last-child{border-right:none}
        .stat-n{font-weight:800;font-size:20px;letter-spacing:-0.04em;color:rgba(255,255,255,0.85)}
        .stat-l{font-size:9px;color:rgba(255,255,255,0.3);margin-top:2px;letter-spacing:0.06em;text-transform:uppercase}

        .footer{position:relative;z-index:20;border-top:0.5px solid rgba(255,255,255,0.08);padding:16px 48px;display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(20px)}
        .footer-l{font-size:11px;color:rgba(255,255,255,0.25)}
        .footer-r{display:flex;gap:20px}
        .footer-r a{font-size:11px;color:rgba(255,255,255,0.3);text-decoration:none;transition:color 0.2s}
        .footer-r a:hover{color:rgba(255,255,255,0.7)}

        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

        /* Mobile */
        @media(max-width:900px){
          .hero{grid-template-columns:1fr;padding:36px 24px 0;gap:32px}
          .stats{grid-template-columns:1fr 1fr}
          .stat{padding:16px 24px}
        }
        @media(max-width:600px){
          .nav{padding:20px 24px}
          .hero{padding:28px 20px 0}
          .h1{font-size:44px}
          .sub{font-size:14px}
          .br{display:none}
          .cards{grid-template-columns:1fr}
          .fc-e{grid-column:1}
          .stats{grid-template-columns:1fr 1fr;margin-top:24px}
          .stat{padding:14px 20px}
          .footer{padding:14px 20px;flex-direction:column;gap:10px;text-align:center}
          .footer-r{justify-content:center}
          .nav-pricing{display:none}
        }
      `}</style>
    </div>
  );
}
