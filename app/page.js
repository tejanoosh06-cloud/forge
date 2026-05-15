"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Topic-specific loading message banks
const LOADING_MESSAGE_BANKS = {
  fundraising: [
    "Consulting Indian VC playbooks...",
    "Pulling up recent funding data...",
    "Thinking like a Peak XV partner...",
    "Reviewing angel networks...",
  ],
  tax: [
    "Pulling up GST rules...",
    "Reviewing Income Tax sections...",
    "Checking Section 80IAC benefits...",
    "Looking up tax compliance...",
  ],
  legal: [
    "Reading MCA guidelines...",
    "Reviewing ROC compliance...",
    "Checking the Companies Act...",
    "Pulling up legal precedents...",
  ],
  compliance: [
    "Checking DPIIT guidelines...",
    "Reviewing FEMA compliance...",
    "Looking up MCA filings...",
    "Checking regulatory rules...",
  ],
  hiring: [
    "Reviewing ESOP frameworks...",
    "Pulling up Indian hiring norms...",
    "Checking labour laws...",
    "Drafting the right structure...",
  ],
  marketing: [
    "Analyzing Indian market data...",
    "Reviewing GTM playbooks...",
    "Looking up channel strategies...",
    "Studying Bharat market trends...",
  ],
  product: [
    "Reviewing product playbooks...",
    "Analyzing user psychology...",
    "Pulling up case studies...",
    "Thinking through tradeoffs...",
  ],
  payments: [
    "Reviewing UPI flows...",
    "Checking Razorpay docs...",
    "Looking up payment regs...",
    "Analyzing transaction models...",
  ],
  general: [
    "Thinking like a senior founder...",
    "Connecting the dots...",
    "Drafting a sharp answer...",
    "Crunching the details...",
    "Looking at this from all angles...",
    "Working through this carefully...",
  ],
};

