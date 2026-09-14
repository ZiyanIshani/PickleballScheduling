import Link from "next/link";
import { signOut } from "@/app/actions";

export function Nav({ userName }: { userName: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
      <Link
        href="/"
        className="flex items-center gap-2 text-base font-semibold text-neutral-900"
      >
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
        North Hills
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link
          href="/add"
          className="rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white transition-colors hover:bg-emerald-700"
        >
          Add availability
        </Link>
        <span className="hidden text-neutral-500 sm:inline">{userName}</span>
        <form action={signOut}>
          <button
            type="submit"
            className="text-neutral-500 transition-colors hover:text-neutral-800"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
