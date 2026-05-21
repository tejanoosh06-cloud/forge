"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const EMOJIS = ["💬","🚀","💡","🔥","📈","🤝","💰","⚡","🎯","🏆","🌱","💪"];
const ACH_EMOJIS = ["🏆","🎉","🚀","💰","🌟","📈","🤝","🎯","💡","⚡","🔥","💎"];

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState(null);
  const [composing, setComposing] = useState(false);
  const [postText, setPostText] = useState("");
  const [postEmoji, setPostEmoji] = useState("💬");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState("all");
  const [showAch, setShowAch] = useState(false);
  const [achTitle, setAchTitle] = useState("");
  const [achDesc, setAchDesc] = useState("");
  const [achEmoji, setAchEmoji] = useState("🏆");
  const textRef = useRef(null);

  useEffect(() => { checkAccess(); }, []);

  async function checkAccess() {
    const res = await fetch("/api/community/access");
    const data = await res.json();
    setAccess(data);
    if (data.access) loadPosts("all");
    else setLoading(false);
  }

  async function loadPosts(t) {
    setLoading(true);
    const res = await fetch(`/api/community?type=${t || tab}`);
    const data = await res.json();
    if (data.posts) setPosts(data.posts);
    setLoading(false);
  }

  useEffect(() => { if (access?.access) loadPosts(tab); }, [tab]);

  async function sendPost() {
    if (!postText.trim()) return;
    setSending(true);
    const res = await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: postText.trim(), post_type: "message", emoji: postEmoji })
    });
    const data = await res.json();
    if (data.post) { setPosts(p => [data.post, ...p]); setPostText(""); setComposing(false); }
    setSending(false);
  }

  async function shareAch() {
    if (!achTitle.trim()) return;
    setSending(true);
    await fetch("/api/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: achTitle, description: achDesc, emoji: achEmoji })
    });
    setShowAch(false); setAchTitle(""); setAchDesc(""); setAchEmoji("🏆");
    await loadPosts(tab);
    setSending(false);
  }

  async function toggleLike(post) {
    const unlike = post.liked_by_me;
    setPosts(prev => prev.map(p => p.id === post.id
      ? { ...p, liked_by_me: !unlike, likes_count: p.likes_count + (unlike ? -1 : 1) }
      : p
    ));
    await fetch("/api/community/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: post.id, unlike })
    });
  }

  async function deletePost(id) {
    await fetch("/api/community", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setPosts(p => p.filter(x => x.id !== id));
  }

  function timeAgo(ts) {
    const s = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  }

  if (access && !access.access) return (
    <div className="root">
      <div className="orbs"><div className="o1"/><div className="o2"/><div className="o3"/></div>
      <nav className="nav">
        <button onClick={() => router.push("/")} className="logo">Lore AI<span className="logo-dot">.</span></button>
      </nav>
      <div className="gate">
        <div className="gate-card">
          <div style={{fontSize:44,marginBottom:20}}>🔒</div>
          <h2 className="gate-title">Founders Community</h2>
          <p className="gate-sub">Chat with fellow founders, share wins, and grow together. Free for our first 40 early adopters — Pro after that.</p>
          <div className="gate-stats">
            <div className="gate-stat"><div className="gsn">40</div><div className="gsl">Free spots</div></div>
            <div className="gdiv"/>
            <div className="gate-stat"><div className="gsn">Pro</div><div className="gsl">Unlimited</div></div>
            <div className="gdiv"/>
            <div className="gate-stat"><div className="gsn">24/7</div><div className="gsl">Live feed</div></div>
          </div>
          <button onClick={() => router.push("/pricing")} className="gate-btn">Get Pro →</button>
          <p style={{fontSize:11,color:"rgba(255,255,255,0.18)",marginTop:12}}>Already Pro? Save your profile to refresh access.</p>
        </div>
      </div>
      <Styles/>
    </div>
  );

  return (
    <div className="root">
      <div className="orbs"><div className="o1"/><div className="o2"/><div className="o3"/><div className="o4"/></div>

      <nav className="nav">
        <button onClick={() => router.push("/")} className="logo">Lore AI<span className="logo-dot">.</span></button>
        <div style={{display:"flex",gap:8}}>
          {access?.is_early_adopter && <div className="badge-e">⚡ Early #{access.user_number}</div>}
          {access?.is_pro && <div className="badge-p">★ Pro</div>}
        </div>
        <button onClick={() => router.push("/")} className="back-btn">← Back</button>
      </nav>

      <div className="layout">
        <div className="feed">
          <div className="feed-top">
            <div>
              <div className="eyebrow"><div className="dot"/>Founders only</div>
              <h1 className="h1">Community<span className="accent">.</span></h1>
            </div>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <button onClick={() => setShowAch(true)} className="btn-ach">🏆 Share win</button>
              <button onClick={() => { setComposing(true); setTimeout(() => textRef.current?.focus(), 80); }} className="btn-new">+ Post</button>
            </div>
          </div>

          <div className="tabs">
            {[["all","All"],["message","💬 Chat"],["achievement","🏆 Wins"]].map(([v,l]) => (
              <button key={v} onClick={() => setTab(v)} className={`tab ${tab===v?"tab-on":""}`}>{l}</button>
            ))}
          </div>

          {composing && (
            <div className="compose">
              <div className="emoji-row">{EMOJIS.map(e=><button key={e} onClick={()=>setPostEmoji(e)} className={`em ${postEmoji===e?"em-on":""}`}>{e}</button>)}</div>
              <textarea ref={textRef} value={postText} onChange={e=>setPostText(e.target.value)} placeholder="What's on your mind, founder?" className="compose-ta" rows={3} maxLength={1000}/>
              <div className="compose-foot">
                <span className="ccount">{postText.length}/1000</span>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{setComposing(false);setPostText("")}} className="btn-cancel">Cancel</button>
                  <button onClick={sendPost} disabled={sending||!postText.trim()} className="btn-send">{sending?"Posting...":"Post"}</button>
                </div>
              </div>
            </div>
          )}

          {showAch && (
            <div className="compose">
              <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:10}}>Share a win 🎉</div>
              <div className="emoji-row">{ACH_EMOJIS.map(e=><button key={e} onClick={()=>setAchEmoji(e)} className={`em ${achEmoji===e?"em-on":""}`}>{e}</button>)}</div>
              <input value={achTitle} onChange={e=>setAchTitle(e.target.value)} placeholder="What did you achieve?" className="compose-ta" style={{marginBottom:8,padding:"10px 12px"}} maxLength={120}/>
              <textarea value={achDesc} onChange={e=>setAchDesc(e.target.value)} placeholder="Tell us more (optional)..." className="compose-ta" rows={2} maxLength={500}/>
              <div className="compose-foot">
                <span className="ccount">{achTitle.length}/120</span>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setShowAch(false)} className="btn-cancel">Cancel</button>
                  <button onClick={shareAch} disabled={sending||!achTitle.trim()} className="btn-send">{sending?"Sharing...":"Share 🏆"}</button>
                </div>
              </div>
            </div>
          )}

          {loading ? <div className="empty">Loading...</div>
          : posts.length === 0 ? <div className="empty">No posts yet — be the first!</div>
          : <div className="posts">
            {posts.map(p => {
              const name = p.profiles?.full_name || "Founder";
              const num = p.profiles?.user_number;
              const isAch = p.post_type === "achievement";
              return (
                <div key={p.id} className={`post ${isAch?"post-ach":""}`}>
                  <div className="post-top">
                    <div className="avatar">
                      {p.profiles?.avatar_url
                        ? <img src={p.profiles.avatar_url} alt={name} style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}}/>
                        : name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="pname">
                        {name}
                        {num && num <= 40 && <span className="badge-e" style={{marginLeft:6,fontSize:9}}>⚡{num}</span>}
                      </div>
                      {p.profiles?.company_name && <div className="pcompany">{p.profiles.company_name}</div>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                      <span className="ptime">{timeAgo(p.created_at)}</span>
                      <button onClick={()=>deletePost(p.id)} className="pdel">×</button>
                    </div>
                  </div>
                  <div className={`pcontent ${isAch?"pcontent-ach":""}`}>
                    {isAch && <span style={{fontSize:20,flexShrink:0,marginRight:8}}>{p.emoji}</span>}
                    <span>{p.content.replace(/^.\s\*\*(.*?)\*\*/, "$1")}</span>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>toggleLike(p)} className={`btn-like ${p.liked_by_me?"btn-liked":""}`}>
                      {p.liked_by_me?"♥":"♡"}{p.likes_count > 0 ? ` ${p.likes_count}` : ""}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>}
        </div>

        <div className="sidebar">
          <div className="scard">
            <div className="stitle">Community rules</div>
            {["🤝 Be kind and supportive","🚀 Share real wins and lessons","💡 Ask questions freely","🚫 No spam or promo only"].map(r=>(
              <div key={r} className="sitem">{r}</div>
            ))}
          </div>
          <div className="scard" style={{marginTop:10}}>
            <div className="stitle">Your access</div>
            {access?.is_early_adopter && <div className="sitem" style={{color:"rgba(255,165,90,0.75)"}}>⚡ Early adopter #{access.user_number} — free forever</div>}
            {access?.is_pro && <div className="sitem" style={{color:"rgba(190,165,240,0.75)"}}>★ Pro member</div>}
            <div className="sitem">First 40 founders get lifetime free access</div>
          </div>
        </div>
      </div>
      <Styles/>
    </div>
  );
}

function Styles() {
  return <style>{`
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#06060a}
    .root{background:#06060a;color:#fff;font-family:'DM Sans',-apple-system,sans-serif;min-height:100vh;position:relative;overflow-x:hidden}
    .orbs{position:fixed;inset:0;pointer-events:none;filter:blur(110px);z-index:0}
    .o1{position:absolute;width:500px;height:500px;border-radius:50%;background:rgba(255,180,120,0.1);top:-200px;left:-100px;animation:f1 22s ease-in-out infinite}
    .o2{position:absolute;width:400px;height:400px;border-radius:50%;background:rgba(180,155,230,0.08);top:20%;left:10%;animation:f2 28s ease-in-out infinite}
    .o3{position:absolute;width:440px;height:440px;border-radius:50%;background:rgba(255,210,180,0.08);top:10%;right:-80px;animation:f3 24s ease-in-out infinite}
    .o4{position:absolute;width:380px;height:380px;border-radius:50%;background:rgba(190,165,240,0.07);bottom:-100px;right:-60px;animation:f4 20s ease-in-out infinite}
    @keyframes f1{0%,100%{transform:translate(0,0)}50%{transform:translate(28px,18px)}}
    @keyframes f2{0%,100%{transform:translate(0,0)}50%{transform:translate(-18px,32px)}}
    @keyframes f3{0%,100%{transform:translate(0,0)}50%{transform:translate(-25px,20px)}}
    @keyframes f4{0%,100%{transform:translate(0,0)}50%{transform:translate(-32px,-25px)}}

    .nav{position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:22px 44px;border-bottom:0.5px solid rgba(255,255,255,0.05)}
    .logo{font-weight:800;font-size:20px;letter-spacing:-0.02em;color:#f0ece8;background:none;border:none;cursor:pointer}
    .logo-dot{color:rgba(255,165,90,0.95)}
    .back-btn{font-size:12px;color:rgba(255,255,255,0.35);background:none;border:none;cursor:pointer;transition:color 0.2s}
    .back-btn:hover{color:rgba(255,255,255,0.7)}
    .badge-e{font-size:11px;background:rgba(255,165,90,0.1);border:0.5px solid rgba(255,165,90,0.25);color:rgba(255,165,90,0.9);border-radius:100px;padding:3px 10px}
    .badge-p{font-size:11px;background:rgba(190,165,240,0.1);border:0.5px solid rgba(190,165,240,0.25);color:rgba(190,165,240,0.9);border-radius:100px;padding:3px 10px}

    .layout{position:relative;z-index:10;display:grid;grid-template-columns:1fr 260px;gap:20px;padding:32px 44px;max-width:1080px;margin:0 auto}
    .feed-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px}
    .eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:10px;letter-spacing:0.12em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-bottom:8px}
    .dot{width:4px;height:4px;border-radius:50%;background:rgba(255,165,90,0.9);animation:dp 2.5s ease-in-out infinite}
    @keyframes dp{0%,100%{opacity:0.5}50%{opacity:1}}
    .h1{font-weight:800;font-size:40px;letter-spacing:-0.04em;color:#f0ece8}
    .accent{color:rgba(255,165,90,0.9)}

    .btn-ach{padding:9px 14px;border-radius:10px;font-size:13px;background:rgba(255,165,90,0.08);border:0.5px solid rgba(255,165,90,0.2);color:rgba(255,165,90,0.85);cursor:pointer;font-family:inherit;transition:all 0.2s}
    .btn-ach:hover{background:rgba(255,165,90,0.14)}
    .btn-new{padding:9px 18px;border-radius:10px;font-size:13px;background:rgba(255,255,255,0.92);color:#111;border:none;cursor:pointer;font-family:inherit;font-weight:500;transition:all 0.2s}
    .btn-new:hover{background:#fff;transform:translateY(-1px)}

    .tabs{display:flex;gap:4px;margin-bottom:16px;background:rgba(255,255,255,0.02);border:0.5px solid rgba(255,255,255,0.06);border-radius:10px;padding:4px}
    .tab{flex:1;padding:7px;border-radius:7px;font-size:12px;color:rgba(255,255,255,0.4);background:none;border:none;cursor:pointer;font-family:inherit;transition:all 0.2s}
    .tab-on{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.85)}

    .compose{background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,165,90,0.2);border-radius:14px;padding:16px;margin-bottom:16px}
    .emoji-row{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px}
    .em{font-size:16px;background:none;border:0.5px solid rgba(255,255,255,0.06);border-radius:7px;padding:3px 5px;cursor:pointer;transition:all 0.15s}
    .em-on{background:rgba(255,165,90,0.12);border-color:rgba(255,165,90,0.3)}
    .compose-ta{width:100%;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);border-radius:10px;color:#fff;font-size:13px;padding:10px 12px;font-family:inherit;outline:none;resize:none;line-height:1.6;display:block}
    .compose-ta::placeholder{color:rgba(255,255,255,0.25)}
    .compose-ta:focus{border-color:rgba(255,165,90,0.3)}
    .compose-foot{display:flex;align-items:center;justify-content:space-between;margin-top:10px}
    .ccount{font-size:10px;color:rgba(255,255,255,0.2)}
    .btn-cancel{padding:7px 14px;border-radius:8px;font-size:12px;background:none;border:0.5px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.4);cursor:pointer;font-family:inherit;transition:all 0.2s}
    .btn-cancel:hover{color:rgba(255,255,255,0.7)}
    .btn-send{padding:7px 18px;border-radius:8px;font-size:12px;background:rgba(255,255,255,0.9);color:#111;border:none;cursor:pointer;font-family:inherit;font-weight:500;transition:all 0.2s}
    .btn-send:hover{background:#fff}
    .btn-send:disabled{opacity:0.4;cursor:not-allowed}

    .posts{display:flex;flex-direction:column;gap:10px}
    .post{background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px;transition:border-color 0.2s}
    .post:hover{border-color:rgba(255,255,255,0.12)}
    .post-ach{background:rgba(255,165,90,0.04);border-color:rgba(255,165,90,0.15)}
    .post-ach:hover{border-color:rgba(255,165,90,0.28)}
    .post-top{display:flex;align-items:center;gap:10px;margin-bottom:12px}
    .avatar{width:34px;height:34px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,rgba(255,165,90,0.25),rgba(190,165,240,0.25));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:rgba(255,255,255,0.8);overflow:hidden}
    .pname{font-size:13px;font-weight:600;color:rgba(255,255,255,0.85);display:flex;align-items:center}
    .pcompany{font-size:11px;color:rgba(255,255,255,0.3);margin-top:1px}
    .ptime{font-size:10px;color:rgba(255,255,255,0.2)}
    .pdel{background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.15);font-size:18px;padding:0 2px;transition:color 0.2s;line-height:1}
    .pdel:hover{color:rgba(239,68,68,0.7)}
    .pcontent{font-size:13px;color:rgba(255,255,255,0.6);line-height:1.65;margin-bottom:12px;display:flex;align-items:flex-start}
    .pcontent-ach{color:rgba(255,255,255,0.82)}
    .btn-like{background:none;border:0.5px solid rgba(255,255,255,0.08);border-radius:100px;padding:4px 12px;font-size:12px;color:rgba(255,255,255,0.3);cursor:pointer;transition:all 0.2s;font-family:inherit}
    .btn-like:hover{border-color:rgba(255,100,100,0.3);color:rgba(255,100,100,0.7)}
    .btn-liked{border-color:rgba(255,100,100,0.3);color:rgba(255,100,100,0.85);background:rgba(255,100,100,0.06)}

    .empty{text-align:center;padding:60px 20px;font-size:13px;color:rgba(255,255,255,0.25)}

    .sidebar{display:flex;flex-direction:column}
    .scard{background:rgba(255,255,255,0.02);border:0.5px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px}
    .stitle{font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-bottom:12px}
    .sitem{font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:8px;line-height:1.5}

    .gate{position:relative;z-index:10;flex:1;display:flex;align-items:center;justify-content:center;padding:40px 24px;min-height:80vh}
    .gate-card{background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.09);border-radius:20px;padding:48px 40px;max-width:420px;width:100%;text-align:center}
    .gate-title{font-weight:800;font-size:26px;letter-spacing:-0.03em;color:#f0ece8;margin-bottom:12px}
    .gate-sub{font-size:14px;color:rgba(255,255,255,0.38);line-height:1.7;margin-bottom:28px}
    .gate-stats{display:flex;align-items:center;justify-content:center;margin-bottom:28px;background:rgba(255,255,255,0.02);border:0.5px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px}
    .gate-stat{flex:1;text-align:center}
    .gsn{font-weight:800;font-size:22px;letter-spacing:-0.03em;color:rgba(255,165,90,0.85)}
    .gsl{font-size:9px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.07em;margin-top:3px}
    .gdiv{width:0.5px;height:32px;background:rgba(255,255,255,0.06)}
    .gate-btn{display:inline-block;padding:12px 28px;border-radius:100px;background:rgba(255,255,255,0.92);color:#111;font-size:14px;font-weight:500;border:none;cursor:pointer;font-family:inherit;transition:all 0.2s}
    .gate-btn:hover{background:#fff;transform:translateY(-1px)}

    @media(max-width:900px){.layout{grid-template-columns:1fr;padding:24px 20px}.sidebar{display:none}.nav{padding:18px 20px}}
    @media(max-width:600px){.feed-top{flex-direction:column;gap:12px}.h1{font-size:32px}}
  `}</style>;
}
