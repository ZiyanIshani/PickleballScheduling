"use client";

import { useRef, useState } from "react";
import { formatSlotLabel, SLOT_INDICES } from "@/lib/time-grid";
import type { SignalType } from "@/lib/types";

type ExistingRange = { start: number; end: number; signalType: SignalType };

type Props = {
  onChange: (range: { start: number; end: number } | null) => void;
  existingRanges?: ExistingRange[];
};

function slotIndexAtPoint(container: HTMLElement, x: number, y: number): number | null {
  const el = document.elementFromPoint(x, y);
  const slotEl = el?.closest<HTMLElement>("[data-slot-index]");
  if (!slotEl || !container.contains(slotEl)) return null;
  return Number(slotEl.dataset.slotIndex);
}

export function AddAvailabilityGrid({ onChange, existingRanges = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<number | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const range =
    anchor != null && cursor != null
      ? { start: Math.min(anchor, cursor), end: Math.max(anchor, cursor) }
      : null;

  function emit(next: { start: number; end: number } | null) {
    onChange(next);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const container = containerRef.current;
    if (!container) return;
    const index = slotIndexAtPoint(container, e.clientX, e.clientY);
    if (index == null) return;
    e.preventDefault();
    container.setPointerCapture(e.pointerId);
    setDragging(true);
    setAnchor(index);
    setCursor(index);
    emit({ start: index, end: index });
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const container = containerRef.current;
    if (!container) return;
    const index = slotIndexAtPoint(container, e.clientX, e.clientY);
    if (index == null) return;
    setCursor(index);
    if (anchor != null) {
      emit({ start: Math.min(anchor, index), end: Math.max(anchor, index) });
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    setDragging(false);
    containerRef.current?.releasePointerCapture(e.pointerId);
  }

  function clearSelection() {
    setAnchor(null);
    setCursor(null);
    emit(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>Drag across the times you&apos;re considering. Shaded rows are already saved.</span>
        {range && (
          <button
            type="button"
            onClick={clearSelection}
            className="underline hover:text-neutral-700"
          >
            Clear
          </button>
        )}
      </div>
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="select-none touch-none overflow-hidden rounded-lg border border-neutral-200"
        style={{ touchAction: "none" }}
      >
        {SLOT_INDICES.map((slotIndex) => {
          const isHourMark = slotIndex % 2 === 0;
          const isSelected = range && slotIndex >= range.start && slotIndex <= range.end;
          const existing = existingRanges.find(
            (r) => slotIndex >= r.start && slotIndex <= r.end,
          );
          const baseClass = existing
            ? existing.signalType === "going"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-neutral-200 text-neutral-500"
            : "bg-white text-neutral-400";
          return (
            <div
              key={slotIndex}
              data-slot-index={slotIndex}
              className={`flex h-8 items-center border-t border-neutral-100 pl-3 text-xs transition-colors ${
                isSelected ? "bg-emerald-500 text-white" : baseClass
              }`}
            >
              {isHourMark ? formatSlotLabel(slotIndex) : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
