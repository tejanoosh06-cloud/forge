"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FoundersDirectoryPage() {
  const router = useRouter();
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/founders");
      const data = await res.json();
      setFounders(data.founders || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = founders.filter((f) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      (f.full_name || "").toLowerCase().includes(q) ||
      (f.company_name || "").toLowerCase().includes(q) ||
      (f.what_building || "").toLowerCase().includes(q) ||
      (f.sector || "").toLowerCase().includes(q) ||
      (f.city || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="root">
      <div className="orbs">
        <div className="o1" /><div className="o2" />
        <div className="o3" /><div className="o4" />
      </div>

      <nav className="nav">
        <button onClick={() => router.push("/")} className="logo">
          Lore AI<span className="logo-dot">.</span>
        </button>
        <div className="founder-count">{founders.length} founders</div>
      </nav>

      <div className="header">
        <div className="eyebrow"><div className="dot" /><span>Founder Directory</span></div>
        <h1 className="h1">Who's building<br /><span className="dim">in</span> India<span className="accent">.</span></h1>
        <p className="sub">Founders building real things. See what others are working on, connect, and grow together.</p>
        <div className="search-wrap">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search by name, sector, city..." className="search-input" />
        </div>
      </div>

      <div className="grid-wrap">
        {loading ? (
          <div className="empty">Loading founders...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            {founders.length === 0 ? "No founders are public yet. Be the first — turn on visibility in your profile." : "No founders match your search."}
          </div>
        ) : (
          <div className="grid">
            {filtered.map((f) => {
              const initial = (f.full_name || "F").charAt(0).toUpperCase();
              return (
                <div key={f.id} className="fc">
                  <div className="fc-top">
                    {f.avatar_url ? (
                      <img src={f.avatar_url} alt={f.full_name} className="avatar" />
                    ) : (
                      <div className="avatar avatar-init">{initial}</div>
                    )}
                    <div className="fc-meta">
                      <div className="fc-name">{f.full_name || "Anonymous Founder"}</div>
                      {f.company_name && <div className="fc-company">{f.company_name}</div>}
                    </div>
                  </div>
                  {f.what_building && <p className="fc-desc">{f.what_building}</p>}
                  <div className="fc-tags">
                    {f.sector && <span className="tag tag-o">{f.sector}</span>}
                    {f.stage && <span className="tag tag-v">{f.stage}</span>}
                    {f.city && <span className="tag tag-w">📍 {f.city}</span>}
                  </div>
                  <div className="fc-bar"><div className="fc-fill" /></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="footer">
        <div className="footer-l">© 2025 Lore AI · loreai.in</div>
        <div className="footer-r">
          <a href="/profile">Edit profile</a>
          <a href="/privacy">Privacy</a>
        </div>
      </footer>

      <style jsx global>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#06060a}
        .root{background:#06060a;color:#fff;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif;min-height:100vh;position:relative;overflow-x:hidden;display:flex;flex-direction:column}
        .orbs{position:fixed;inset:0;pointer-events:none;filter:blur(120px);z-index:0}
        .o1{position:absolute;width:500px;height:500px;border-radius:50%;background:rgba(255,180,120,0.12);top:-200px;left:-100px;animation:f1 22s ease-in-out infinite}
        .o2{position:absolute;width:400px;height:400px;border-radius:50%;background:rgba(180,155,230,0.09);top:20%;left:10%;animation:f2 28s ease-in-out infinite}
        .o3{position:absolute;width:440px;height:440px;border-radius:50%;background:rgba(255,210,180,0.09);top:10%;right:-80px;animation:f3 24s ease-in-out infinite}
        .o4{position:absolute;width:380px;height:380px;border-radius:50%;background:rgba(190,165,240,0.08);bottom:-100px;right:-60px;animation:f4 20s ease-in-out infinite}
        @keyframes f1{0%,100%{transform:translate(0,0)}50%{transform:translate(28px,18px)}}
        @keyframes f2{0%,100%{transform:translate(0,0)}50%{transform:translate(-18px,32px)}}
        @keyframes f3{0%,100%{transform:translate(0,0)}50%{transform:translate(-25px,20px)}}
        @keyframes f4{0%,100%{transform:translate(0,0)}50%{transform:translate(-32px,-25px)}}

        .nav{position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:26px 44px;border-bottom:0.5px solid rgba(255,255,255,0.05)}
        .logo{font-weight:800;font-size:22px;letter-spacing:-0.02em;color:#f0ece8;background:none;border:none;cursor:pointer}
        .logo-dot{color:rgba(255,165,90,0.95)}
        .founder-count{font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:0.08em;text-transform:uppercase}

        .header{position:relative;z-index:10;padding:52px 44px 36px;max-width:680px}
        .eyebrow{display:inline-flex;align-items:center;gap:7px;margin-bottom:20px;font-size:10px;letter-spacing:0.14em;color:rgba(255,255,255,0.35);text-transform:uppercase}
        .dot{width:4px;height:4px;border-radius:50%;background:rgba(255,165,90,0.9);flex-shrink:0;animation:dpulse 2.5s ease-in-out infinite}
        @keyframes dpulse{0%,100%{opacity:0.5}50%{opacity:1}}
        .h1{font-weight:800;font-size:clamp(36px,5vw,56px);line-height:0.96;letter-spacing:-0.045em;color:#f0ece8;margin-bottom:20px}
        .dim{color:rgba(255,255,255,0.12)}
        .accent{color:rgba(255,165,90,0.9)}
        .sub{font-size:14px;color:rgba(255,255,255,0.38);font-weight:300;line-height:1.75;max-width:460px;margin-bottom:28px}

        .search-wrap{position:relative;max-width:480px}
        .search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.3);pointer-events:none}
        .search-input{width:100%;padding:12px 16px 12px 38px;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.1);border-radius:12px;color:#fff;font-size:13px;font-family:inherit;outline:none;transition:border-color 0.2s}
        .search-input::placeholder{color:rgba(255,255,255,0.25)}
        .search-input:focus{border-color:rgba(255,165,90,0.3)}

        .grid-wrap{position:relative;z-index:10;padding:0 44px;flex:1}
        .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}

        .fc{background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.09);border-radius:16px;padding:20px;transition:all 0.2s;animation:fadeUp 0.5s ease forwards;opacity:0}
        .fc:hover{background:rgba(255,255,255,0.05);border-color:rgba(255,165,90,0.2)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

        .fc-top{display:flex;align-items:center;gap:12px;margin-bottom:14px}
        .avatar{width:38px;height:38px;border-radius:50%;flex-shrink:0;object-fit:cover}
        .avatar-init{width:38px;height:38px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,rgba(255,165,90,0.25),rgba(190,165,240,0.25));display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:rgba(255,255,255,0.8)}
        .fc-meta{flex:1;min-width:0}
        .fc-name{font-size:13px;font-weight:600;color:rgba(255,255,255,0.88);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .fc-company{font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .fc-desc{font-size:12px;color:rgba(255,255,255,0.45);line-height:1.6;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .fc-tags{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px}
        .tag{font-size:10px;padding:3px 10px;border-radius:100px;letter-spacing:0.02em}
        .tag-o{background:rgba(255,165,90,0.08);color:rgba(255,165,90,0.85);border:0.5px solid rgba(255,165,90,0.18)}
        .tag-v{background:rgba(190,165,240,0.08);color:rgba(190,165,240,0.85);border:0.5px solid rgba(190,165,240,0.18)}
        .tag-w{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.45);border:0.5px solid rgba(255,255,255,0.1)}
        .fc-bar{height:1.5px;background:rgba(255,255,255,0.04);border-radius:2px}
        .fc-fill{height:100%;width:0%;background:linear-gradient(90deg,rgba(255,165,90,0.4),rgba(190,165,240,0.3));border-radius:2px;transition:width 0.8s ease}
        .fc:hover .fc-fill{width:100%}

        .empty{text-align:center;padding:80px 24px;font-size:14px;color:rgba(255,255,255,0.3);line-height:1.7}
        .footer{position:relative;z-index:10;border-top:0.5px solid rgba(255,255,255,0.05);padding:18px 44px;display:flex;justify-content:space-between;align-items:center;margin-top:48px}
        .footer-l{font-size:11px;color:rgba(255,255,255,0.2)}
        .footer-r{display:flex;gap:20px}
        .footer-r a{font-size:11px;color:rgba(255,255,255,0.3);text-decoration:none;transition:color 0.2s}
        .footer-r a:hover{color:rgba(255,255,255,0.6)}

        @media(max-width:900px){.grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:600px){
          .nav{padding:18px 20px}
          .header{padding:32px 20px 24px}
          .grid-wrap{padding:0 20px}
          .grid{grid-template-columns:1fr}
          .footer{padding:16px 20px;flex-direction:column;gap:10px;text-align:center}
          .footer-r{justify-content:center}
        }
      `}</style>
    </div>
  );
}
