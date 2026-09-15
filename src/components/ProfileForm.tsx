"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updateProfile } from "@/app/actions";

type Props = {
  initialName: string;
  initialDuprRating: number | null;
};

const inputClass =
  "rounded-md border border-neutral-300 px-3 py-2 text-base outline-none transition-colors focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

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
      <label className="flex flex-col gap-1 text-sm text-neutral-700">
        Display name <span className="text-neutral-400">(shown to other players)</span>
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
      <label className="flex flex-col gap-1 text-sm text-neutral-700">
        DUPR rating <span className="text-neutral-400">(optional, self-entered)</span>
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
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && !error && <p className="text-sm text-emerald-700">Saved.</p>}
      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-md bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
