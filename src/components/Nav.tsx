import Link from "next/link";
import { signOut } from "@/app/actions";

export function Nav({ userName }: { userName: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
      <Link href="/" className="text-base font-semibold text-neutral-900">
        North Hills
      </Link>
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/add"
          className="rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white"
        >
          Add availability
        </Link>
        <span className="hidden text-neutral-500 sm:inline">{userName}</span>
        <form action={signOut}>
          <button type="submit" className="text-neutral-500 underline underline-offset-2">
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
