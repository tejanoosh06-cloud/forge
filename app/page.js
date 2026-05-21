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
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true);
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
  const [priorities, setPriorities] = useState([]);
  const [prioritiesLoading, setPrioritiesLoading] = useState(false);

  const loadPriorities = async () => {
    try {
      const res = await fetch("/api/priorities");
      const data = await res.json();
      if (data.priorities) setPriorities(data.priorities);
    } catch {}
  };

  const togglePriority = async (id, done) => {
    setPriorities(prev => prev.map(p => p.id === id ? { ...p, done } : p).filter(p => !p.done));
    await fetch("/api/priorities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done }),
    });
  };

  const deletePriority = async (id) => {
    setPriorities(prev => prev.filter(p => p.id !== id));
    await fetch("/api/priorities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  // === PROJECTS STATE ===
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null); // null = "All chats"
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [projectMenuOpenId, setProjectMenuOpenId] = useState(null);
  const [dragOverProjectId, setDragOverProjectId] = useState(null);

  const moveChatToProject = async (chatId, projectId) => {
    try {
      await fetch("/api/chats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: chatId, project_id: projectId }),
      });
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, project_id: projectId } : c));
    } catch (e) {
      console.error("[chats] move failed:", e);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch (e) {
      console.error("[projects] load failed:", e);
    }
  };

  const createProject = async (name) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    setCreatingProject(false);
    setNewProjectName("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, emoji: "📁" }),
      });
      const data = await res.json();
      console.log("[projects] create response:", data);
      if (data.project) {
        setProjects((prev) => [data.project, ...prev]);
        setActiveProjectId(data.project.id);
      } else {
        console.error("[projects] no project in response:", data);
        await loadProjects();
      }
    } catch (e) {
      console.error("[projects] create failed:", e);
      await loadProjects();
    }
  };

  const renameProject = async (id, newName) => {
    const trimmed = (newName || "").trim();
    if (!trimmed) return;
    try {
      await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: trimmed }),
      });
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name: trimmed } : p)));
    } catch (e) {
      console.error("[projects] rename failed:", e);
    }
  };

  const deleteProject = async (id) => {
    if (!confirm("Delete this project? Chats inside will become standalone (not deleted).")) return;
    try {
      await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (activeProjectId === id) setActiveProjectId(null);
      setProjectMenuOpenId(null);
    } catch (e) {
      console.error("[projects] delete failed:", e);
    }
  };

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
        // Check onboarding
        const profileRes = await fetch("/api/profile");
        const profileData = await profileRes.json();
        const profile = profileData.profile;
        if (!profile || !profile.full_name || !profile.what_building) {
          window.location.href = "/onboarding";
          return;
        }
        const res = await fetch("/api/chats");
        const data = await res.json();
        setChats(data.chats || []);
        checkProPlusAvailability();
        loadTasks();
        loadProjects();
        loadPriorities();
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
        body: JSON.stringify({ title, ...(activeProjectId ? { project_id: activeProjectId } : {}) }),
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
      {/* === SINGLE EXPANDING SIDEBAR === */}
      {sidebarOpen && <div className="md:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setSidebarOpen(false)} />}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-40 flex-shrink-0
        ${sidebarOpen ? "w-64" : "w-0"}
        transition-all duration-300 ease-in-out overflow-hidden
        ${isDark ? "border-r border-white/5 bg-[#0A0A0A]" : "border-r border-black/5 bg-[#F4F2EC]"}
      `}>
        <div className="w-64 h-full flex flex-col">
          <div className="px-4 py-4 flex items-center justify-between">
            <button onClick={() => { setActiveChatId(null); setMessages([]); }} className={`font-bold text-[15px] tracking-tight transition-opacity hover:opacity-70 ${isDark ? "text-white" : "text-neutral-900"}`}>
              Lore AI<span className="text-orange-500">.</span>
            </button>
            <button onClick={() => setSidebarOpen(false)} className={`p-1.5 rounded-lg transition-all hover:scale-110 ${isDark ? "text-neutral-500 hover:text-white hover:bg-white/5" : "text-neutral-400 hover:text-neutral-900 hover:bg-black/5"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="px-3 pb-3 space-y-0.5">
            <button onClick={newChat} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all hover:scale-[1.01] ${isDark ? "text-neutral-300 hover:bg-white/5 hover:text-white" : "text-neutral-700 hover:bg-black/5 hover:text-neutral-900"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New chat
            </button>
            <a href="/founders" className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all hover:scale-[1.01] ${isDark ? "text-neutral-300 hover:bg-white/5 hover:text-white" : "text-neutral-700 hover:bg-black/5 hover:text-neutral-900"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Founders
            </a>
            <a href="/community" style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:10,fontSize:13,color:"rgba(255,255,255,0.5)",background:"none",border:"none",cursor:"pointer",textDecoration:"none",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.color="rgba(255,255,255,0.85)";e.currentTarget.style.background="rgba(255,255,255,0.04)"}}
              onMouseLeave={e=>{e.currentTarget.style.color="rgba(255,255,255,0.5)";e.currentTarget.style.background="none"}}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Community
            </a>
          </div>

          <div className="px-3 pb-3 space-y-0.5">
            {/* === Projects Section === */}
            <div className="mt-4">
              <div className={`px-3 pb-1 text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>Projects</div>
              <div className="space-y-0.5">
                {projects.map((p) => (
                  <div key={p.id} className="relative group">
                    <button
                      onClick={() => { setActiveProjectId(p.id === activeProjectId ? null : p.id); setSidebarOpen(true); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[13px] flex items-center gap-2 transition-colors ${
                        activeProjectId === p.id
                          ? isDark ? "bg-white/10 text-white" : "bg-black/10 text-neutral-900"
                          : isDark ? "text-neutral-200 hover:bg-white/5 hover:text-white" : "text-neutral-700 hover:bg-black/5 hover:text-neutral-900"
                      }`}
                    >
                      <svg className="flex-shrink-0 w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                      <span className="truncate flex-1">{p.name}</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setProjectMenuOpenId(projectMenuOpenId === p.id ? null : p.id); }}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded text-[14px] leading-none ${isDark ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-black"}`}
                    >⋯</button>
                    {projectMenuOpenId === p.id && (
                      <div className={`absolute right-2 top-8 z-50 w-32 rounded-lg shadow-lg overflow-hidden text-[12px] ${isDark ? "bg-[#1a1a1a] border border-white/10" : "bg-white border border-black/10"}`}>
                        <button onClick={() => { const n = prompt("Rename project:", p.name); if (n) renameProject(p.id, n); setProjectMenuOpenId(null); }} className={`w-full text-left px-3 py-2 ${isDark ? "hover:bg-white/5 text-neutral-200" : "hover:bg-black/5 text-neutral-700"}`}>Rename</button>
                        <button onClick={() => deleteProject(p.id)} className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10">Delete</button>
                      </div>
                    )}
                  </div>
                ))}
                {creatingProject ? (
                  <div className="px-1 py-1">
                    <input
                      autoFocus
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { createProject(newProjectName); setCreatingProject(false); }
                        if (e.key === "Escape") { setCreatingProject(false); setNewProjectName(""); }
                      }}
                      onBlur={() => { if (!newProjectName.trim()) setCreatingProject(false); }}
                      placeholder="Project name..."
                      className={`w-full px-3 py-2 rounded-lg text-[13px] outline-none border ${isDark ? "bg-white/5 border-white/10 text-white placeholder-neutral-600" : "bg-black/5 border-black/10 text-black placeholder-neutral-400"}`}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => { setCreatingProject(true); setNewProjectName(""); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[13px] flex items-center gap-2 transition-colors ${isDark ? "text-neutral-400 hover:bg-white/5 hover:text-white" : "text-neutral-500 hover:bg-black/5 hover:text-neutral-900"}`}
                  >
                    <span className="text-base leading-none">+</span> New project
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {/* filter chats by active project */}
              {chats.filter(c => activeProjectId ? c.project_id === activeProjectId : !c.project_id).length === 0 ? (
              <div className={`px-3 py-2 text-xs ${isDark ? "text-neutral-600" : "text-neutral-400"}`}>No chats yet</div>
            ) : (
              <>
                <div className={`px-3 py-2 text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>Recent</div>
                <div className="space-y-0.5">
                  {chats.filter(c => activeProjectId ? c.project_id === activeProjectId : !c.project_id).map((chat) => (
                    <button key={chat.id} draggable onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", chat.id); }} onClick={() => loadChat(chat)} className={`group w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing ${activeChatId === chat.id ? isDark ? "bg-white/10 text-white" : "bg-black/10 text-neutral-900" : isDark ? "text-neutral-200 hover:bg-white/5 hover:text-white" : "text-neutral-700 hover:bg-black/5 hover:text-neutral-900"}`}>
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

          {/* User row at bottom of sidebar */}
          <div className={`px-3 py-3 mt-auto border-t ${isDark ? "border-white/5" : "border-black/5"}`}>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all hover:scale-[1.01] ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}`}>
              {userAvatar
                ? <img src={userAvatar} alt={userName} className="w-7 h-7 rounded-full flex-shrink-0 object-cover" />
                : <div className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 flex items-center justify-center text-white text-[12px] font-semibold">{userInitial}</div>
              }
              <span className={`flex-1 text-left text-[13px] font-medium truncate ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>{userName}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* === MOBILE BOTTOM NAV === */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 border-t ${isDark ? "bg-[#0A0A0A] border-white/5" : "bg-[#F4F2EC] border-black/5"}`}>
        <button onClick={() => { setActiveChatId(null); setMessages([]); setSidebarOpen(false); }} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className="text-[10px]">Home</span>
        </button>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg ${sidebarOpen ? "text-white" : isDark ? "text-neutral-400" : "text-neutral-500"}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <span className="text-[10px]">Chats</span>
        </button>
        <button onClick={newChat} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span className="text-[10px]">New</span>
        </button>
        <a href="/founders" className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          <span className="text-[10px]">Founders</span>
        </a>
        <button onClick={() => setUserMenuOpen(!userMenuOpen)} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
          {userAvatar
            ? <img src={userAvatar} alt={userName} className="w-6 h-6 rounded-full" />
            : <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 flex items-center justify-center text-white text-[11px] font-semibold">{userInitial}</div>
          }
          <span className="text-[10px]">Profile</span>
        </button>
      </div>

      {/* User menu — works on both mobile and desktop */}
      {userMenuOpen && (
        <div className={`fixed bottom-20 right-2 md:bottom-8 md:left-4 md:right-auto z-50 w-48 rounded-xl overflow-hidden shadow-2xl ${isDark ? "bg-[#1a1a1a] border border-white/10" : "bg-white border border-black/10"}`}>
          <div className={`px-3 py-2.5 text-[11px] truncate ${isDark ? "text-neutral-500 border-b border-white/5" : "text-neutral-500 border-b border-black/5"}`}>{userEmail}</div>
          <a href="/profile" className={`block px-3 py-2.5 text-[13px] ${isDark ? "hover:bg-white/5 text-neutral-300" : "hover:bg-black/5 text-neutral-700"}`}>Edit profile</a>
          <button onClick={() => { setTheme(isDark ? "light" : "dark"); setUserMenuOpen(false); }} className={`w-full text-left px-3 py-2.5 text-[13px] ${isDark ? "hover:bg-white/5 text-neutral-300" : "hover:bg-black/5 text-neutral-700"}`}>{isDark ? "Light mode" : "Dark mode"}</button>
          <button onClick={signOut} className={`w-full text-left px-3 py-2.5 text-[13px] ${isDark ? "hover:bg-white/5 text-red-400" : "hover:bg-black/5 text-red-600"}`}>Sign out</button>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 relative pb-16 md:pb-0">
        {/* Hamburger toggle — always visible */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`absolute top-4 left-4 z-20 p-2 rounded-lg transition-all hover:scale-110 ${isDark ? "text-neutral-400 hover:text-white hover:bg-white/5" : "text-neutral-500 hover:text-neutral-900 hover:bg-black/5"}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        

        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-2xl flex flex-col items-center">
              <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight text-center">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-300 bg-clip-text text-transparent">
                  {user ? <span className="text-white">Welcome back, <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">{userName.split(" ")[0]}</span></span> : <span className="text-white">What are you building?</span>}
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
                            {[72, 88, 106].map((size, i) => (
                              <div key={i} style={{ position: "absolute", width: size, height: size, borderRadius: "50%", border: `1px solid rgba(255,255,255,${0.06 - i * 0.015})`, animation: `ringExpand 2.8s ease-out ${i * 0.5}s infinite` }} />
                            ))}
                            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "radial-gradient(circle at 32% 28%, #ffffff 0%, #d4d4d4 40%, #888888 100%)", boxShadow: "0 0 0 8px rgba(255,255,255,0.04), 0 0 20px rgba(255,255,255,0.35), 0 0 45px rgba(255,255,255,0.15), 0 0 80px rgba(255,255,255,0.06)", animation: "coreRotate 5s ease-in-out infinite", position: "relative" }}>
                              <div style={{ position: "absolute", top: 8, left: 10, width: 14, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.7)", filter: "blur(3px)", animation: "shimmerFloat 3.5s ease-in-out infinite" }} />
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span key={loadingMessage} style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em", fontWeight: 400, animation: "labelPulse 2.8s infinite" }}>{loadingMessage}</span>
                          </div>
                        </div>
                        </div>

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

      {/* Priority Box — right panel */}
      {user && (
        <div className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 overflow-y-auto" style={{background: "rgba(6,6,10,0.85)", backdropFilter: "blur(24px)", borderLeft: "0.5px solid rgba(255,255,255,0.06)"}}>
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 mt-2">
              <div className="flex items-center gap-2">
                <div style={{width:6,height:6,borderRadius:"50%",background:"rgba(255,165,90,0.9)",boxShadow:"0 0 8px rgba(255,165,90,0.6)",animation:"priorityPulse 2s ease-in-out infinite"}} />
                <span style={{fontSize:11,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.4)"}}>Priorities</span>
              </div>
              <button onClick={loadPriorities} style={{fontSize:10,color:"rgba(255,255,255,0.25)",background:"none",border:"none",cursor:"pointer",padding:"2px 6px",borderRadius:6,transition:"color 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.25)"}
              >↻</button>
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

            {/* Priority items */}
            {priorities.length === 0 ? (
              <div style={{textAlign:"center",padding:"32px 8px"}}>
                <div style={{fontSize:28,marginBottom:10}}>🎯</div>
                <p style={{fontSize:11,color:"rgba(255,255,255,0.25)",lineHeight:1.6}}>High priority actions will appear here as you chat with Lore</p>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {priorities.map(p => (
                  <div key={p.id} style={{
                    background: p.urgency === "high" ? "rgba(255,165,90,0.06)" : "rgba(255,255,255,0.03)",
                    border: p.urgency === "high" ? "0.5px solid rgba(255,165,90,0.2)" : "0.5px solid rgba(255,255,255,0.08)",
                    borderRadius:12, padding:"12px 14px",
                    animation:"cardFloat 4s ease-in-out infinite",
                    animationDelay: `${Math.random()*2}s`
                  }}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                      <button onClick={() => togglePriority(p.id, true)} style={{
                        width:18,height:18,borderRadius:"50%",flexShrink:0,marginTop:1,
                        border: p.urgency === "high" ? "1.5px solid rgba(255,165,90,0.5)" : "1.5px solid rgba(255,255,255,0.2)",
                        background:"none",cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center"
                      }}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,165,90,0.2)";e.currentTarget.style.borderColor="rgba(255,165,90,0.8)"}}
                        onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.borderColor=p.urgency==="high"?"rgba(255,165,90,0.5)":"rgba(255,255,255,0.2)"}}
                      />
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:12,color:"rgba(255,255,255,0.75)",lineHeight:1.5,margin:0}}>{p.title}</p>
                        {p.urgency === "high" && <span style={{fontSize:9,color:"rgba(255,165,90,0.7)",letterSpacing:"0.08em",textTransform:"uppercase",marginTop:4,display:"block"}}>High priority</span>}
                      </div>
                      <button onClick={() => deletePriority(p.id)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.15)",fontSize:14,padding:"0 2px",lineHeight:1,flexShrink:0,transition:"color 0.2s"}}
                        onMouseEnter={e=>e.currentTarget.style.color="rgba(239,68,68,0.6)"}
                        onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.15)"}
                      >×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add manual priority */}
            <button onClick={async () => {
              const t = prompt("Add a priority:");
              if (t?.trim()) {
                const res = await fetch("/api/priorities", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({title:t.trim(),urgency:"high"}) });
                const d = await res.json();
                if (d.priority) setPriorities(prev => [d.priority, ...prev]);
              }
            }} style={{width:"100%",marginTop:14,padding:"8px",borderRadius:10,fontSize:12,color:"rgba(255,255,255,0.25)",background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.06)",cursor:"pointer",transition:"all 0.2s",fontFamily:"inherit"}}
              onMouseEnter={e=>{e.currentTarget.style.color="rgba(255,255,255,0.5)";e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"}}
              onMouseLeave={e=>{e.currentTarget.style.color="rgba(255,255,255,0.25)";e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"}}
            >+ Add priority</button>

            <style>{`
              @keyframes priorityPulse { 0%,100%{opacity:0.6;box-shadow:0 0 6px rgba(255,165,90,0.4)} 50%{opacity:1;box-shadow:0 0 12px rgba(255,165,90,0.8)} }
              @keyframes cardFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
            `}</style>


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