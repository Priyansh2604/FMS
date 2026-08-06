import React from "react";

export default function NotificationPanel({ notifications, onRead, onReadAll }) {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="w-80 sm:w-96 bg-surface rounded-2xl border border-outline-variant/40 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-outline-variant/30 flex items-center justify-between">
        <div>
          <h3 className="font-sans text-label-md text-primary font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <p className="font-sans text-label-sm text-on-surface-variant mt-0.5">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onReadAll}
            className="btn btn-ghost btn-sm !h-8 !px-3 font-sans text-label-sm text-primary"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[360px] overflow-y-auto scrollbar-none">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => onRead(n.id)}
            className={`w-full text-left px-5 py-4 flex items-start gap-4 transition-colors border-b border-outline-variant/15 last:border-b-0 hover:bg-surface-container-low ${
              n.unread ? "bg-surface-container/50" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
              <span className="material-symbols-outlined text-[18px]">{n.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-sans text-label-md ${n.unread ? "text-primary font-semibold" : "text-on-surface-variant"} truncate`}>
                  {n.title}
                </span>
                {n.unread && <span className="w-2 h-2 rounded-full bg-secondary-container-accent shrink-0" />}
              </div>
              <p className="font-sans text-label-sm text-on-surface-variant mt-0.5 line-clamp-2">{n.description}</p>
              <span className="font-sans text-[11px] text-outline mt-1.5 block">{n.time}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-outline-variant/30 flex justify-center">
        <button className="btn btn-ghost btn-sm !h-8 !px-3 font-sans text-label-sm text-primary">
          View all notifications
        </button>
      </div>
    </div>
  );
}