function pickMessageBank(question) {
  const q = question.toLowerCase();
  if (/raise|funding|fundrais|vc|angel|investor|seed|series|safe note|valuation|pitch|term sheet/.test(q)) return "fundraising";
  if (/gst|tax|income tax|80iac|tds|cess|deduction/.test(q)) return "tax";
  if (/legal|contract|agreement|nda|incorporation|llp|pvt ltd|company|register|roc|mca/.test(q)) return "legal";
  if (/dpiit|fema|fdi|compliance|regulation|startup india|msme/.test(q)) return "compliance";
  if (/hire|hiring|employee|esop|salary|recruit|team|cto|cofounder|co-founder/.test(q)) return "hiring";
  if (/market|gtm|growth|customer|sales|tier 2|tier 3|bharat|brand|positioning|launch/.test(q)) return "marketing";
  if (/product|feature|user|ux|design|mvp|build|launch/.test(q)) return "product";
  if (/upi|razorpay|cashfree|payment|paytm|phonepe|gateway/.test(q)) return "payments";
  return "general";
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Thinking...");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [theme, setTheme] = useState("dark");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("forge-theme") : null;
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("forge-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) return;

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const bankKey = lastUserMessage ? pickMessageBank(lastUserMessage.content) : "general";
    const bank = LOADING_MESSAGE_BANKS[bankKey];

    let idx = 0;
    setLoadingMessage(bank[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % bank.length;
      setLoadingMessage(bank[idx]);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading, messages]);

  async function sendMessage(text) {
    const messageText = (text || input).trim();
    if (!messageText || loading) return;

    const newMessages = [...messages, { role: "user", content: messageText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    let chatId = activeChatId;
    if (!chatId) {
      chatId = Date.now();
      const title = messageText.slice(0, 40) + (messageText.length > 40 ? "..." : "");
      setChats((prev) => [{ id: chatId, title, messages: newMessages }, ...prev]);
      setActiveChatId(chatId);
    } else {
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, messages: newMessages } : c))
      );
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      const finalMessages = data.reply
        ? [...newMessages, { role: "assistant", content: data.reply }]
        : [...newMessages, { role: "assistant", content: "Something went wrong. Try again?" }];
      setMessages(finalMessages);
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, messages: finalMessages } : c))
      );
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Network issue. Check your connection?" }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function newChat() {
    setMessages([]);
    setActiveChatId(null);
    setInput("");
  }

  function loadChat(chat) {
    setMessages(chat.messages);
    setActiveChatId(chat.id);
  }

  function deleteChat(e, id) {
    e.stopPropagation();
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) newChat();
  }

  const isEmpty = messages.length === 0;
  const isDark = theme === "dark";

  const chatInputBox = (
    <div className="relative w-full">
      <div className="absolute -inset-6 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-300/10 blur-3xl opacity-50 rounded-full pointer-events-none"></div>

      <div className="relative rounded-2xl p-[1.5px] forge-gradient-border">
        <div className={`flex gap-2 items-end rounded-2xl ${
          isDark ? "bg-neutral-950/80" : "bg-white/80"
        } backdrop-blur-2xl`}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask anything..."
            rows={1}
            className={`flex-1 resize-none px-5 py-4 bg-transparent outline-none text-[15px] max-h-32 ${
              isDark ? "text-neutral-100 placeholder-neutral-500" : "text-neutral-900 placeholder-neutral-400"
            }`}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className={`m-2 w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
              input.trim() && !loading
                ? "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 hover:opacity-90 text-white shadow-lg shadow-purple-500/20"
                : isDark
                  ? "bg-white/5 text-neutral-600 cursor-not-allowed"
                  : "bg-black/5 text-neutral-400 cursor-not-allowed"
            }`}
            aria-label="Send"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 14V2M8 2L3 7M8 2L13 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? "bg-black text-neutral-100" : "bg-[#FAFAF7] text-neutral-900"}`}>
      {/* SIDEBAR */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${
          isDark ? "border-r border-white/5 bg-[#0A0A0A]" : "border-r border-black/5 bg-[#F4F2EC]"
        }`}
      >
        <div className="w-64 h-full flex flex-col">
          <div className="px-4 py-4 flex items-center justify-between">
            <span className="font-semibold tracking-tight text-[15px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-300 bg-clip-text text-transparent">
              Forge
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`p-1.5 rounded-md transition-colors ${
                isDark ? "hover:bg-white/5 text-neutral-500 hover:text-neutral-200" : "hover:bg-black/5 text-neutral-500 hover:text-neutral-800"
              }`}
              aria-label="Close sidebar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="px-3 pb-3">
            <button
              onClick={newChat}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                isDark ? "hover:bg-white/5 text-neutral-300 hover:text-neutral-100" : "hover:bg-black/5 text-neutral-700 hover:text-neutral-900"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {chats.length === 0 ? (
              <div className={`px-3 py-2 text-xs ${isDark ? "text-neutral-600" : "text-neutral-400"}`}>No chats yet</div>
            ) : (
              <>
                <div className={`px-3 py-2 text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-neutral-600" : "text-neutral-400"}`}>
                  Recent
                </div>
                <div className="space-y-0.5">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => loadChat(chat)}
                      className={`group w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors flex items-center justify-between gap-2 ${
                        activeChatId === chat.id
                          ? isDark ? "bg-white/5 text-neutral-100" : "bg-black/5 text-neutral-900"
                          : isDark ? "text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200" : "text-neutral-600 hover:bg-black/[0.03] hover:text-neutral-900"
                      }`}
                    >
                      <span className="truncate flex-1">{chat.title}</span>
                      <span
                        onClick={(e) => deleteChat(e, chat.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-0.5"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/>
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={`px-3 py-3 border-t flex items-center justify-end ${isDark ? "border-white/5" : "border-black/5"}`}>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`p-1.5 rounded-md transition-colors ${
                isDark ? "hover:bg-white/5 text-neutral-400 hover:text-neutral-100" : "hover:bg-black/5 text-neutral-500 hover:text-neutral-900"
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className={`absolute top-4 left-4 z-20 p-2 rounded-lg transition-colors ${
              isDark ? "hover:bg-white/5 text-neutral-400 hover:text-neutral-100" : "hover:bg-black/5 text-neutral-500 hover:text-neutral-900"
            }`}
            aria-label="Open sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        )}

        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-2xl flex flex-col items-center">
              <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight text-center">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-300 bg-clip-text text-transparent">
                  What are you building?
                </span>
              </h1>
              <p className={`max-w-md leading-relaxed text-[15px] text-center mb-10 ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>
                Your AI co-founder for India.
              </p>
              {chatInputBox}
              <p className={`text-[11px] text-center mt-3 ${isDark ? "text-neutral-700" : "text-neutral-400"}`}>
                Forge can make mistakes. Verify important info.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="space-y-6 pt-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      {msg.role === "user" ? (
                        <div className={`max-w-[85%] whitespace-pre-wrap leading-relaxed text-[15px] px-4 py-3 rounded-2xl rounded-br-md backdrop-blur-xl ${
                          isDark
                            ? "bg-white/5 border border-white/10 text-neutral-100"
                            : "bg-black/5 border border-black/10 text-neutral-900"
                        }`}>
                          {msg.content}
                        </div>
                      ) : (
                        <div className={`max-w-[85%] text-[15px] markdown-body ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                      <div className="flex items-center gap-3 px-1 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                        <span
                          key={loadingMessage}
                          className="text-sm bg-gradient-to-r from-blue-400 via-purple-400 to-pink-300 bg-clip-text text-transparent animate-in fade-in duration-500"
                        >
                          {loadingMessage}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="relative px-4 pb-6 pt-4">
              <div className="max-w-3xl mx-auto">
                {chatInputBox}
                <p className={`text-[11px] text-center mt-3 ${isDark ? "text-neutral-700" : "text-neutral-400"}`}>
                  Forge can make mistakes. Verify important info.
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      <style jsx global>{`
        @keyframes forgeGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .forge-gradient-border {
          background: linear-gradient(
            90deg,
            rgba(96, 165, 250, 0.6),
            rgba(168, 85, 247, 0.5),
            rgba(244, 114, 182, 0.5),
            rgba(168, 85, 247, 0.5),
            rgba(96, 165, 250, 0.6)
          );
          background-size: 300% 100%;
          animation: forgeGradient 8s ease infinite;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.35); }

        .markdown-body { line-height: 1.7; }
        .markdown-body h1 { font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 0.75rem; letter-spacing: -0.02em; }
        .markdown-body h2 { font-size: 1.25rem; font-weight: 700; margin: 1.5rem 0 0.5rem; letter-spacing: -0.01em; }
        .markdown-body h3 { font-size: 1.05rem; font-weight: 600; margin: 1.25rem 0 0.5rem; }
        .markdown-body h4 { font-size: 0.95rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .markdown-body p { margin: 0.5rem 0; }
        .markdown-body strong { font-weight: 600; }
        .markdown-body em { font-style: italic; }
        .markdown-body ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .markdown-body ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .markdown-body li { margin: 0.35rem 0; padding-left: 0.25rem; }
        .markdown-body li::marker { color: rgb(168, 85, 247); }
        .dark .markdown-body code { background: rgba(255,255,255,0.08); color: rgb(196,181,253); }
        .light .markdown-body code { background: rgba(0,0,0,0.06); color: rgb(124,58,237); }
        .markdown-body code { padding: 0.15rem 0.4rem; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 0.875em; }
        .dark .markdown-body pre { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); }
        .light .markdown-body pre { background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.08); }
        .markdown-body pre { padding: 1rem; border-radius: 12px; overflow-x: auto; margin: 0.75rem 0; }
        .markdown-body pre code { background: transparent; padding: 0; }
        .markdown-body blockquote { border-left: 3px solid rgb(168,85,247); padding-left: 1rem; margin: 0.75rem 0; font-style: italic; opacity: 0.85; }
        .markdown-body a { color: rgb(96,165,250); text-decoration: underline; text-underline-offset: 2px; }
        .markdown-body a:hover { color: rgb(147,197,253); }
        .dark .markdown-body hr { border-top: 1px solid rgba(255,255,255,0.08); }
        .light .markdown-body hr { border-top: 1px solid rgba(0,0,0,0.1); }
        .markdown-body hr { border: none; margin: 1.5rem 0; }
        .markdown-body table { border-collapse: collapse; margin: 0.75rem 0; width: 100%; }
        .dark .markdown-body th, .dark .markdown-body td { border: 1px solid rgba(255,255,255,0.1); }
        .light .markdown-body th, .light .markdown-body td { border: 1px solid rgba(0,0,0,0.1); }
        .markdown-body th, .markdown-body td { padding: 0.5rem 0.75rem; text-align: left; }
        .dark .markdown-body th { background: rgba(255,255,255,0.03); font-weight: 600; }
        .light .markdown-body th { background: rgba(0,0,0,0.03); font-weight: 600; }
      `}</style>
    </div>
  );
}