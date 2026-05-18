"use client";

import { useEffect, useState } from "react";

export default function PrivacyPage() {
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
            Privacy Policy
          </span>
        </h1>
        <p className={`mb-10 text-[13px] ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>Last updated: May 17, 2026</p>

        <div className={`space-y-6 text-[15px] leading-relaxed ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>1. Who We Are</h2>
            <p>Lore AI is an AI co-founder tool for Indian founders, accessible at loreai.in. This privacy policy explains how we collect, use, and protect your information.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>2. Information We Collect</h2>
            <p>When you sign in with Google, we receive your name, email address, and profile picture from Google. We do not store your Google password.</p>
            <p className="mt-3">When you fill out your profile, we collect what you choose to share — company name, sector, stage, city, and a description of what you are building.</p>
            <p className="mt-3">When you chat with Lore AI, we store your messages and Lore AI's responses. This is what allows Lore AI to remember your conversations across sessions and devices.</p>
            <p className="mt-3">When you upload a PDF, we extract the text content to send to our AI model for analysis. We do not permanently store the PDF file itself — only the extracted text within your chat history.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>3. How We Use Your Data</h2>
            <p>Your data is used only to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide Lore AI's chat service to you</li>
              <li>Remember your profile and past conversations</li>
              <li>Personalize Lore AI's responses based on your founder context</li>
              <li>Display your profile in the Founders Directory — only if you opt in</li>
            </ul>
            <p className="mt-3">We do not sell your data. We do not share it with advertisers. We do not use it to train AI models.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>4. Third-Party Services</h2>
            <p>Lore AI uses these services to operate:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Google</strong> — for sign-in authentication</li>
              <li><strong>Supabase</strong> — for storing your profile and chat history (database hosted in Mumbai, India)</li>
              <li><strong>Sarvam AI</strong> — Indian AI provider that processes your messages to generate Lore AI's responses</li>
              <li><strong>Vercel</strong> — hosts the Lore AI app</li>
            </ul>
            <p className="mt-3">When you send a message, your message content is sent to Sarvam AI for processing. Sarvam does not store your data beyond the duration of the API call, per their privacy terms.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>5. Founders Directory</h2>
            <p>The Founders Directory is opt-in. Your profile only appears there if you toggle "Show me on the Founders Directory" in your profile settings. You can turn this off any time, and your profile will be removed from the directory.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>6. Your Rights (DPDP Act, 2023)</h2>
            <p>Under India's Digital Personal Data Protection Act, you have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Correct or update your data</li>
              <li>Request deletion of your account and all associated data</li>
              <li>Withdraw consent for data processing</li>
              <li>File a complaint with the Data Protection Board of India</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at the email below. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>7. Data Security</h2>
            <p>Your data is encrypted at rest and in transit. Database access is restricted by Row-Level Security policies — you can only access your own data. We use industry-standard practices but cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>8. Data Retention</h2>
            <p>We retain your data as long as your account is active. If you delete your account, all your data — profile, chats, messages — is permanently deleted within 30 days.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>9. Children</h2>
            <p>Lore AI is designed for users 17 and above. We do not knowingly collect data from children under 18 without verifiable parental consent, as required by the DPDP Act.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>10. Changes to This Policy</h2>
            <p>If we materially change this policy, we will notify users via email or an in-app notice before the changes take effect.</p>
          </section>

          <section>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>11. Contact</h2>
            <p>For any questions, concerns, or requests related to your data, contact the Lore AI team at:</p>
            <p className="mt-2"><strong>Email:</strong> tejanoosh06@gmail.com</p>
            <p className="mt-2">For DPDP-related complaints, you may also contact the Data Protection Board of India at dpb.gov.in (once fully operational).</p>
          </section>

        </div>

        <div className={`mt-16 pt-6 border-t text-[12px] ${isDark ? "border-white/10 text-neutral-600" : "border-black/10 text-neutral-400"}`}>
          <a href="/terms" className={`mr-4 transition-colors ${isDark ? "hover:text-neutral-300" : "hover:text-neutral-700"}`}>Terms of Service</a>
          <a href="/" className={`transition-colors ${isDark ? "hover:text-neutral-300" : "hover:text-neutral-700"}`}>Back to Lore AI</a>
        </div>
      </div>
    </div>
  );
}
