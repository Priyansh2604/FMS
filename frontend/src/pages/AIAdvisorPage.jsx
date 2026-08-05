import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "../components/ui/ChatMessage";
import { chatMessages } from "../data/mockData";

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState(chatMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef(null);

  const suggestedPrompts = [
    "Analyze investment portfolio",
    "Project tax liability",
    "Optimize cash reserves",
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = {
        id: Date.now() + 1,
        sender: "ai",
        text: `I've analyzed your request: "${text}". Based on your current portfolio allocations and latest monthly ledger, we project a stable return with minimal exposure risks. Would you like me to generate a detailed simulation chart for this scenario?`,
        followUpText: "Would you like me to add this projection to your Q3 Reports summary?",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 2500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 items-center bg-background/50 h-full relative">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-container-accent/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary-fixed/20 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/3" />
      
      {/* Glass Chat Container */}
      <div className="w-full max-w-4xl flex-1 max-h-full bg-white/80 backdrop-blur-2xl rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-outline-variant/20 flex flex-col overflow-hidden relative z-10">
        
        {/* Chat Header */}
        <div className="px-6 md:px-8 py-5 border-b border-surface-container flex justify-between items-center bg-white/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white shadow-md shrink-0">
              <span className="material-symbols-outlined font-bold text-[22px]">psychology</span>
            </div>
            <div>
              <h2 className="font-display text-headline-sm font-semibold text-primary tracking-tight">
                Aura Intelligence
              </h2>
              <p className="font-sans text-label-sm text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Online &amp; Ready
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-icon btn-ghost shrink-0">
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
            <button className="btn btn-icon btn-ghost shrink-0">
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>
        </div>

        {/* Chat Scroll Area */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6"
        >
          {/* System Date Welcome */}
          <div className="flex justify-center my-4">
            <span className="bg-surface-container/60 px-4 py-1.5 rounded-full font-sans text-[11px] text-on-surface-variant tracking-widest uppercase font-bold">
              Today, 9:41 AM
            </span>
          </div>

          {/* Render Messages */}
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

          {/* Typing Indicator */}
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
        <div className="p-4 md:p-6 bg-white/90 backdrop-blur-md border-t border-surface-container shrink-0">
          {/* Suggested prompts */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none scroll-smooth">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="btn btn-outline btn-sm rounded-full shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input field */}
          <div className="relative flex items-end gap-2 bg-surface-container-low rounded-2xl p-2 border border-outline-variant/40 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/10 transition-all shadow-sm">
            <button className="btn btn-icon btn-ghost !rounded-xl shrink-0">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </button>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 text-primary font-sans text-body-md placeholder:text-on-surface-variant/60 outline-none"
              placeholder="Ask Aura anything about your finances..."
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              className="btn btn-icon btn-primary !rounded-xl shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
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
