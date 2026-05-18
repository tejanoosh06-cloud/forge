"use client";

import { useEffect, useState } from "react";

export default function TermsPage() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("forge-theme") : null;
    setIsDark(saved !== "light");
  }, []);

  return (
    <div className={`min-h-screen py-12 px-6 ${isDark ? "bg-black text-neutral-100" : "bg-[#FAFAF7] text-neutral-900"}`}>
      <div className="max-w-3xl mx-auto">
        <a href="/" className={`text-[13px] mb-6 inline-flex items-center gap-1 transition-colors ${isDark ? "text-neutral-500 hover:text-neutral-300" : "text-neutral-500 hover:text-neutral-800"}`}>
          ← Back to Lore AI
        </a>

        <h1 className="text-3xl md:text-4xl font-semibold mb-3 tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-300 bg-clip-text text-transparent">
            Terms of Service
          </span>
        </h1>
        <p className={`mb-10 text-[13px] ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>Last updated: May 17, 2026</p>

        <div className={`space-y-6 text-[15px] leading-relaxed ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>1. What Lore AI Is</h2>
            <p>Lore AI is an AI-powered tool that gives founders advice, frameworks, and information related to building startups in India. By using Lore AI, you agree to these terms.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>2. Not Professional Advice</h2>
            <p>Lore AI provides general business guidance. It is NOT a substitute for professional advice from a:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Chartered Accountant (CA)</li>
              <li>Lawyer or legal counsel</li>
              <li>Financial advisor</li>
              <li>Medical professional</li>
              <li>Tax consultant</li>
            </ul>
            <p className="mt-3">Any legal, financial, tax, medical, or regulatory information shared by Lore AI is for educational purposes only. Always verify important decisions with a qualified professional before acting on them.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>3. AI Can Make Mistakes</h2>
            <p>Lore AI uses AI to generate responses. AI models can produce incorrect, outdated, or misleading information. We display a "Lore AI can make mistakes" notice in the app for this reason.</p>
            <p className="mt-3">You are responsible for verifying any factual claims, legal information, market data, or financial figures before acting on them. Do not rely on Lore AI alone for high-stakes decisions.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>4. Acceptable Use</h2>
            <p>You agree NOT to use Lore AI to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Generate illegal content or facilitate illegal activity</li>
              <li>Harass, threaten, or harm any person or business</li>
              <li>Upload copyrighted material you do not have rights to</li>
              <li>Attempt to extract, reverse-engineer, or replicate Lore AI's underlying systems</li>
              <li>Use Lore AI for spam, scams, or fraud</li>
              <li>Bypass authentication, rate limits, or security measures</li>
              <li>Misrepresent yourself or another person</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>5. Your Content</h2>
            <p>You own the content you upload to Lore AI (PDFs, profile details, chat messages). By using Lore AI, you grant us a limited license to process this content for the sole purpose of providing the service to you.</p>
            <p className="mt-3">We do not use your content to train AI models. We do not sell or share your content.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>6. Founders Directory</h2>
            <p>If you opt in to the Founders Directory, other signed-in Lore AI users can see your profile information (name, company, sector, stage, city, what you're building). You can opt out anytime.</p>
            <p className="mt-3">You agree not to use directory information to harass, spam, or harm other founders. Misuse may result in account termination.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>7. Service Availability</h2>
            <p>Lore AI is provided "as is" without guarantees of uptime, accuracy, or availability. We may modify, suspend, or discontinue features at any time. We are not liable for any losses arising from service interruptions.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by Indian law, Lore AI and its operators are not liable for any indirect, incidental, or consequential damages arising from your use of the service. This includes but is not limited to financial losses, business losses, or decisions made based on Lore AI's responses.</p>
            <p className="mt-3">Our total liability for any claim shall not exceed ₹1,000 or the amount you paid Lore AI in the past 12 months, whichever is higher.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>9. Account Termination</h2>
            <p>You can delete your account anytime by contacting us. We may suspend or terminate accounts that violate these terms, with or without notice.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>10. Jurisdiction</h2>
            <p>These terms are governed by the laws of India. Any disputes will be resolved in the courts of Hyderabad, Telangana, India.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>11. Changes to These Terms</h2>
            <p>We may update these terms occasionally. Continued use of Lore AI after changes means you accept the updated terms. Material changes will be notified via email or in-app notice.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>12. Contact</h2>
            <p>Questions or concerns about these terms? Email: <strong>tejanoosh06@gmail.com</strong></p>
          </section>

        </div>

        <div className={`mt-16 pt-6 border-t text-[12px] ${isDark ? "border-white/10 text-neutral-600" : "border-black/10 text-neutral-400"}`}>
          <a href="/privacy" className={`mr-4 transition-colors ${isDark ? "hover:text-neutral-300" : "hover:text-neutral-700"}`}>Privacy Policy</a>
          <a href="/" className={`transition-colors ${isDark ? "hover:text-neutral-300" : "hover:text-neutral-700"}`}>Back to Lore AI</a>
        </div>
      </div>
    </div>
  );
}
