"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SECTORS = ["SaaS","Fintech","Edtech","Healthtech","D2C","Ecommerce","Logistics","AgriTech","CleanTech","Media","Gaming","Other"];
const STAGES = ["Idea","Building MVP","Launched","Early revenue","Scaling","Profitable"];
const CITIES = ["Bangalore","Mumbai","Delhi","Hyderabad","Chennai","Pune","Kolkata","Ahmedabad","Jaipur","Other"];

const STEPS = [
  { id: "name", title: "What should Lore AI call you?", sub: "Your name and startup" },
  { id: "building", title: "What are you building?", sub: "Describe your startup in one or two sentences" },
  { id: "details", title: "A bit more about you", sub: "Helps Lore AI give you the most relevant advice" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    company_name: "",
    what_building: "",
    sector: "",
    stage: "",
    city: "",
  });

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      // Pre-fill name from Google
      const googleName = user.user_metadata?.full_name || user.user_metadata?.name || "";
      setForm(f => ({ ...f, full_name: googleName }));
    }
    init();
  }, []);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function canNext() {
    if (step === 0) return form.full_name.trim().length > 0;
    if (step === 1) return form.what_building.trim().length > 10;
    return true;
  }

  async function finish() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      avatar_url: user.user_metadata?.avatar_url || null,
      full_name: form.full_name.trim(),
      company_name: form.company_name.trim() || null,
      what_building: form.what_building.trim(),
      sector: form.sector || null,
      stage: form.stage || null,
      city: form.city || null,
      updated_at: new Date().toISOString(),
    });

    router.push("/");
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="root">
      <div className="orbs"><div className="o1"/><div className="o2"/><div className="o3"/></div>

      <nav className="nav">
        <div className="logo">Lore AI<span className="logo-dot">.</span></div>
        <div className="step-label">Step {step + 1} of {STEPS.length}</div>
      </nav>

      {/* Progress bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{width: `${progress}%`}}/>
      </div>

      <div className="body">
        <div className="card">
          <div className="eyebrow"><div className="dot"/>{STEPS[step].sub}</div>
          <h2 className="title">{STEPS[step].title}</h2>

          {/* Step 0: Name + Company */}
          {step === 0 && (
            <div className="fields">
              <div className="field">
                <label className="label">Your name</label>
                <input
                  autoFocus
                  value={form.full_name}
                  onChange={e => set("full_name", e.target.value)}
                  placeholder="Rahul Sharma"
                  className="input"
                  onKeyDown={e => e.key === "Enter" && canNext() && setStep(1)}
                />
              </div>
              <div className="field">
                <label className="label">Startup name <span className="optional">optional</span></label>
                <input
                  value={form.company_name}
                  onChange={e => set("company_name", e.target.value)}
                  placeholder="e.g. Razorpay, Zepto..."
                  className="input"
                  onKeyDown={e => e.key === "Enter" && canNext() && setStep(1)}
                />
              </div>
            </div>
          )}

          {/* Step 1: What building */}
          {step === 1 && (
            <div className="fields">
              <div className="field">
                <label className="label">What are you building?</label>
                <textarea
                  autoFocus
                  value={form.what_building}
                  onChange={e => set("what_building", e.target.value)}
                  placeholder="e.g. A SaaS platform that helps D2C brands in India manage their inventory across Flipkart, Amazon and their own website..."
                  className="input textarea"
                  rows={4}
                  maxLength={500}
                />
                <div className="char-count">{form.what_building.length}/500</div>
              </div>
            </div>
          )}

          {/* Step 2: Sector, Stage, City */}
          {step === 2 && (
            <div className="fields">
              <div className="field">
                <label className="label">Sector <span className="optional">optional</span></label>
                <div className="chips">
                  {SECTORS.map(s => (
                    <button key={s} onClick={() => set("sector", form.sector === s ? "" : s)}
                      className={`chip ${form.sector === s ? "chip-on" : ""}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="label">Stage <span className="optional">optional</span></label>
                <div className="chips">
                  {STAGES.map(s => (
                    <button key={s} onClick={() => set("stage", form.stage === s ? "" : s)}
                      className={`chip ${form.stage === s ? "chip-on" : ""}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="label">City <span className="optional">optional</span></label>
                <div className="chips">
                  {CITIES.map(c => (
                    <button key={c} onClick={() => set("city", form.city === c ? "" : c)}
                      className={`chip ${form.city === c ? "chip-on" : ""}`}>{c}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="actions">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-back">← Back</button>
            )}
            <div style={{flex:1}}/>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-next">
                Continue →
              </button>
            ) : (
              <button onClick={finish} disabled={saving} className="btn-finish">
                {saving ? "Setting up..." : "Enter Lore AI 🚀"}
              </button>
            )}
          </div>

          {step === 2 && (
            <button onClick={finish} className="skip-btn">Skip for now →</button>
          )}
        </div>

        {/* Preview card — shows what Lore AI knows */}
        <div className="preview">
          <div className="preview-label">What Lore AI knows about you</div>
          <div className="preview-row">
            <span className="preview-key">Name</span>
            <span className="preview-val">{form.full_name || "—"}</span>
          </div>
          {form.company_name && <div className="preview-row">
            <span className="preview-key">Startup</span>
            <span className="preview-val">{form.company_name}</span>
          </div>}
          {form.what_building && <div className="preview-row">
            <span className="preview-key">Building</span>
            <span className="preview-val" style={{maxWidth:200,textAlign:"right",lineHeight:1.5}}>{form.what_building.slice(0,80)}{form.what_building.length > 80 ? "..." : ""}</span>
          </div>}
          {form.sector && <div className="preview-row">
            <span className="preview-key">Sector</span>
            <span className="preview-val">{form.sector}</span>
          </div>}
          {form.stage && <div className="preview-row">
            <span className="preview-key">Stage</span>
            <span className="preview-val">{form.stage}</span>
          </div>}
          {form.city && <div className="preview-row">
            <span className="preview-key">City</span>
            <span className="preview-val">{form.city}</span>
          </div>}
        </div>
      </div>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#06060a}
        .root{background:#06060a;color:#fff;font-family:'DM Sans',-apple-system,sans-serif;min-height:100vh;position:relative;overflow-x:hidden;display:flex;flex-direction:column}
        .orbs{position:fixed;inset:0;pointer-events:none;filter:blur(110px);z-index:0}
        .o1{position:absolute;width:500px;height:500px;border-radius:50%;background:rgba(255,180,120,0.1);top:-200px;left:-100px;animation:f1 22s ease-in-out infinite}
        .o2{position:absolute;width:400px;height:400px;border-radius:50%;background:rgba(180,155,230,0.08);top:20%;left:10%;animation:f2 28s ease-in-out infinite}
        .o3{position:absolute;width:440px;height:440px;border-radius:50%;background:rgba(190,165,240,0.07);bottom:-100px;right:-60px;animation:f3 24s ease-in-out infinite}
        @keyframes f1{0%,100%{transform:translate(0,0)}50%{transform:translate(28px,18px)}}
        @keyframes f2{0%,100%{transform:translate(0,0)}50%{transform:translate(-18px,32px)}}
        @keyframes f3{0%,100%{transform:translate(0,0)}50%{transform:translate(-32px,-25px)}}

        .nav{position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:22px 44px;border-bottom:0.5px solid rgba(255,255,255,0.05)}
        .logo{font-weight:800;font-size:20px;letter-spacing:-0.02em;color:#f0ece8}
        .logo-dot{color:rgba(255,165,90,0.95)}
        .step-label{font-size:12px;color:rgba(255,255,255,0.25);letter-spacing:0.04em}

        .progress-track{height:1.5px;background:rgba(255,255,255,0.05);position:relative;z-index:20}
        .progress-fill{height:100%;background:linear-gradient(90deg,rgba(255,165,90,0.7),rgba(190,165,240,0.5));border-radius:2px;transition:width 0.4s ease}

        .body{position:relative;z-index:10;flex:1;display:flex;align-items:flex-start;justify-content:center;gap:24px;padding:52px 44px;flex-wrap:wrap}

        .card{background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.08);border-radius:20px;padding:36px;width:100%;max-width:480px;flex-shrink:0}

        .eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:10px;letter-spacing:0.12em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-bottom:14px}
        .dot{width:4px;height:4px;border-radius:50%;background:rgba(255,165,90,0.9);animation:dp 2.5s ease-in-out infinite}
        @keyframes dp{0%,100%{opacity:0.5}50%{opacity:1}}
        .title{font-weight:800;font-size:26px;letter-spacing:-0.03em;color:#f0ece8;margin-bottom:28px;line-height:1.2}

        .fields{display:flex;flex-direction:column;gap:20px;margin-bottom:28px}
        .field{display:flex;flex-direction:column;gap:8px}
        .label{font-size:12px;color:rgba(255,255,255,0.45);letter-spacing:0.02em}
        .optional{color:rgba(255,255,255,0.2);font-size:11px}
        .input{background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.1);border-radius:12px;color:#fff;font-size:14px;padding:13px 16px;font-family:inherit;outline:none;transition:border-color 0.2s;width:100%}
        .input::placeholder{color:rgba(255,255,255,0.2)}
        .input:focus{border-color:rgba(255,165,90,0.35)}
        .textarea{resize:none;line-height:1.6}
        .char-count{font-size:10px;color:rgba(255,255,255,0.2);text-align:right;margin-top:4px}

        .chips{display:flex;flex-wrap:wrap;gap:7px}
        .chip{padding:6px 14px;border-radius:100px;font-size:12px;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.09);color:rgba(255,255,255,0.45);cursor:pointer;font-family:inherit;transition:all 0.15s}
        .chip:hover{border-color:rgba(255,255,255,0.2);color:rgba(255,255,255,0.75)}
        .chip-on{background:rgba(255,165,90,0.1);border-color:rgba(255,165,90,0.3);color:rgba(255,165,90,0.9)}

        .actions{display:flex;align-items:center;gap:12px}
        .btn-back{padding:11px 20px;border-radius:10px;font-size:13px;background:none;border:0.5px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.4);cursor:pointer;font-family:inherit;transition:all 0.2s}
        .btn-back:hover{border-color:rgba(255,255,255,0.25);color:rgba(255,255,255,0.7)}
        .btn-next{padding:11px 24px;border-radius:10px;font-size:13px;background:rgba(255,255,255,0.9);color:#111;border:none;cursor:pointer;font-family:inherit;font-weight:500;transition:all 0.2s}
        .btn-next:hover{background:#fff;transform:translateY(-1px)}
        .btn-next:disabled{opacity:0.35;cursor:not-allowed;transform:none}
        .btn-finish{padding:11px 24px;border-radius:10px;font-size:13px;background:linear-gradient(135deg,rgba(255,165,90,0.9),rgba(190,165,240,0.8));color:#fff;border:none;cursor:pointer;font-family:inherit;font-weight:600;transition:all 0.2s}
        .btn-finish:hover{transform:translateY(-1px);filter:brightness(1.1)}
        .btn-finish:disabled{opacity:0.4;cursor:not-allowed;transform:none}
        .skip-btn{display:block;width:100%;text-align:center;margin-top:14px;font-size:12px;color:rgba(255,255,255,0.2);background:none;border:none;cursor:pointer;font-family:inherit;transition:color 0.2s}
        .skip-btn:hover{color:rgba(255,255,255,0.45)}

        .preview{background:rgba(255,255,255,0.02);border:0.5px solid rgba(255,255,255,0.06);border-radius:16px;padding:24px;width:220px;height:fit-content;flex-shrink:0;margin-top:0}
        .preview-label{font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.22);margin-bottom:16px}
        .preview-row{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px}
        .preview-key{font-size:11px;color:rgba(255,255,255,0.25);flex-shrink:0}
        .preview-val{font-size:11px;color:rgba(255,255,255,0.65);text-align:right}

        @media(max-width:768px){
          .nav{padding:18px 20px}
          .body{padding:32px 20px;flex-direction:column;align-items:center}
          .preview{width:100%;max-width:480px}
          .card{padding:24px}
        }
      `}</style>
    </div>
  );
}
