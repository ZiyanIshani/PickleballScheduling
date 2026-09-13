"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
      <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-12 text-center">
        <h1 className="mb-2 text-2xl font-semibold text-neutral-900">Check your email</h1>
        <p className="text-sm text-neutral-500">
          We sent a confirmation link to {email}. Follow it to finish creating your account.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="mb-1 text-2xl font-semibold text-neutral-900">Sign up</h1>
      <p className="mb-6 text-sm text-neutral-500">North Hills Pickleball availability</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Display name
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-base outline-none focus:border-emerald-600"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-base outline-none focus:border-emerald-600"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-base outline-none focus:border-emerald-600"
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
            onChange={(e) => setDuprRating(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-base outline-none focus:border-emerald-600"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-md bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Signing up…" : "Sign up"}
        </button>
      </form>
      <p className="mt-6 text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
