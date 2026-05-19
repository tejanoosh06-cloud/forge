"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/client";

const LOADING_MESSAGE_BANKS = {
  fundraising: ["Consulting Indian VC playbooks...", "Pulling up recent funding data...", "Thinking like a Peak XV partner...", "Reviewing angel networks..."],
  tax: ["Pulling up GST rules...", "Reviewing Income Tax sections...", "Checking Section 80IAC benefits...", "Looking up tax compliance..."],
  legal: ["Reading MCA guidelines...", "Reviewing ROC compliance...", "Checking the Companies Act...", "Pulling up legal precedents..."],
  compliance: ["Checking DPIIT guidelines...", "Reviewing FEMA compliance...", "Looking up MCA filings...", "Checking regulatory rules..."],
  hiring: ["Reviewing ESOP frameworks...", "Pulling up Indian hiring norms...", "Checking labour laws...", "Drafting the right structure..."],
  marketing: ["Analyzing Indian market data...", "Reviewing GTM playbooks...", "Looking up channel strategies...", "Studying Bharat market trends..."],
  product: ["Reviewing product playbooks...", "Analyzing user psychology...", "Pulling up case studies...", "Thinking through tradeoffs..."],
  payments: ["Reviewing UPI flows...", "Checking Razorpay docs...", "Looking up payment regs...", "Analyzing transaction models..."],
  pdf: ["Reading your document...", "Extracting the key points...", "Analyzing what is in this PDF...", "Cross-referencing with what I know..."],
  general: ["Thinking like a senior founder...", "Connecting the dots...", "Drafting a sharp answer...", "Crunching the details...", "Looking at this from all angles...", "Working through this carefully..."],
};

