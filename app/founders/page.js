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
    <div className="min-h-screen bg-black text-neutral-100 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.push("/")}
            className="text-[13px] text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Forge
          </button>
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold mb-3 tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-300 bg-clip-text text-transparent">
            Founders on Forge
          </span>
        </h1>
        <p className="text-neutral-300 mb-2 text-[15px] leading-relaxed max-w-2xl">
          A directory of Indian founders building real things. Discover what other founders are working on, what stage they are at, and where they are based.
        </p>
        <p className="text-neutral-500 mb-8 text-[13px] max-w-2xl">
          {founders.length} {founders.length === 1 ? "founder" : "founders"} listed. Only founders who opted in are shown. To appear here, turn on visibility in your <a href="/profile" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">profile settings</a>.
        </p>

        <div className="relative mb-8">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by name, sector, city, or what they're building..."
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-purple-400/50 transition-colors text-[14px] placeholder-neutral-600"
          />
        </div>

        {loading ? (
          <div className="text-neutral-500 text-center py-12">Loading founders...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-400 text-[15px] mb-2">
              {founders.length === 0 ? "No founders are public yet." : "No founders match your search."}
            </p>
            {founders.length === 0 && (
              <p className="text-neutral-600 text-[13px]">
                Be the first — make your profile public from your settings.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((f) => (
              <div key={f.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  {f.avatar_url ? (
                    <img src={f.avatar_url} alt={f.full_name} className="w-10 h-10 rounded-full flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 flex items-center justify-center text-white text-[14px] font-semibold">
                      {(f.full_name || "F").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold truncate">{f.full_name || "Anonymous Founder"}</div>
                    {f.company_name && (
                      <div className="text-[12px] text-neutral-500 truncate">{f.company_name}</div>
                    )}
                  </div>
                </div>

                {f.what_building && (
                  <p className="text-[13px] text-neutral-300 mb-3 leading-relaxed">
                    {f.what_building}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {f.sector && (
                    <span className="text-[11px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {f.sector}
                    </span>
                  )}
                  {f.stage && (
                    <span className="text-[11px] px-2 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {f.stage}
                    </span>
                  )}
                  {f.city && (
                    <span className="text-[11px] px-2 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
                      📍 {f.city}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
