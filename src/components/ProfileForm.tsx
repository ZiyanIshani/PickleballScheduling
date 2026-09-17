"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updateProfile } from "@/app/actions";

type Props = {
  initialName: string;
  initialDuprRating: number | null;
};

const inputClass =
  "rounded-lg border border-neutral-300 px-3.5 py-2.5 text-base outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15";

export function ProfileForm({ initialName, initialDuprRating }: Props) {
  const [name, setName] = useState(initialName);
  const [duprRating, setDuprRating] = useState(
    initialDuprRating != null ? String(initialDuprRating) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("duprRating", duprRating);
    startTransition(async () => {
      try {
        await updateProfile(formData);
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
        Display name <span className="font-normal text-neutral-400">(shown to other players)</span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
        DUPR rating <span className="font-normal text-neutral-400">(optional, self-entered)</span>
        <input
          type="number"
          step="0.01"
          min="1"
          max="8"
          value={duprRating}
          onChange={(e) => {
            setDuprRating(e.target.value);
            setSaved(false);
          }}
          className={inputClass}
        />
      </label>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {saved && !error && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clipRule="evenodd"
            />
          </svg>
          Saved.
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-lg bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 active:brightness-95"
      >
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
