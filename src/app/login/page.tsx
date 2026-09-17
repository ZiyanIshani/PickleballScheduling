"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <AuthShell
      footer={
        <>
          No account yet?{" "}
          <Link href="/signup" className="font-medium text-emerald-700 hover:text-emerald-800">
            Sign up
          </Link>
        </>
      }
    >
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-neutral-900">Log in</h1>
      <p className="mb-6 text-sm text-neutral-500">See who&apos;s playing this week.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3.5 py-2.5 text-base font-normal outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3.5 py-2.5 text-base font-normal outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
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
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
}
