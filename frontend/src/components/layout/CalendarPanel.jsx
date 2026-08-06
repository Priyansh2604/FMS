import React, { useState } from "react";
import { calendarEvents } from "../../data/mockData";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarPanel() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const changeMonth = (delta) => {
    setViewDate(new Date(year, month + delta, 1));
    setSelectedDay(null);
  };

  const dayEvents = selectedDay ? calendarEvents.filter((e) => e.day === selectedDay) : [];

  return (
    <div className="w-[320px] sm:w-[360px] bg-surface rounded-2xl border border-outline-variant/40 shadow-2xl overflow-hidden">
      {/* Month header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-outline-variant/30">
        <button
          onClick={() => changeMonth(-1)}
          className="btn btn-icon btn-ghost !h-8 !w-8"
          aria-label="Previous month"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <span className="font-sans text-label-md text-primary font-semibold">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={() => changeMonth(1)}
          className="btn btn-icon btn-ghost !h-8 !w-8"
          aria-label="Next month"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 px-4 pt-3">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="text-center font-sans text-[11px] text-outline font-semibold">
            {w}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1 px-4 py-3">
        {cells.map((day, i) => {
          if (day === null) return <span key={`blank-${i}`} />;
          const isToday = isCurrentMonth && day === today.getDate();
          const hasEvent = calendarEvents.some((e) => e.day === day);
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`relative h-9 rounded-lg font-sans text-label-sm transition-colors ${
                isSelected
                  ? "bg-primary text-on-primary font-semibold"
                  : isToday
                  ? "bg-secondary-container-accent text-on-secondary-container-accent font-semibold"
                  : "text-primary hover:bg-surface-container-high"
              }`}
            >
              {day}
              {hasEvent && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-secondary-container-accent" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day events */}
      <div className="border-t border-outline-variant/30 px-5 py-4 min-h-[72px]">
        <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">
          {selectedDay ? `${MONTHS[month]} ${selectedDay}` : "Select a day"}
        </p>
        {dayEvents.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {dayEvents.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-secondary-container-accent shrink-0" />
                  <span className="font-sans text-label-md text-primary truncate">{e.title}</span>
                </div>
                <span className="font-sans text-label-md text-primary font-semibold shrink-0">{e.amount}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-sans text-label-md text-outline">No scheduled events.</p>
        )}
      </div>
    </div>
  );
}
