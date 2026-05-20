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
      <div className="orbs">
        <div className="o1" /><div className="o2" />
        <div className="o3" /><div className="o4" />
      </div>

      <nav className="nav">
        <div className="logo">Lore AI<span className="logo-dot">.</span></div>
<div className="navlinks"></div>
        <a href="/pricing" className="nav-pricing">Pricing</a>
      </nav>

      <div className="body">
        <div className="left">
          <div className="eyebrow"><div className="dot" /><span>Your AI co-founder for India</span></div>
          <h1 className="h1">From idea<br /><span className="dim">to</span> execution<span className="accent">.</span></h1>
          <div className="rule" />
          <p className="sub">Ask anything. Get answers that actually work in India. Build faster, think clearer, move smarter.</p>
          <div className="btns">
            <button onClick={signInWithGoogle} disabled={loading} className="btn">
              <svg width="14" height="14" viewBox="0 0 24 24" style={{flexShrink:0}}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? "Signing in..." : "Continue with Google"}
            </button>

          </div>
          <p className="fine">Free to start · No credit card · Made in India</p>
        </div>

        <div className="right">
          <div className="fc fc-a">
            <div className="av-row">
              <div className="av av1">T</div><div className="av av2">R</div>
              <div className="av av3">A</div><div className="av av4">S</div>
            </div>
            <div className="fc-label">Active founders</div>
            <div className="fc-val">2,418</div>
            <div className="fc-sub">+12% this month</div>
            <div className="fc-bar"><div className="fc-fill" /></div>
          </div>

          <div className="fc fc-b">
            <div className="fc-live"><span className="live-dot" />Live now</div>
            <div className="fc-val" style={{fontSize:26,color:"rgba(255,255,255,0.8)"}}>143</div>
            <div className="fc-sub">founders online</div>
          </div>

          <div className="fc fc-c">
            <div className="fc-icon">🧠</div>
            <div className="fc-txt">Answers in <span className="fc-o">seconds</span></div>
          </div>

          <div className="fc fc-d">
            <div className="fc-label">Pitch score</div>
            <div className="fc-val">8.4<span style={{fontSize:11,color:"rgba(255,255,255,0.15)"}}>  /10</span></div>
            <div className="score-row">
              <div className="seg" style={{background:"rgba(255,165,90,0.45)"}} />
              <div className="seg" style={{background:"rgba(255,165,90,0.3)"}} />
              <div className="seg" style={{background:"rgba(190,165,240,0.3)"}} />
              <div className="seg" style={{background:"rgba(255,255,255,0.05)"}} />
            </div>
          </div>

          <div className="fc fc-e">
            <div className="india-row">
              <div className="india-item"><div className="india-val" style={{color:"rgba(255,165,90,0.9)"}}>Free</div><div className="india-lbl">To start</div></div>
              <div className="india-div" />
              <div className="india-item"><div className="india-val" style={{color:"rgba(190,165,240,0.85)"}}>24/7</div><div className="india-lbl">Always on</div></div>
              <div className="india-div" />
              <div className="india-item"><div className="india-val" style={{color:"rgba(255,255,255,0.8)"}}>India</div><div className="india-lbl">Built for you</div></div>
              <div className="india-div" />
              <div className="india-item"><div className="india-val" style={{color:"rgba(255,165,90,0.85)"}}>AI</div><div className="india-lbl">Co-founder</div></div>
            </div>
          </div>
        </div>
      </div>

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

      <style jsx global>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#06060a}
        .root{background:#06060a;color:#fff;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif;min-height:100vh;position:relative;overflow:hidden;display:flex;flex-direction:column}
        .orbs{position:absolute;inset:0;pointer-events:none;filter:blur(120px);z-index:0}
        .o1{position:absolute;width:500px;height:500px;border-radius:50%;background:rgba(255,180,120,0.18);top:-200px;left:-100px;animation:f1 22s ease-in-out infinite}
        .o2{position:absolute;width:400px;height:400px;border-radius:50%;background:rgba(180,155,230,0.14);top:5%;left:12%;animation:f2 28s ease-in-out infinite}
        .o3{position:absolute;width:440px;height:440px;border-radius:50%;background:rgba(255,210,180,0.14);top:-60px;right:-80px;animation:f3 24s ease-in-out infinite}
        .o4{position:absolute;width:380px;height:380px;border-radius:50%;background:rgba(190,165,240,0.12);bottom:-100px;right:-60px;animation:f4 20s ease-in-out infinite}
        @keyframes f1{0%,100%{transform:translate(0,0)}50%{transform:translate(28px,18px)}}
        @keyframes f2{0%,100%{transform:translate(0,0)}50%{transform:translate(-18px,32px)}}
        @keyframes f3{0%,100%{transform:translate(0,0)}50%{transform:translate(-25px,20px)}}
        @keyframes f4{0%,100%{transform:translate(0,0)}50%{transform:translate(-32px,-25px)}}

        .nav{position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:26px 44px;animation:fadeUp 0.8s ease forwards;opacity:0}
        .logo{font-weight:800;font-size:16px;letter-spacing:-0.02em;color:#f0ece8}
        .logo-dot{color:rgba(255,165,90,0.95)}
        .navlinks{display:flex;gap:28px}
        .navlinks a{font-size:12px;color:rgba(255,255,255,0.5);text-decoration:none;cursor:pointer;transition:color 0.2s;letter-spacing:0.01em}
        .navlinks a:hover{color:rgba(255,255,255,0.55)}
        .nav-pricing{font-size:12px;color:rgba(255,255,255,0.3);background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);border-radius:100px;padding:6px 16px;cursor:pointer;text-decoration:none;transition:all 0.2s;letter-spacing:0.01em}
        .nav-pricing:hover{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.85)}

        .body{position:relative;z-index:10;display:grid;grid-template-columns:1fr 1fr;padding:40px 44px 0;flex:1}
        .left{display:flex;flex-direction:column;justify-content:center;padding-right:36px}
        .eyebrow{display:inline-flex;align-items:center;gap:7px;margin-bottom:22px;animation:fadeUp 0.8s 0.08s ease forwards;opacity:0;font-size:10px;letter-spacing:0.14em;color:rgba(255,255,255,0.45);text-transform:uppercase}
        .dot{width:4px;height:4px;border-radius:50%;background:rgba(255,165,90,0.9);animation:dpulse 2.5s ease-in-out infinite;flex-shrink:0}
        @keyframes dpulse{0%,100%{opacity:0.5}50%{opacity:1}}
        .h1{font-weight:800;font-size:clamp(40px,5vw,58px);line-height:0.95;letter-spacing:-0.045em;color:#f0ece8;animation:fadeUp 0.8s 0.14s ease forwards;opacity:0}
        .dim{color:rgba(255,255,255,0.3)}
        .accent{color:rgba(255,165,90,0.9)}
        .rule{width:32px;height:0.5px;background:rgba(255,255,255,0.08);margin:24px 0;animation:fadeUp 0.8s 0.18s ease forwards;opacity:0}
        .sub{font-size:13px;color:rgba(255,255,255,0.5);font-weight:300;line-height:1.8;margin-bottom:30px;animation:fadeUp 0.8s 0.2s ease forwards;opacity:0;max-width:320px}
        .btns{display:flex;align-items:center;gap:18px;animation:fadeUp 0.8s 0.25s ease forwards;opacity:0}
        .btn{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.92);color:#111;font-size:13px;font-weight:500;border-radius:100px;padding:11px 22px;cursor:pointer;border:none;font-family:inherit;transition:all 0.2s}
        .btn:hover{background:#fff;transform:translateY(-1px)}
        .btn:disabled{opacity:0.6;cursor:not-allowed}
        .btn-ghost{font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:0.05em;text-transform:uppercase;cursor:pointer;transition:color 0.2s;text-decoration:none}
        .btn-ghost:hover{color:rgba(255,255,255,0.45)}
        .fine{font-size:10px;color:rgba(255,255,255,0.3);margin-top:16px;letter-spacing:0.04em;animation:fadeUp 0.8s 0.3s ease forwards;opacity:0}

        .right{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-content:center;animation:fadeUp 0.8s 0.2s ease forwards;opacity:0}
        .fc{border-radius:14px;padding:18px;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
        .fc-a{background:rgba(255,255,255,0.07);border:0.5px solid rgba(255,255,255,0.14);animation:fl1 5s ease-in-out infinite}
        .fc-b{background:rgba(255,165,90,0.09);border:0.5px solid rgba(255,165,90,0.22);animation:fl2 6.5s ease-in-out infinite 0.7s}
        .fc-c{background:rgba(190,165,240,0.08);border:0.5px solid rgba(190,165,240,0.18);animation:fl3 7s ease-in-out infinite 0.4s}
        .fc-d{background:rgba(255,255,255,0.05);border:0.5px solid rgba(255,255,255,0.1);animation:fl1 5.5s ease-in-out infinite 1.1s}
        .fc-e{background:rgba(255,255,255,0.05);border:0.5px solid rgba(255,255,255,0.1);animation:fl2 6s ease-in-out infinite 0.5s;grid-column:1/span 2}
        @keyframes fl1{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes fl2{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes fl3{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}

        .fc-label{font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:6px}
        .fc-val{font-weight:800;font-size:22px;letter-spacing:-0.04em;color:rgba(255,255,255,0.95)}
        .fc-sub{font-size:10px;color:rgba(255,255,255,0.38);margin-top:2px}
        .fc-bar{margin-top:10px;height:1.5px;background:rgba(255,255,255,0.1);border-radius:2px}
        .fc-fill{height:100%;background:linear-gradient(90deg,rgba(255,165,90,0.5),rgba(255,165,90,0.05));border-radius:2px;animation:bfill 3.5s ease-in-out infinite}
        @keyframes bfill{0%,100%{width:62%}50%{width:80%}}
        .fc-icon{font-size:14px;margin-bottom:7px;opacity:0.7}
        .fc-txt{font-size:11px;color:rgba(255,255,255,0.55);line-height:1.55}
        .fc-o{color:rgba(255,165,90,0.9)}
        .fc-live{font-size:9px;color:rgba(255,255,255,0.45);letter-spacing:0.07em;text-transform:uppercase;margin-bottom:7px;display:flex;align-items:center;gap:5px}
        .live-dot{width:4px;height:4px;border-radius:50%;background:rgba(134,239,172,0.7);animation:livep 1.6s ease-in-out infinite;flex-shrink:0}
        @keyframes livep{0%,100%{opacity:0.6}50%{opacity:1}}
        .av-row{display:flex;margin-bottom:9px}
        .av{width:18px;height:18px;border-radius:50%;border:1.5px solid #06060a;margin-left:-4px;font-size:7px;display:flex;align-items:center;justify-content:center;font-weight:600}
        .av:first-child{margin-left:0}
        .av1{background:rgba(255,165,90,0.2);color:rgba(255,165,90,0.95)}
        .av2{background:rgba(190,165,240,0.18);color:rgba(190,165,240,0.7)}
        .av3{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.45)}
        .av4{background:rgba(255,165,90,0.12);color:rgba(255,165,90,0.8)}
        .score-row{display:flex;gap:4px;margin-top:10px}
        .seg{flex:1;height:1.5px;border-radius:2px}
        .india-row{display:flex;align-items:center;justify-content:space-between}
        .india-item{text-align:center}
        .india-val{font-weight:800;font-size:15px;letter-spacing:-0.02em}
        .india-lbl{font-size:8px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.07em;margin-top:3px}
        .india-div{width:0.5px;height:22px;background:rgba(255,255,255,0.05)}

        .stats{position:relative;z-index:10;display:grid;grid-template-columns:repeat(4,1fr);border-top:0.5px solid rgba(255,255,255,0.04);margin-top:36px;animation:fadeUp 0.8s 0.5s ease forwards;opacity:0}
        .stat{padding:20px 44px;border-right:0.5px solid rgba(255,255,255,0.04)}
        .stat:last-child{border-right:none}
        .stat-n{font-weight:800;font-size:20px;letter-spacing:-0.04em;color:rgba(255,255,255,0.85)}
        .stat-l{font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px;letter-spacing:0.06em;text-transform:uppercase}

        .footer{position:relative;z-index:10;border-top:0.5px solid rgba(255,255,255,0.04);padding:16px 44px;display:flex;justify-content:space-between;align-items:center}
        .footer-l{font-size:10px;color:rgba(255,255,255,0.3)}
        .footer-r{display:flex;gap:20px}
        .footer-r a{font-size:10px;color:rgba(255,255,255,0.35);text-decoration:none;cursor:pointer;transition:color 0.2s}
        .footer-r a:hover{color:rgba(255,255,255,0.4)}

        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

        @media(max-width:900px){
          .body{grid-template-columns:1fr;padding:28px 24px 0;gap:32px}
          .left{padding-right:0}
          .right{grid-template-columns:1fr 1fr}
          .stats{grid-template-columns:1fr 1fr}
          .stat{padding:16px 24px}
        }
        @media(max-width:600px){
          .nav{padding:16px 20px}
          .navlinks{display:none}
          .nav-pricing{font-size:11px;padding:5px 12px}
          .body{padding:20px 20px 0;gap:24px}
          .h1{font-size:36px;line-height:1}
          .rule{margin:18px 0}
          .sub{font-size:13px;max-width:100%}
          .btns{flex-direction:column;align-items:flex-start;gap:14px}
          .btn{width:100%;justify-content:center}
          .right{grid-template-columns:1fr 1fr;gap:8px}
          .fc{padding:13px}
          .fc-val{font-size:18px}
          .fc-e{padding:13px}
          .india-val{font-size:12px}
          .india-lbl{font-size:7px}
          .india-div{height:18px}
          .stats{grid-template-columns:1fr 1fr;margin-top:20px}
          .stat{padding:14px 20px}
          .stat-n{font-size:16px}
          .stat-l{font-size:8px}
          .footer{padding:14px 20px;flex-direction:column;gap:10px;text-align:center}
          .footer-r{justify-content:center}
        }
      `}</style>
    </div>
  );
}
