import React, { useState, useRef, useEffect } from "react";
import { getCurrentUser } from "../auth";
import { sendChatMessage, fetchSuggestions } from "../services/chatApi";
import { getQuote, getIndices } from "../services/marketApi";
import ChatMessage from "../components/ui/ChatMessage";
import Strands from "../components/ui/Strands";

const FALLBACK_PROMPTS = [
  "What's the market outlook today?",
  "Should I prepay my home loan?",
  "How to build an emergency fund?",
  "Health vs term insurance — which first?",
  "Best SIP for ₹5,000 monthly?",
  "How to cut monthly expenses?",
];

export default function AIAdvisorPage() {
  const user = getCurrentUser();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState(FALLBACK_PROMPTS);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const chatScrollRef = useRef(null);
  const chatHistoryRef = useRef([]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setSuggestionsLoading(true);
      const data = await fetchSuggestions(user?.id);
      if (!cancelled && data && data.length > 0) {
        setSuggestions(data);
      }
      setSuggestionsLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  const refreshSuggestions = async () => {
    const data = await fetchSuggestions(user?.id);
    if (data && data.length > 0) {
      setSuggestions(data);
    }
  };

  const getMarketContext = async () => {
    try {
      const [indices, tcs] = await Promise.all([
        getIndices(),
        getQuote("TCS.NS").catch(() => null),
      ]);
      const lines = indices.map(
        (i) => `${i.name}: ${i.price.toLocaleString("en-IN")} (${i.changePercent >= 0 ? "+" : ""}${i.changePercent.toFixed(2)}%)`
      );
      return `\n\n[Live Market Data — ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}]\n${lines.join("\n")}`;
    } catch {
      return "";
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isTyping) return;

    const userMsg = { id: Date.now(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);
    setError(null);

    const marketCtx = await getMarketContext();
    const userMessage = { role: "user", content: text + marketCtx };

    chatHistoryRef.current.push(userMessage);

    try {
      const reply = await sendChatMessage(chatHistoryRef.current, user?.id);
      chatHistoryRef.current.push({ role: "assistant", content: reply });

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: reply,
      };
      setMessages((prev) => [...prev, aiMsg]);
      refreshSuggestions();
    } catch (err) {
      setError(err.message);
      const errMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: `I'm having trouble connecting to the AI service. ${err.message.includes("unavailable") ? "Please make sure the AI service is running on port 8000." : "Please try again in a moment."}`,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    chatHistoryRef.current = [];
    setError(null);
  };

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 items-center bg-background/50 h-full relative overflow-hidden">
      {/* Light mode: Strands animated background */}
      <div className="absolute inset-0 z-0 dark:hidden">
        <Strands
          colors={["#4482e5", "#43e81e", "#e51035"]}
          count={8}
          speed={0.5}
          amplitude={1}
          waviness={1.7}
          thickness={0.7}
          glow={2.6}
          taper={3.1}
          spread={1}
          intensity={0.55}
          saturation={2}
          opacity={1}
          scale={1.7}
          glass={false}
          refraction={1}
          dispersion={1}
          glassSize={1}
          hueShift={0.29}
        />
      </div>

      {/* Dark mode: animated gradient aurora background */}
      <div className="absolute inset-0 z-0 hidden dark:block">
        <div className="absolute inset-0 bg-[#0d0f14]" />
        <div className="aurora-blob aurora-1" />
        <div className="aurora-blob aurora-2" />
        <div className="aurora-blob aurora-3" />
        <style>{`
          .aurora-blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(100px);
            opacity: 0.35;
            will-change: transform;
          }
          .aurora-1 {
            width: 600px; height: 600px;
            background: radial-gradient(circle, #6366f1 0%, transparent 70%);
            top: -10%; left: -5%;
            animation: aurora-drift-1 18s ease-in-out infinite alternate;
          }
          .aurora-2 {
            width: 500px; height: 500px;
            background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
            bottom: -15%; right: -8%;
            animation: aurora-drift-2 22s ease-in-out infinite alternate;
          }
          .aurora-3 {
            width: 450px; height: 450px;
            background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
            top: 30%; left: 40%;
            animation: aurora-drift-3 26s ease-in-out infinite alternate;
          }
          @keyframes aurora-drift-1 {
            0%   { transform: translate(0, 0) scale(1); }
            33%  { transform: translate(120px, 80px) scale(1.15); }
            66%  { transform: translate(-60px, 140px) scale(0.95); }
            100% { transform: translate(80px, -40px) scale(1.1); }
          }
          @keyframes aurora-drift-2 {
            0%   { transform: translate(0, 0) scale(1); }
            33%  { transform: translate(-100px, -60px) scale(1.1); }
            66%  { transform: translate(80px, -100px) scale(0.9); }
            100% { transform: translate(-40px, 60px) scale(1.05); }
          }
          @keyframes aurora-drift-3 {
            0%   { transform: translate(0, 0) scale(1); }
            33%  { transform: translate(60px, -90px) scale(1.2); }
            66%  { transform: translate(-90px, 50px) scale(0.85); }
            100% { transform: translate(40px, 80px) scale(1.1); }
          }
        `}</style>
      </div>

      {/* Glass Chat Container */}
      <div className="w-full max-w-5xl flex-1 max-h-full bg-white/20 dark:bg-[#111318]/90 backdrop-blur-xl rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.25)] border border-white/40 dark:border-white/[0.06] flex flex-col overflow-hidden relative z-10">
        {/* Chat Header */}
        <div className="px-6 md:px-8 py-5 border-b border-outline-variant/20 flex justify-between items-center bg-white/30 dark:bg-[#111318] backdrop-blur-lg shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md shrink-0">
              <span className="material-symbols-outlined font-bold text-[22px]">psychology</span>
            </div>
            <div>
              <h2 className="font-display text-headline-sm font-semibold text-primary tracking-tight">
                Aura Intelligence
              </h2>
              <p className="font-sans text-label-sm text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                {isTyping ? "Thinking..." : "Online & Ready"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {messages.length > 0 && (
              <button onClick={handleClearChat} className="btn btn-icon btn-ghost shrink-0" title="Clear chat">
                <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
              </button>
            )}
          </div>
        </div>

        {/* Chat Scroll Area */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6"
        >
          {messages.length === 0 && (
            <>
              <div className="flex justify-center my-4">
                <span className="bg-surface-container/60 px-4 py-1.5 rounded-full font-sans text-[11px] text-on-surface-variant tracking-widest uppercase font-bold">
                  Today, {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[32px] text-primary">psychology</span>
                </div>
                <h3 className="font-display text-headline-md text-primary mb-2">Welcome to Aura Intelligence</h3>
                <p className="font-sans text-body-md text-on-surface-variant max-w-md">
                  Your AI financial advisor. Ask me about investments, taxes, budgeting, or market insights — powered by live data.
                </p>
              </div>
            </>
          )}

          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              sender={msg.sender}
              text={msg.text}
              hasCards={msg.hasCards}
              cards={msg.cards}
              followUpText={msg.followUpText}
            />
          ))}

          {isTyping && (
            <div className="flex w-full gap-4 opacity-75 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-surface-container flex-shrink-0 flex items-center justify-center text-on-surface-variant mt-1">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
              </div>
              <div className="flex items-center gap-1.5 h-8 px-4 bg-surface-container-low rounded-full">
                <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white/40 dark:bg-[#111318] backdrop-blur-lg border-t border-outline-variant/20 shrink-0">
          {/* Suggested prompts */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none scroll-smooth items-center">
            {suggestionsLoading ? (
              <div className="flex items-center gap-1.5 text-on-surface-variant/50 text-xs">
                <div className="w-1.5 h-1.5 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-1.5 h-1.5 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-1.5 h-1.5 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            ) : (
              suggestions.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  disabled={isTyping}
                  className="btn btn-outline btn-sm rounded-full shrink-0 disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))
            )}
            {!suggestionsLoading && (
              <button
                onClick={refreshSuggestions}
                disabled={isTyping}
                className="btn btn-icon btn-ghost shrink-0 !w-8 !h-8"
                title="Refresh suggestions"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
              </button>
            )}
          </div>

          {/* Input field */}
          <div className="relative flex items-end gap-2 bg-surface-container-low rounded-2xl p-2 border border-outline-variant/40 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/10 transition-all shadow-sm">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 text-primary font-sans text-body-md placeholder:text-on-surface-variant/60 outline-none"
              placeholder="Ask Aura anything about your finances..."
              rows={1}
              disabled={isTyping}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              className="btn btn-icon btn-primary !rounded-xl shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isTyping ? "stop" : "arrow_upward"}
              </span>
            </button>
          </div>
          <div className="text-center mt-3">
            <p className="font-sans text-[11px] text-on-surface-variant/70 font-medium">
              Aura AI can make mistakes. Consider verifying important financial data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
