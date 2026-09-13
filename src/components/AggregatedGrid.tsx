"use client";

import { useState } from "react";
import { formatDateLabel, isToday } from "@/lib/dates";
import { formatSlotLabel, SLOT_INDICES } from "@/lib/time-grid";
import type { SignalType } from "@/lib/types";

export type SlotCell = {
  count: number;
  entries: { name: string; signalType: SignalType }[];
};

type Props = {
  dates: string[];
  dayData: Record<string, SlotCell[]>;
};

function intensityClass(count: number) {
  if (count === 0) return "bg-neutral-50";
  if (count === 1) return "bg-emerald-200";
  if (count === 2) return "bg-emerald-400";
  return "bg-emerald-600";
}

export function AggregatedGrid({ dates, dayData }: Props) {
  const [selected, setSelected] = useState<{ date: string; slot: number } | null>(null);

  const selectedCell =
    selected != null ? dayData[selected.date]?.[selected.slot] : undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <div
          className="grid min-w-[640px]"
          style={{ gridTemplateColumns: `56px repeat(${dates.length}, minmax(72px, 1fr))` }}
        >
          <div className="sticky left-0 z-10 border-b border-neutral-200 bg-white" />
          {dates.map((date) => (
            <div
              key={date}
              className="border-b border-l border-neutral-200 bg-white px-1 py-2 text-center text-xs font-medium text-neutral-700"
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
        <div className="rounded-lg border border-neutral-200 bg-white p-3 text-sm shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-medium text-neutral-900">
              {isToday(selected.date) ? "Today" : formatDateLabel(selected.date)} ·{" "}
              {formatSlotLabel(selected.slot)}–{formatSlotLabel(selected.slot + 1)}
            </p>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-neutral-400 hover:text-neutral-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            {selectedCell.entries.map((entry, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="text-neutral-800">{entry.name}</span>
                <span
                  className={
                    entry.signalType === "going"
                      ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                      : "rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
                  }
                >
                  {entry.signalType === "going" ? "Going for sure" : "Thinking about it"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-neutral-50 ring-1 ring-inset ring-neutral-200" />
          none
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-emerald-200" />1
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-emerald-400" />2
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-emerald-600" />
          3+
        </span>
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
            className={`h-6 border-l border-t border-neutral-100 ${intensityClass(cell.count)} ${
              isSelected ? "ring-2 ring-inset ring-emerald-800" : ""
            } ${cell.count > 0 ? "cursor-pointer" : "cursor-default"}`}
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
