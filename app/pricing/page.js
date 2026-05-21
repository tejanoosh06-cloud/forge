"use client";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="root">
      <div className="orbs"><div className="o1"/><div className="o2"/><div className="o3"/></div>

      <nav className="nav">
        <button onClick={() => router.push("/")} className="logo">Lore AI<span className="logo-dot">.</span></button>
        <button onClick={() => router.push("/")} className="back-btn">← Back</button>
      </nav>

      <div className="body">
        <div className="eyebrow"><div className="dot"/>Simple pricing</div>
        <h1 className="h1">Start free.<br /><span className="dim">Go Pro</span> when ready<span className="accent">.</span></h1>
        <p className="sub">First 40 founders get full community access free — forever. Pro unlocks everything else.</p>

        <div className="cards">
          {/* Free */}
          <div className="card">
            <div className="card-top">
              <div className="plan-name">Free</div>
              <div className="plan-price">₹0<span className="plan-per">/mo</span></div>
              <div className="plan-sub">Always free to start</div>
            </div>
            <div className="features">
              <div className="feat feat-yes">✓ AI co-founder chat</div>
              <div className="feat feat-yes">✓ 1 Pro+ answer per day</div>
              <div className="feat feat-yes">✓ Projects & history</div>
              <div className="feat feat-yes">✓ Community (first 40 users)</div>
              <div className="feat feat-no">✗ Unlimited Pro+ answers</div>
              <div className="feat feat-no">✗ Community (after 40 users)</div>
            </div>
            <button onClick={() => router.push("/")} className="btn-free">Start for free</button>
          </div>

          {/* Pro */}
          <div className="card card-pro">
            <div className="card-badge">Most popular</div>
            <div className="card-top">
              <div className="plan-name">Pro</div>
              <div className="plan-price">₹499<span className="plan-per">/mo</span></div>
              <div className="plan-sub">Cancel anytime</div>
            </div>
            <div className="features">
              <div className="feat feat-yes">✓ Everything in Free</div>
              <div className="feat feat-yes">✓ Unlimited Pro+ answers</div>
              <div className="feat feat-yes">✓ Full community access</div>
              <div className="feat feat-yes">✓ Share achievements</div>
              <div className="feat feat-yes">✓ Priority support</div>
              <div className="feat feat-yes">✓ Early access to features</div>
            </div>
            <button className="btn-pro" onClick={() => alert("Payment coming soon! Email us at hello@loreai.in to get Pro access.")}>
              Get Pro — ₹499/mo
            </button>
          </div>
        </div>

        <p className="fine">🇮🇳 Made in India · Payments via Razorpay coming soon · Email hello@loreai.in for early Pro access</p>
      </div>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#06060a}
        .root{background:#06060a;color:#fff;font-family:'DM Sans',-apple-system,sans-serif;min-height:100vh;position:relative;overflow-x:hidden}
        .orbs{position:fixed;inset:0;pointer-events:none;filter:blur(110px);z-index:0}
        .o1{position:absolute;width:500px;height:500px;border-radius:50%;background:rgba(255,180,120,0.1);top:-200px;left:-100px;animation:f1 22s ease-in-out infinite}
        .o2{position:absolute;width:400px;height:400px;border-radius:50%;background:rgba(180,155,230,0.08);top:20%;left:10%;animation:f2 28s ease-in-out infinite}
        .o3{position:absolute;width:440px;height:440px;border-radius:50%;background:rgba(255,210,180,0.08);top:10%;right:-80px;animation:f3 24s ease-in-out infinite}
        @keyframes f1{0%,100%{transform:translate(0,0)}50%{transform:translate(28px,18px)}}
        @keyframes f2{0%,100%{transform:translate(0,0)}50%{transform:translate(-18px,32px)}}
        @keyframes f3{0%,100%{transform:translate(0,0)}50%{transform:translate(-25px,20px)}}

        .nav{position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:22px 44px;border-bottom:0.5px solid rgba(255,255,255,0.05)}
        .logo{font-weight:800;font-size:20px;letter-spacing:-0.02em;color:#f0ece8;background:none;border:none;cursor:pointer}
        .logo-dot{color:rgba(255,165,90,0.95)}
        .back-btn{font-size:12px;color:rgba(255,255,255,0.35);background:none;border:none;cursor:pointer;transition:color 0.2s}
        .back-btn:hover{color:rgba(255,255,255,0.7)}

        .body{position:relative;z-index:10;padding:60px 44px;max-width:800px;margin:0 auto;text-align:center}
        .eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:10px;letter-spacing:0.14em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-bottom:20px}
        .dot{width:4px;height:4px;border-radius:50%;background:rgba(255,165,90,0.9);animation:dp 2.5s ease-in-out infinite}
        @keyframes dp{0%,100%{opacity:0.5}50%{opacity:1}}
        .h1{font-weight:800;font-size:clamp(36px,5vw,52px);line-height:0.97;letter-spacing:-0.04em;color:#f0ece8;margin-bottom:16px}
        .dim{color:rgba(255,255,255,0.18)}
        .accent{color:rgba(255,165,90,0.9)}
        .sub{font-size:15px;color:rgba(255,255,255,0.35);line-height:1.7;max-width:460px;margin:0 auto 48px;font-weight:300}

        .cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:36px;text-align:left}
        .card{background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.08);border-radius:18px;padding:28px;position:relative}
        .card-pro{background:rgba(255,165,90,0.04);border-color:rgba(255,165,90,0.2)}
        .card-badge{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:rgba(255,165,90,0.9);color:#000;font-size:10px;font-weight:700;padding:3px 12px;border-radius:100px;letter-spacing:0.04em;white-space:nowrap}
        .card-top{margin-bottom:24px}
        .plan-name{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px}
        .plan-price{font-weight:800;font-size:44px;letter-spacing:-0.04em;color:#f0ece8}
        .plan-per{font-size:16px;color:rgba(255,255,255,0.3);font-weight:400;letter-spacing:0}
        .plan-sub{font-size:12px;color:rgba(255,255,255,0.25);margin-top:4px}
        .features{margin-bottom:24px;display:flex;flex-direction:column;gap:9px}
        .feat{font-size:13px;line-height:1.4}
        .feat-yes{color:rgba(255,255,255,0.6)}
        .feat-no{color:rgba(255,255,255,0.2)}
        .btn-free{width:100%;padding:12px;border-radius:10px;font-size:13px;background:rgba(255,255,255,0.06);border:0.5px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);cursor:pointer;font-family:inherit;transition:all 0.2s}
        .btn-free:hover{background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.85)}
        .btn-pro{width:100%;padding:12px;border-radius:10px;font-size:13px;font-weight:600;background:rgba(255,255,255,0.92);color:#111;border:none;cursor:pointer;font-family:inherit;transition:all 0.2s}
        .btn-pro:hover{background:#fff;transform:translateY(-1px)}
        .fine{font-size:11px;color:rgba(255,255,255,0.18);line-height:1.7}

        @media(max-width:600px){
          .nav{padding:18px 20px}
          .body{padding:40px 20px}
          .cards{grid-template-columns:1fr}
        }
      `}</style>
    </div>
  );
}
