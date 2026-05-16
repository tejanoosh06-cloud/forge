"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SECTORS = ["SaaS / B2B Software", "D2C / Consumer Brand", "Fintech", "Edtech", "Healthtech", "Agritech", "AI / ML", "Marketplace", "Hardware / Robotics", "Gaming / Media", "Climate / Energy", "Other"];
const STAGES = ["Idea (no MVP yet)", "MVP / Pre-launch", "Launched (no revenue)", "Early Revenue", "Growth (PMF found)", "Funded (Pre-seed/Seed)", "Funded (Series A+)"];

export default function ProfileSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    company_name: "",
    sector: "",
    stage: "",
    city: "",
    what_building: "",
    is_public: false,
  });

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.profile) {
        setForm({
          full_name: data.profile.full_name || "",
          company_name: data.profile.company_name || "",
          sector: data.profile.sector || "",
          stage: data.profile.stage || "",
          city: data.profile.city || "",
          what_building: data.profile.what_building || "",
          is_public: data.profile.is_public || false,
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/");
    } else {
      alert("Failed to save. Please try again.");
    }
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-neutral-500">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold mb-3 tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-300 bg-clip-text text-transparent">
            Tell Forge about you
          </span>
        </h1>
        <p className="text-neutral-500 mb-10 text-[15px] leading-relaxed">
          This stays private to you. Forge uses it to give answers tailored to your stage, sector, and what you are building.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[13px] font-medium text-neutral-300 mb-2">Your name</label>
            <input type="text" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Your full name" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-purple-400/50 transition-colors text-[15px]" required />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-neutral-300 mb-2">Company / Product name</label>
            <input type="text" value={form.company_name} onChange={(e) => update("company_name", e.target.value)} placeholder="e.g. Acme Inc." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-purple-400/50 transition-colors text-[15px]" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-neutral-300 mb-2">What are you building?</label>
            <textarea value={form.what_building} onChange={(e) => update("what_building", e.target.value)} placeholder="A 1-2 line description of what you are building..." rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-purple-400/50 transition-colors text-[15px] resize-none" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-neutral-300 mb-2">Sector</label>
            <select value={form.sector} onChange={(e) => update("sector", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-purple-400/50 transition-colors text-[15px]">
              <option value="">Select a sector...</option>
              {SECTORS.map((s) => (<option key={s} value={s} className="bg-neutral-900">{s}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-neutral-300 mb-2">Stage</label>
            <select value={form.stage} onChange={(e) => update("stage", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-purple-400/50 transition-colors text-[15px]">
              <option value="">Select your stage...</option>
              {STAGES.map((s) => (<option key={s} value={s} className="bg-neutral-900">{s}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-neutral-300 mb-2">City</label>
            <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="e.g. Bengaluru, Mumbai, Delhi..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-purple-400/50 transition-colors text-[15px]" />
          </div>
          <div className="pt-4 pb-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.is_public}
                onChange={(e) => update("is_public", e.target.checked)}
                className="mt-1 w-4 h-4 rounded accent-purple-500"
              />
              <div className="flex-1">
                <div className="text-[14px] font-medium text-neutral-200">Show me on the Founders Directory</div>
                <div className="text-[12px] text-neutral-500 mt-0.5">Other founders signed in to Forge will be able to see your profile. You can turn this off any time.</div>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => router.push("/")} className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-[14px] text-neutral-300">Skip for now</button>
            <button type="submit" disabled={saving} className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 hover:opacity-90 transition-opacity text-[14px] font-medium text-white disabled:opacity-50">
              {saving ? "Saving..." : "Save and continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
