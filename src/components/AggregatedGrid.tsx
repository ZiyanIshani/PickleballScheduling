"use client";

import { useState } from "react";
import { formatDateLabel, isToday } from "@/lib/dates";
import { formatSlotLabel, SLOT_INDICES } from "@/lib/time-grid";
import type { SignalType } from "@/lib/types";

export type SlotCell = {
  count: number;
  entries: { name: string; signalType: SignalType; duprRating: number | null }[];
};

type Props = {
  dates: string[];
  dayData: Record<string, SlotCell[]>;
};

function intensityClass(count: number) {
  if (count === 0) return "bg-neutral-50";
  if (count < 5) return "bg-emerald-100";
  if (count < 10) return "bg-emerald-200";
  if (count < 15) return "bg-emerald-400";
  if (count < 20) return "bg-emerald-600";
  return "bg-emerald-800";
}

const LEGEND = [
  { label: "none", className: "bg-neutral-50 ring-1 ring-inset ring-neutral-200" },
  { label: "1–4", className: "bg-emerald-100" },
  { label: "5–9", className: "bg-emerald-200" },
  { label: "10–14", className: "bg-emerald-400" },
  { label: "15–19", className: "bg-emerald-600" },
  { label: "20+", className: "bg-emerald-800" },
];

export function AggregatedGrid({ dates, dayData }: Props) {
  const [selected, setSelected] = useState<{ date: string; slot: number } | null>(null);

  const selectedCell =
    selected != null ? dayData[selected.date]?.[selected.slot] : undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-[var(--shadow-card)]">
        <div
          className="grid min-w-[640px]"
          style={{ gridTemplateColumns: `56px repeat(${dates.length}, minmax(72px, 1fr))` }}
        >
          <div className="sticky left-0 z-10 border-b border-neutral-200 bg-white" />
          {dates.map((date) => (
            <div
              key={date}
              className={`border-b border-l border-neutral-200 px-1 py-2 text-center text-xs font-medium ${
                isToday(date) ? "bg-emerald-50 text-emerald-700" : "bg-white text-neutral-700"
              }`}
            >
              {isToday(date) ? "Today" : formatDateLabel(date)}
            </div>
          ))}

          {SLOT_INDICES.map((slotIndex) => {
            const isHourMark = slotIndex % 2 === 0;
            return (
              <GridRow
                key={slotIndex}
                slotIndex={slotIndex}
                isHourMark={isHourMark}
                dates={dates}
                dayData={dayData}
                selected={selected}
                onSelect={setSelected}
              />
            );
          })}
        </div>
      </div>

      {selected && selectedCell && selectedCell.count > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm shadow-[var(--shadow-card)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-medium text-neutral-900">
              {isToday(selected.date) ? "Today" : formatDateLabel(selected.date)} ·{" "}
              {formatSlotLabel(selected.slot)}–{formatSlotLabel(selected.slot + 1)}
            </p>
            <button
              onClick={() => setSelected(null)}
              className="rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {selectedCell.entries.map((entry, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-neutral-800">
                  {entry.name}
                  {entry.duprRating != null && (
                    <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-500">
                      DUPR {entry.duprRating}
                    </span>
                  )}
                </span>
                <span
                  className={
                    entry.signalType === "going"
                      ? "shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                      : "shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
                  }
                >
                  {entry.signalType === "going" ? "Going for sure" : "Thinking about it"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-xl border border-neutral-200/70 bg-white/60 px-3 py-2.5">
        <p className="text-xs text-neutral-500">
          Darker cells mean more people have signaled availability for that time slot.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
          {LEGEND.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className={`inline-block h-3 w-3 rounded-sm ${item.className}`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function GridRow({
  slotIndex,
  isHourMark,
  dates,
  dayData,
  selected,
  onSelect,
}: {
  slotIndex: number;
  isHourMark: boolean;
  dates: string[];
  dayData: Record<string, SlotCell[]>;
  selected: { date: string; slot: number } | null;
  onSelect: (v: { date: string; slot: number } | null) => void;
}) {
  return (
    <>
      <div className="sticky left-0 z-10 flex items-start justify-end border-r border-neutral-200 bg-white pr-1 text-[10px] text-neutral-400">
        {isHourMark ? formatSlotLabel(slotIndex) : ""}
      </div>
      {dates.map((date) => {
        const cell = dayData[date]?.[slotIndex] ?? { count: 0, entries: [] };
        const isSelected = selected?.date === date && selected.slot === slotIndex;
        return (
          <button
            key={date}
            type="button"
            disabled={cell.count === 0}
            onClick={() => onSelect(isSelected ? null : { date, slot: slotIndex })}
            className={`h-6 border-l border-t border-neutral-100 transition-all ${intensityClass(
              cell.count,
            )} ${isSelected ? "ring-2 ring-inset ring-sky-500" : ""} ${
              cell.count > 0 ? "cursor-pointer hover:z-10 hover:brightness-95" : "cursor-default"
            }`}
            aria-label={
              cell.count > 0
                ? `${cell.count} people at ${formatSlotLabel(slotIndex)}`
                : undefined
            }
          />
        );
      })}
    </>
  );
}
