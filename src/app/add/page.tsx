"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { addAvailability } from "@/app/actions";
import { AddAvailabilityGrid } from "@/components/AddAvailabilityGrid";
import { formatDateLabel, getRollingWindowDates, isToday } from "@/lib/dates";
import { formatSlotLabel } from "@/lib/time-grid";
import type { SignalType } from "@/lib/types";

export default function AddAvailabilityPage() {
  const dates = useMemo(() => getRollingWindowDates(), []);
  const [date, setDate] = useState(dates[0]);
  const [range, setRange] = useState<{ start: number; end: number } | null>(null);
  const [signalType, setSignalType] = useState<SignalType>("thinking");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    if (!range) {
      setError("Drag across the grid to pick a time window first.");
      return;
    }
    const formData = new FormData();
    formData.set("date", date);
    formData.set("startIndex", String(range.start));
    formData.set("endIndex", String(range.end));
    formData.set("signalType", signalType);
    startTransition(async () => {
      try {
        await addAvailability(formData);
      } catch (err) {
        const digest = (err as { digest?: string })?.digest;
        if (digest?.startsWith("NEXT_REDIRECT")) {
          throw err;
        }
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900">Add availability</h1>
        <Link href="/" className="text-sm text-neutral-500 underline">
          Cancel
        </Link>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-neutral-700">Date</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dates.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDate(d);
                setRange(null);
              }}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${
                date === d
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-neutral-300 text-neutral-700"
              }`}
            >
              {isToday(d) ? "Today" : formatDateLabel(d)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-neutral-700">Time window</p>
        <AddAvailabilityGrid onChange={setRange} />
        {range && (
          <p className="mt-2 text-sm text-neutral-600">
            Selected: {formatSlotLabel(range.start)}–{formatSlotLabel(range.end + 1)}
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-neutral-700">Signal</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSignalType("thinking")}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
              signalType === "thinking"
                ? "border-neutral-800 bg-neutral-800 text-white"
                : "border-neutral-300 text-neutral-700"
            }`}
          >
            Thinking about it
          </button>
          <button
            type="button"
            onClick={() => setSignalType("going")}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
              signalType === "going"
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-neutral-300 text-neutral-700"
            }`}
          >
            Going for sure
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="rounded-md bg-emerald-600 px-4 py-2.5 font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Submit"}
      </button>
    </div>
  );
}
