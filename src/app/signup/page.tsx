"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/AuthShell";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [duprRating, setDuprRating] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          contact: email,
          dupr_rating: duprRating,
        },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setConfirmEmailSent(true);
    }
  }

  if (confirmEmailSent) {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 6.75c0-.828.672-1.5 1.5-1.5h16.5c.828 0 1.5.672 1.5 1.5v10.5a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5V6.75Z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="m3 7 9 6 9-6" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-neutral-900">
            Check your email
          </h1>
          <p className="text-sm text-neutral-500">
            We sent a confirmation link to{" "}
            <span className="font-medium text-neutral-700">{email}</span>. Follow it to finish
            creating your account.
          </p>
        </div>
      </AuthShell>
    );
  }

  const inputClass =
    "rounded-lg border border-neutral-300 px-3.5 py-2.5 text-base font-normal outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15";

  return (
    <AuthShell
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-emerald-700 hover:text-emerald-800">
            Log in
          </Link>
        </>
      }
    >
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-neutral-900">Sign up</h1>
      <p className="mb-6 text-sm text-neutral-500">See who&apos;s playing this week.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
          Display name
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            onChange={(e) => setDuprRating(e.target.value)}
            className={inputClass}
          />
        </label>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 active:brightness-95"
        >
          {loading ? "Signing up…" : "Sign up"}
        </button>
      </form>
    </AuthShell>
  );
}
