"use client";

import { useState, useRef, useEffect } from "react";

const SUGGESTED_QUESTIONS = [
  { text: "Pvt Ltd vs LLP — which fits my startup?" },
  { text: "How do I get DPIIT recognition?" },
  { text: "How to raise a pre-seed round in India?" },
  { text: "Do I need GST registration as a freelancer?" },
];

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

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

  return (
    <div className="flex h-screen bg-black text-neutral-100 overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 ease-in-out overflow-hidden border-r border-white/5 bg-[#0A0A0A] flex-shrink-0`}
      >
        <div className="w-64 h-full flex flex-col">
          <div className="px-4 py-4 flex items-center justify-between">
            <span className="font-semibold tracking-tight text-[15px] bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Forge
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-md hover:bg-white/5 text-neutral-500 hover:text-neutral-200 transition-colors"
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
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/5 text-[13px] font-medium text-neutral-300 hover:text-neutral-100 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {chats.length === 0 ? (
              <div className="px-3 py-2 text-xs text-neutral-600">No chats yet</div>
            ) : (
              <>
                <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-neutral-600 font-semibold">
                  Recent
                </div>
                <div className="space-y-0.5">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => loadChat(chat)}
                      className={`group w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors flex items-center justify-between gap-2 ${
                        activeChatId === chat.id
                          ? "bg-white/5 text-neutral-100"
                          : "text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200"
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

          <div className="px-4 py-3 border-t border-white/5">
            <div className="text-[11px] text-neutral-500">
              Powered by Sarvam AI
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-20 p-2 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-neutral-100 transition-colors"
            aria-label="Open sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-220px)]">
                <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                    What are you building?
                  </span>
                </h1>
                <p className="text-neutral-500 max-w-md mb-12 leading-relaxed text-[15px]">
                  Your AI co-founder for the Indian startup journey. Ask anything — tax, compliance, fundraising, GTM.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q.text)}
                      className="text-left px-4 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.05] text-sm text-neutral-400 hover:text-neutral-100 transition-all duration-200"
                    >
                      {q.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 pt-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap leading-relaxed text-[15px] ${
                        msg.role === "user"
                          ? "bg-white/5 backdrop-blur-xl border border-white/10 text-neutral-100 px-4 py-3 rounded-2xl rounded-br-md"
                          : "text-neutral-200"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start animate-in fade-in duration-300">
                    <div className="px-1 py-3 flex items-center gap-1.5 h-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* INPUT — refined frosted glass with subtle ambient glow */}
        <div className="relative px-4 pb-6 pt-4">
          <div className="relative max-w-3xl mx-auto">
            {/* Subtle gradient glow halo behind the chat box */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 blur-2xl opacity-60 rounded-full pointer-events-none"></div>

            {/* The actual chat box */}
            <div className="relative bg-neutral-950/80 backdrop-blur-2xl rounded-2xl border border-white/10 hover:border-white/20 focus-within:border-white/20 transition-colors shadow-2xl shadow-black/50">
              <div className="flex gap-2 items-end">
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
                  className="flex-1 resize-none px-5 py-4 bg-transparent outline-none text-neutral-100 placeholder-neutral-500 text-[15px] max-h-32"
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="m-2 w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-white/5 disabled:to-white/5 disabled:text-neutral-600 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all flex-shrink-0 shadow-lg shadow-purple-500/20 disabled:shadow-none"
                  aria-label="Send"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 14V2M8 2L3 7M8 2L13 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-neutral-700 text-center mt-3">
              Forge can make mistakes. Verify important info.
            </p>
          </div>
        </div>
      </main>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}