function pickMessageBank(question, hasPdf) {
  if (hasPdf) return "pdf";
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

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Thinking...");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const TASKS_FEATURE_ENABLED = false; // TODO: re-enable when /api/tasks is stable

  const loadTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
    } catch {}
  };

  const toggleTask = async (id, done) => {
    setTasks(prev => prev.map(t => t.id === id ? {...t, done} : t));
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done }),
    });
  };

  const extractTasks = async (message, chatId) => {
    if (!message || message.length < 60) {
      console.log("[tasks] message too short, skipping extract");
      return;
    }
    try {
      console.log("[tasks] calling extract for chat", chatId);
      const res = await fetch("/api/tasks/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, chat_id: chatId }),
      });
      const data = await res.json();
      console.log("[tasks] extract result:", data);
      if (data.tasks && data.tasks.length > 0) {
        const saveRes = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks: data.tasks, source_chat_id: chatId }),
        });
        const saveData = await saveRes.json();
        console.log("[tasks] save result:", saveData);
        await loadTasks();
        console.log("[tasks] reloaded UI");
      } else {
        console.log("[tasks] no tasks extracted, reason:", data.reason);
      }
    } catch (err) {
      console.error("[tasks] extraction failed:", err);
    }
  };

  const [proPlusAvailable, setProPlusAvailable] = useState(true);
  const [proPlusArmed, setProPlusArmed] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const res = await fetch("/api/chats");
        const data = await res.json();
        setChats(data.chats || []);
        checkProPlusAvailability();
        loadTasks();
      }
    }
    init();
  }, []);

  async function checkProPlusAvailability() {
    try {
      const res = await fetch("/api/proplus");
      const data = await res.json();
      setProPlusAvailable(data.available);
    } catch {}
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

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
    const hasPdf = !!attachedFile;
    const bankKey = lastUserMessage ? pickMessageBank(lastUserMessage.content, hasPdf) : "general";
    const bank = LOADING_MESSAGE_BANKS[bankKey];
    let idx = 0;
    setLoadingMessage(bank[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % bank.length;
      setLoadingMessage(bank[idx]);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading, messages, attachedFile]);

  async function refreshChatList() {
    const res = await fetch("/api/chats");
    const data = await res.json();
    setChats(data.chats || []);
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only PDF files are supported right now.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File too large. Max 10 MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Could not read PDF.");
        setUploading(false);
        return;
      }

      setAttachedFile({
        name: data.filename,
        size: data.size,
        text: data.text,
        truncated: data.truncated,
      });
    } catch (err) {
      setUploadError("Network issue uploading file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeAttachedFile() {
    setAttachedFile(null);
    setUploadError("");
  }

  function stopGenerating() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setStreaming(false);
  }

  async function sendMessage(text) {
    const messageText = (text || input).trim();
    if ((!messageText && !attachedFile) || loading || streaming || uploading) return;

    // Build the user-visible message
    const userVisibleContent = attachedFile
      ? `📄 ${attachedFile.name}\n\n${messageText || "What do you think of this document?"}`
      : messageText;

    // Build the actual message sent to AI (with PDF text appended)
    const aiPayloadContent = attachedFile
      ? `[The user attached a PDF named "${attachedFile.name}". Here is its extracted text${attachedFile.truncated ? " (truncated to fit)" : ""}:\n\n---\n${attachedFile.text}\n---\n\nUser's question about this document: ${messageText || "Please review this document and give honest, specific feedback."}]`
      : messageText;

    const newMessagesForUI = [...messages, { role: "user", content: userVisibleContent }];
    const newMessagesForAI = [...messages.map(m => ({ role: m.role, content: m.content })), { role: "user", content: aiPayloadContent }];

    setMessages(newMessagesForUI);
    setInput("");
    const fileSnapshot = attachedFile;
    setAttachedFile(null);
    setLoading(true);

    let chatId = activeChatId;
    if (!chatId) {
      const title = (messageText || (fileSnapshot ? `Review: ${fileSnapshot.name}` : "New chat")).slice(0, 60);
      const createRes = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const createData = await createRes.json();
      chatId = createData.chat?.id;
      if (chatId) {
        setActiveChatId(chatId);
        refreshChatList();
      }
    }

    if (chatId) {
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, role: "user", content: userVisibleContent }),
      });
    }

    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessagesForAI, pro_plus_requested: proPlusArmed }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok || !res.body) {
        // Handle rate limit responses specifically
        if (res.status === 429) {
          try {
            const data = await res.json();
            setMessages([...newMessagesForUI, { role: "assistant", content: data.message || "Rate limit reached. Try again later." }]);
          } catch {
            setMessages([...newMessagesForUI, { role: "assistant", content: "Rate limit reached. Try again later." }]);
          }
        } else {
          // Try to read backend's helpful message for any error status
          try {
            const data = await res.json();
            setMessages([...newMessagesForUI, { role: "assistant", content: data.message || "Something went wrong. Try again?" }]);
          } catch {
            setMessages([...newMessagesForUI, { role: "assistant", content: "Something went wrong. Try again?" }]);
          }
        }
        setLoading(false);
        return;
      }

      setLoading(false);
      setStreaming(true);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages([...newMessagesForUI, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: assistantText };
          return copy;
        });
      }

      if (chatId && assistantText) {
        fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, role: "assistant", content: assistantText }),
        });
        refreshChatList();
        extractTasks(assistantText, chatId);
      }
    } catch (err) {
      if (err.name === "AbortError") {
        // User clicked stop — don't show an error, just keep the partial response
      } else {
        setMessages([...newMessagesForUI, { role: "assistant", content: "Network issue. Check your connection?" }]);
      }
    } finally {
      setLoading(false);
      setStreaming(false);
      // If Pro+ was used, refresh availability + disarm
      if (proPlusArmed) {
        setProPlusArmed(false);
        checkProPlusAvailability();
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function newChat() {
    // Generate a memory from the chat we're leaving (background, fire-and-forget)
    if (activeChatId && messages.length >= 4) {
      fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: activeChatId }),
      }).catch(() => {}); // Silent fail - memory generation is non-critical
    }

    setMessages([]);
    setActiveChatId(null);
    setInput("");
    setAttachedFile(null);
    setUploadError("");
  }

  async function loadChat(chat) {
    setActiveChatId(chat.id);
    setMessages([]);
    setAttachedFile(null);
    const res = await fetch(`/api/chats/${chat.id}`);
    const data = await res.json();
    setMessages(data.messages || []);
  }

  async function deleteChat(e, id) {
    e.stopPropagation();
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) newChat();
    await fetch(`/api/chats/${id}`, { method: "DELETE" });
  }

  const isEmpty = messages.length === 0;
  const isDark = theme === "dark";
  const isBusy = loading || streaming || uploading;

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Founder";
  const userEmail = user?.email || "";
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userInitial = userName.charAt(0).toUpperCase();

  const chatInputBox = (
    <div className="relative w-full">
      <div className="absolute -inset-6 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-300/10 blur-3xl opacity-50 rounded-full pointer-events-none"></div>

      {/* Pro+ toggle button */}
      {user && (
        <div className="relative mb-2 flex items-center justify-end">
          {proPlusAvailable ? (
            <button
              onClick={() => setProPlusArmed(!proPlusArmed)}
              disabled={loading || streaming}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                proPlusArmed
                  ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-400 text-white shadow-lg shadow-purple-500/30"
                  : isDark
                    ? "bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-neutral-100 border border-white/10"
                    : "bg-black/5 hover:bg-black/10 text-neutral-600 hover:text-neutral-900 border border-black/10"
              }`}
              title="Use today's Pro+ answer — gives a more thoughtful, in-depth response"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.3L12 16.5l-6.2 4.5 2.4-7.3L2 9.2h7.6L12 2z"/>
              </svg>
              {proPlusArmed ? "Pro+ armed — next answer will be premium" : "Use Pro+ answer (1 left today)"}
            </button>
          ) : (
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] ${isDark ? "text-neutral-600 bg-white/[0.02] border border-white/5" : "text-neutral-400 bg-black/[0.02] border border-black/5"}`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.3L12 16.5l-6.2 4.5 2.4-7.3L2 9.2h7.6L12 2z"/>
              </svg>
              Pro+ used today — resets at midnight
            </span>
          )}
        </div>
      )}

      {/* Attached file preview */}
      {attachedFile && (
        <div className={`relative mb-2 flex items-center gap-3 px-3 py-2.5 rounded-xl backdrop-blur-xl ${isDark ? "bg-white/5 border border-white/10" : "bg-black/5 border border-black/10"}`}>
          <div className="w-9 h-9 rounded-lg flex-shrink-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-[13px] font-medium truncate ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>{attachedFile.name}</div>
            <div className={`text-[11px] ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>
              {formatBytes(attachedFile.size)}{attachedFile.truncated ? " · truncated" : ""}
            </div>
          </div>
          <button onClick={removeAttachedFile} className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-neutral-400 hover:text-neutral-100" : "hover:bg-black/10 text-neutral-500 hover:text-neutral-900"}`} aria-label="Remove file">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {uploadError && (
        <div className={`relative mb-2 px-3 py-2 rounded-lg text-[12px] ${isDark ? "bg-red-500/10 border border-red-500/20 text-red-300" : "bg-red-500/10 border border-red-500/20 text-red-700"}`}>
          {uploadError}
        </div>
      )}

      <div className="relative rounded-2xl p-[1.5px] forge-gradient-border">
        <div className={`flex gap-1 items-end rounded-2xl ${isDark ? "bg-neutral-950/80" : "bg-white/80"} backdrop-blur-2xl`}>
          {/* Paperclip button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className={`m-2 w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
              isBusy
                ? isDark ? "text-neutral-700 cursor-not-allowed" : "text-neutral-300 cursor-not-allowed"
                : isDark ? "hover:bg-white/5 text-neutral-400 hover:text-neutral-100" : "hover:bg-black/5 text-neutral-500 hover:text-neutral-900"
            }`}
            aria-label="Attach PDF"
            title="Attach PDF (max 10 MB)"
          >
            {uploading ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            )}
          </button>

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
            placeholder={attachedFile ? "Ask anything about this PDF..." : "Ask anything..."}
            rows={1}
            className={`flex-1 resize-none px-2 py-4 bg-transparent outline-none text-[15px] max-h-32 ${isDark ? "text-neutral-100 placeholder-neutral-500" : "text-neutral-900 placeholder-neutral-400"}`}
            disabled={isBusy}
          />

          {(loading || streaming) ? (
            <button
              onClick={stopGenerating}
              className="m-2 w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 hover:opacity-90 text-white shadow-lg shadow-purple-500/20"
              aria-label="Stop generating"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <rect x="3" y="3" width="10" height="10" rx="1.5"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={() => sendMessage()}
              disabled={(!input.trim() && !attachedFile) || uploading}
              className={`m-2 w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${(input.trim() || attachedFile) && !uploading ? "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 hover:opacity-90 text-white shadow-lg shadow-purple-500/20" : isDark ? "bg-white/5 text-neutral-600 cursor-not-allowed" : "bg-black/5 text-neutral-400 cursor-not-allowed"}`}
              aria-label="Send"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 14V2M8 2L3 7M8 2L13 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? "bg-black text-neutral-100" : "bg-[#FAFAF7] text-neutral-900"}`}>
      <aside className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${isDark ? "border-r border-white/5 bg-[#0A0A0A]" : "border-r border-black/5 bg-[#F4F2EC]"}`}>
        <div className="w-64 h-full flex flex-col">
          <div className="px-4 py-4 flex items-center justify-between">
            <span className={`font-bold tracking-tight text-[15px] ${isDark ? "text-white" : "text-neutral-900"}`}>Lore AI<span className="text-orange-500">.</span></span>
            <button onClick={() => setSidebarOpen(false)} className={`p-1.5 rounded-md transition-colors ${isDark ? "hover:bg-white/5 text-neutral-500 hover:text-neutral-200" : "hover:bg-black/5 text-neutral-500 hover:text-neutral-800"}`} aria-label="Close sidebar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="px-3 pb-3 space-y-0.5">
            <button onClick={newChat} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${isDark ? "hover:bg-white/5 text-neutral-300 hover:text-neutral-100" : "hover:bg-black/5 text-neutral-700 hover:text-neutral-900"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New chat
            </button>
            <a href="/founders" className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${isDark ? "hover:bg-white/5 text-neutral-300 hover:text-neutral-100" : "hover:bg-black/5 text-neutral-700 hover:text-neutral-900"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Founders
            </a>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {chats.length === 0 ? (
              <div className={`px-3 py-2 text-xs ${isDark ? "text-neutral-600" : "text-neutral-400"}`}>No chats yet</div>
            ) : (
              <>
                <div className={`px-3 py-2 text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-neutral-600" : "text-neutral-400"}`}>Recent</div>
                <div className="space-y-0.5">
                  {chats.map((chat) => (
                    <button key={chat.id} onClick={() => loadChat(chat)} className={`group w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors flex items-center justify-between gap-2 ${activeChatId === chat.id ? isDark ? "bg-white/5 text-neutral-100" : "bg-black/5 text-neutral-900" : isDark ? "text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200" : "text-neutral-600 hover:bg-black/[0.03] hover:text-neutral-900"}`}>
                      <span className="truncate flex-1">{chat.title}</span>
                      <span onClick={(e) => deleteChat(e, chat.id)} className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-0.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={`relative px-3 py-3 border-t ${isDark ? "border-white/5" : "border-black/5"}`}>
            {userMenuOpen && (
              <div className={`absolute bottom-full left-3 right-3 mb-2 rounded-lg overflow-hidden shadow-2xl ${isDark ? "bg-neutral-900 border border-white/10" : "bg-white border border-black/10"}`}>
                <div className={`px-3 py-2.5 text-[11px] truncate ${isDark ? "text-neutral-500 border-b border-white/5" : "text-neutral-500 border-b border-black/5"}`}>{userEmail}</div>
                <a href="/profile" className={`w-full text-left px-3 py-2.5 text-[13px] flex items-center gap-2 ${isDark ? "hover:bg-white/5 text-neutral-300" : "hover:bg-black/5 text-neutral-700"}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Edit profile
                </a>
                <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`w-full text-left px-3 py-2.5 text-[13px] flex items-center gap-2 ${isDark ? "hover:bg-white/5 text-neutral-300" : "hover:bg-black/5 text-neutral-700"}`}>
                  {isDark ? "Light mode" : "Dark mode"}
                </button>
                <button onClick={signOut} className={`w-full text-left px-3 py-2.5 text-[13px] flex items-center gap-2 ${isDark ? "hover:bg-white/5 text-red-400" : "hover:bg-black/5 text-red-600"}`}>Sign out</button>
              </div>
            )}

            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}`}>
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-7 h-7 rounded-full flex-shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 flex items-center justify-center text-white text-[12px] font-semibold">{userInitial}</div>
              )}
              <span className={`flex-1 text-left text-[13px] font-medium truncate ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>{userName}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isDark ? "text-neutral-500" : "text-neutral-400"}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative">
        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} className={`absolute top-4 left-4 z-20 p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/5 text-neutral-400 hover:text-neutral-100" : "hover:bg-black/5 text-neutral-500 hover:text-neutral-900"}`} aria-label="Open sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        )}

        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-2xl flex flex-col items-center">
              <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight text-center">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-300 bg-clip-text text-transparent">
                  {user ? `Welcome back, ${userName.split(" ")[0]}` : "What are you building?"}
                </span>
              </h1>
              <p className={`max-w-md leading-relaxed text-[15px] text-center mb-10 ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>Your AI co-founder for India.</p>
              {chatInputBox}
              <p className={`text-[11px] text-center mt-3 ${isDark ? "text-neutral-600" : "text-neutral-500"}`}>
                Lore AI can make mistakes. Verify important info. By chatting with Lore AI, you agree to our <a href="/terms" className={`underline underline-offset-2 transition-colors ${isDark ? "hover:text-neutral-300" : "hover:text-neutral-800"}`}>Terms</a> and have read our <a href="/privacy" className={`underline underline-offset-2 transition-colors ${isDark ? "hover:text-neutral-300" : "hover:text-neutral-800"}`}>Privacy Policy</a>.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="space-y-6 pt-4">
                  {messages.map((msg, i) => {
                    const isLast = i === messages.length - 1;
                    const showCursor = streaming && isLast && msg.role === "assistant";
                    return (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        {msg.role === "user" ? (
                          <div className={`max-w-[85%] whitespace-pre-wrap leading-relaxed text-[15px] px-4 py-3 rounded-2xl rounded-br-md backdrop-blur-xl ${isDark ? "bg-white/5 border border-white/10 text-neutral-100" : "bg-black/5 border border-black/10 text-neutral-900"}`}>
                            {msg.content}
                          </div>
                        ) : (
                          <div className={`max-w-[85%] text-[15px] markdown-body ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                            {showCursor && (
                              <span className="inline-block w-[2px] h-4 ml-0.5 align-middle bg-gradient-to-b from-blue-400 to-purple-500 animate-pulse" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {loading && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                      <div className="flex items-center gap-3 px-1 py-3">
                        <div className="flex items-center gap-1.5">
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                          <div style={{ position: "relative", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {[80, 95, 110].map((size, i) => (
                              <div key={i} style={{ position: "absolute", width: size, height: size, borderRadius: "50%", border: "1px solid rgba(100,200,255,0.08)", animation: `ringExpand 2.4s ease-out ${i * 0.4}s infinite` }} />
                            ))}
                            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "radial-gradient(circle at 30% 28%, rgba(160,220,255,0.9) 0%, transparent 40%), radial-gradient(circle at 50% 50%, #1a6fa8 20%, #071e3d 100%)", boxShadow: "0 0 20px rgba(60,160,255,0.4), 0 0 40px rgba(60,160,255,0.15)", animation: "coreRotate 4s ease-in-out infinite", position: "relative" }}>
                              <div style={{ position: "absolute", top: 7, left: 9, width: 15, height: 8, borderRadius: "50%", background: "rgba(220,240,255,0.55)", filter: "blur(3px)", animation: "shimmerFloat 3s ease-in-out infinite" }} />
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 3, height: 18 }}>
                              {[0,0.1,0.2,0.1,0].map((delay, i) => (
                                <div key={i} style={{ width: 2, borderRadius: 10, background: "rgba(100,200,255,0.5)", animation: `barWave 1.4s ease-in-out ${delay}s infinite` }} />
                              ))}
                            </div>
                            <span style={{ fontSize: 12, color: "rgba(100,200,255,0.7)", letterSpacing: "0.05em", animation: "labelPulse 2.4s infinite" }}>thinking...</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 3, height: 18 }}>
                              {[0.2,0.1,0,0.1,0.2].map((delay, i) => (
                                <div key={i} style={{ width: 2, borderRadius: 10, background: "rgba(100,200,255,0.5)", animation: `barWave 1.4s ease-in-out ${delay}s infinite` }} />
                              ))}
                            </div>
                          </div>
                        </div>
                        </div>
                        <span key={loadingMessage} className="text-sm bg-gradient-to-r from-blue-400 via-purple-400 to-pink-300 bg-clip-text text-transparent animate-in fade-in duration-500">{loadingMessage}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="relative px-4 pb-6 pt-4">
              <div className="max-w-3xl mx-auto">
                {chatInputBox}
                <p className={`text-[11px] text-center mt-3 ${isDark ? "text-neutral-600" : "text-neutral-500"}`}>
                Lore AI can make mistakes. Verify important info. By chatting with Lore AI, you agree to our <a href="/terms" className={`underline underline-offset-2 transition-colors ${isDark ? "hover:text-neutral-300" : "hover:text-neutral-800"}`}>Terms</a> and have read our <a href="/privacy" className={`underline underline-offset-2 transition-colors ${isDark ? "hover:text-neutral-300" : "hover:text-neutral-800"}`}>Privacy Policy</a>.
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
          background: linear-gradient(90deg, rgba(96, 165, 250, 0.6), rgba(168, 85, 247, 0.5), rgba(244, 114, 182, 0.5), rgba(168, 85, 247, 0.5), rgba(96, 165, 250, 0.6));
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
        .markdown-body p { margin: 0.5rem 0; }
        .markdown-body strong { font-weight: 600; }
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
        .markdown-body table { border-collapse: collapse; margin: 0.75rem 0; width: 100%; }
        .dark .markdown-body th, .dark .markdown-body td { border: 1px solid rgba(255,255,255,0.1); }
        .light .markdown-body th, .light .markdown-body td { border: 1px solid rgba(0,0,0,0.1); }
        .markdown-body th, .markdown-body td { padding: 0.5rem 0.75rem; text-align: left; }
      `}</style>

      {/* Today's Focus — right panel */}
      {user && TASKS_FEATURE_ENABLED && showTaskPanel && (
        <div className={`hidden lg:flex flex-col w-72 shrink-0 h-screen sticky top-0 border-l overflow-y-auto ${isDark ? "border-neutral-800 bg-neutral-950/80" : "border-neutral-200 bg-white/80"}`} style={{ backdropFilter: "blur(20px)" }}>
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className={`text-[13px] font-medium ${isDark ? "text-white" : "text-neutral-900"}`}>Today's Focus</span>
              </div>
              <button onClick={() => setShowTaskPanel(false)} className={`text-[11px] px-2 py-0.5 rounded-md ${isDark ? "text-neutral-500 hover:text-neutral-300" : "text-neutral-400 hover:text-neutral-600"}`}>hide</button>
            </div>

            {/* Progress bar */}
            {tasks.length > 0 && (
              <div className="mb-4">
                <div className={`flex justify-between text-[11px] mb-1.5 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                  <span>{tasks.filter(t => t.done).length} of {tasks.length} done</span>
                  <span>{Math.round((tasks.filter(t => t.done).length / tasks.length) * 100)}%</span>
                </div>
                <div className={`h-1 rounded-full ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}>
                  <div
                    className="h-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${Math.round((tasks.filter(t => t.done).length / tasks.length) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Task list */}
            {tasks.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? "text-neutral-600" : "text-neutral-400"}`}>
                <div className="text-2xl mb-2">🎯</div>
                <p className="text-[12px]">Tasks will appear here as you chat</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id, !task.done)}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${isDark ? "bg-white/5 hover:bg-white/8" : "bg-neutral-50 hover:bg-neutral-100"}`}
                    style={{ backdropFilter: "blur(10px)" }}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${task.done ? "bg-green-500 border-green-500" : isDark ? "border-neutral-600" : "border-neutral-300"}`}>
                      {task.done && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] leading-tight ${task.done ? "line-through opacity-40" : isDark ? "text-neutral-200" : "text-neutral-800"}`}>
                        {task.task_text}
                      </p>
                      <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        task.priority === "high" ? "bg-red-500/15 text-red-400" :
                        task.priority === "med" ? "bg-orange-500/15 text-orange-400" :
                        "bg-green-500/15 text-green-400"
                      }`}>
                        {task.priority === "high" ? "High" : task.priority === "med" ? "Medium" : "Low"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <p className={`text-[10px] mt-4 text-center ${isDark ? "text-neutral-700" : "text-neutral-400"}`}>
              Auto-extracted from your chats
            </p>
          </div>
        </div>
      )}

      {/* Show panel button when hidden */}
      {user && TASKS_FEATURE_ENABLED && !showTaskPanel && (
        <button
          onClick={() => setShowTaskPanel(true)}
          className={`hidden lg:flex fixed right-4 top-4 z-50 items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border transition-all ${isDark ? "bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white" : "bg-white border-neutral-200 text-neutral-500 hover:text-neutral-900"}`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          Focus
        </button>
      )}
    </div>
  );
}