import React from "react";

export default function ChatMessage({ sender, text, hasCards, cards, followUpText }) {
  const isUser = sender === "user";

  if (isUser) {
    return (
      <div className="flex justify-end w-full">
        <div className="max-w-[80%] md:max-w-[70%]">
          <div className="bg-surface-container-low text-primary p-5 rounded-2xl rounded-tr-sm border border-outline-variant/30 shadow-sm font-sans text-body-md leading-relaxed">
            {text}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-4">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-on-primary mt-1 shadow-sm">
        <span className="material-symbols-outlined text-[18px]">psychology</span>
      </div>

      <div className="max-w-[85%] flex-1">
        {/* Main message text */}
        <div className="font-display text-[16px] md:text-[18px] text-primary leading-relaxed whitespace-pre-line mb-6">
          {text}
        </div>

        {/* Dynamic breakdown cards inside chat */}
        {hasCards && cards && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)] select-none"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-primary font-sans text-label-sm font-bold tracking-wider">
                    <span className="material-symbols-outlined text-[16px]">{card.icon}</span>
                    {card.title}
                  </div>
                  <span className="text-error font-sans text-[10px] bg-error/10 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                    <span className="material-symbols-outlined text-[12px] font-bold">trending_up</span>{" "}
                    {card.change}
                  </span>
                </div>
                <div className="font-display text-headline-sm mb-1">{card.amount}</div>
                <div className="w-full bg-surface-container h-1.5 rounded-full mb-2 overflow-hidden">
                  <div
                    className={`${
                      card.useDarkProgress ? "bg-primary" : "bg-error"
                    } h-full rounded-full`}
                    style={{ width: `${card.percentage > 100 ? 100 : card.percentage}%` }}
                  />
                </div>
                <p className="font-sans text-[12px] text-on-secondary-container">{card.limitLabel}</p>
              </div>
            ))}
          </div>
        )}

        {/* Follow up question and CTAs */}
        {followUpText && (
          <div>
            <div className="font-display text-[16px] text-primary leading-relaxed">
              {followUpText}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="btn btn-primary btn-sm">Yes, cancel inactive</button>
              <button className="btn btn-outline btn-sm">View details first</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
