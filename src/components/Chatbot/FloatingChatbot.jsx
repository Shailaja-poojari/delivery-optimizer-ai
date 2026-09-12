// src/components/Chatbot/FloatingChatbot.jsx
import React, { useState, useRef, useEffect } from "react";

const ChatIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
    <path d="M20 12a8 8 0 1 0-14.9 4L4 20l4.2-1.1A8 8 0 0 0 20 12Z" />
  </svg>
);

const CloseIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

const SendIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: "Hi! Ask me anything about delivery, sustainability, or features." }]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  /* Keep the newest message in view */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    const botMessage = {
      role: "bot",
      text: generateBotResponse(input)
    };

    setMessages([...messages, userMessage, botMessage]);
    setInput("");
  };

  const generateBotResponse = (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes("delay")) return "Delays are estimated using AI based on zone, distance, and current mode.";
    if (lower.includes("emergency")) return "Emergency Mode prioritizes Koramangala and re-routes nearby deliveries.";
    if (lower.includes("festival")) return "Festival Mode boosts delivery predictions due to congestion.";
    if (lower.includes("offline")) return "Offline mode shows cached orders and disables real-time updates.";
    if (lower.includes("gps") || lower.includes("track")) return "GPS tracking shows your current agent location on map.";
    return "I'm still learning! For now, I can answer about delays, tracking, modes, and offline.";
  };

  return (
    <div>
      {/* Floating launcher */}
      <button
        onClick={toggleChat}
        aria-label={isOpen ? "Close AI assistant chat" : "Open AI assistant chat"}
        aria-expanded={isOpen}
        aria-controls="ai-chat-panel"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 hover:shadow-xl active:scale-95"
      >
        {isOpen ? CloseIcon : ChatIcon}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          id="ai-chat-panel"
          role="dialog"
          aria-label="AI Chatbot Assistant"
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
          className="animate-fadeUp fixed bottom-24 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 sm:right-6"
        >
          {/* Panel header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
              </svg>
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-sm font-semibold">AI Chatbot Assistant</p>
              <p className="flex items-center gap-1.5 text-[11px] text-indigo-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
                Online · answers instantly
              </p>
            </div>
            <button
              onClick={toggleChat}
              aria-label="Close chat"
              className="rounded-lg p-1.5 text-indigo-100 transition hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            className="flex h-72 flex-col gap-2.5 overflow-y-auto bg-slate-50/70 p-4 text-sm"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                  msg.role === "bot"
                    ? "self-start rounded-tl-sm border border-slate-200 bg-white text-slate-700"
                    : "self-end rounded-br-sm bg-indigo-600 text-white"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Composer */}
          <div className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
            <label htmlFor="ai-chat-input" className="sr-only">
              Ask the AI assistant
            </label>
            <input
              id="ai-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Ask about delays, tracking, modes…"
              autoFocus={isOpen}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <button
              onClick={handleSend}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
              disabled={!input.trim()}
            >
              {SendIcon}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatbot;