"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addAvailability, deleteAvailability } from "@/app/actions";
import { AddAvailabilityGrid } from "@/components/AddAvailabilityGrid";
import { formatDateLabel, isToday } from "@/lib/dates";
import { formatSlotLabel, timeToSlotIndex } from "@/lib/time-grid";
import type { SignalType } from "@/lib/types";

type Row = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  signal_type: SignalType;
};

type Props = {
  dates: string[];
  initialDate: string;
  initialRows: Row[];
};

export function EditAvailabilityClient({ dates, initialDate, initialRows }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [date, setDate] = useState(initialDate);
  const [range, setRange] = useState<{ start: number; end: number } | null>(null);
  const [signalType, setSignalType] = useState<SignalType>("thinking");
  const [error, setError] = useState<string | null>(null);
  const [unsavedWarning, setUnsavedWarning] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const rowsForDate = useMemo(
    () =>
      rows
        .filter((r) => r.date === date)
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [rows, date],
  );

  const existingRanges = useMemo(
    () =>
      rowsForDate.map((r) => ({
        start: timeToSlotIndex(r.start_time),
        end: timeToSlotIndex(r.end_time) - 1,
        signalType: r.signal_type,
      })),
    [rowsForDate],
  );

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

  function handleDone() {
    if (range) {
      setUnsavedWarning(true);
      return;
    }
    router.push("/");
  }

  function handleRemove(id: string) {
    setError(null);
    setDeletingId(id);
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      try {
        await deleteAvailability(formData);
        setRows((prev) => prev.filter((r) => r.id !== id));
        setRange(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't remove that.");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 bg-neutral-50 px-4 py-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDone}
          aria-label="Back"
          className="-ml-1.5 rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-200/60 hover:text-neutral-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.56l4.22 4.22a.75.75 0 1 1-1.06 1.06l-5.5-5.5a.75.75 0 0 1 0-1.06l5.5-5.5a.75.75 0 1 1 1.06 1.06L5.56 9.25H16.25A.75.75 0 0 1 17 10Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
          Edit availability
        </h1>
      </div>

      {unsavedWarning && range && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-sm text-amber-800">
          <p className="mb-2">
            You picked a time window but haven&apos;t saved it yet. Save it, or discard it to
            leave without adding it.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setUnsavedWarning(false);
                handleSubmit();
              }}
              className="font-medium underline hover:text-amber-900"
            >
              Save now
            </button>
            <button
              type="button"
              onClick={() => {
                setUnsavedWarning(false);
                setRange(null);
                router.push("/");
              }}
              className="font-medium underline hover:text-amber-900"
            >
              Discard and leave
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-[var(--shadow-card)]">
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
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                date === d
                  ? "border-emerald-600 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-sm"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              {isToday(d) ? "Today" : formatDateLabel(d)}
            </button>
          ))}
        </div>
      </div>

      {rowsForDate.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-[var(--shadow-card)]">
          <p className="mb-2 text-sm font-medium text-neutral-700">Your times this day</p>
          <ul className="flex flex-col gap-2">
            {rowsForDate.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 text-neutral-800">
                  {formatSlotLabel(timeToSlotIndex(row.start_time))}–
                  {formatSlotLabel(timeToSlotIndex(row.end_time))}
                  <span
                    className={
                      row.signal_type === "going"
                        ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                        : "rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
                    }
                  >
                    {row.signal_type === "going" ? "Going for sure" : "Thinking about it"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(row.id)}
                  disabled={isPending && deletingId === row.id}
                  className="shrink-0 text-xs font-medium text-red-600 underline hover:text-red-700 disabled:opacity-50"
                >
                  {isPending && deletingId === row.id ? "Removing…" : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-[var(--shadow-card)]">
        <p className="mb-2 text-sm font-medium text-neutral-700">Add or extend a time window</p>
        <AddAvailabilityGrid onChange={setRange} existingRanges={existingRanges} />
        {range && (
          <p className="mt-2 text-sm font-medium text-emerald-700">
            Selected: {formatSlotLabel(range.start)}–{formatSlotLabel(range.end + 1)}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-[var(--shadow-card)]">
        <p className="mb-2 text-sm font-medium text-neutral-700">Signal</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSignalType("thinking")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
              signalType === "thinking"
                ? "border-neutral-800 bg-neutral-800 text-white shadow-sm"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            Thinking about it
          </button>
          <button
            type="button"
            onClick={() => setSignalType("going")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
              signalType === "going"
                ? "border-emerald-600 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-sm"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            Going for sure
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="sticky bottom-4 flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 rounded-lg bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 py-2.5 font-medium text-white shadow-md transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 active:brightness-95"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={handleDone}
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 font-medium text-neutral-700 shadow-sm transition-colors hover:border-neutral-400 hover:bg-neutral-50"
        >
          Done
        </button>
      </div>
    </div>
  );
}
