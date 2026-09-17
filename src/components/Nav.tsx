import Link from "next/link";
import { signOut } from "@/app/actions";
import { Logo } from "@/components/Logo";

export function Nav({ userName }: { userName: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-2.5">
        <Link href="/" className="rounded-md transition-opacity hover:opacity-80">
          <Logo />
        </Link>
        <div className="flex items-center gap-1.5 text-sm">
          <Link
            href="/add"
            className="rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600 px-3.5 py-1.5 font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-105 active:brightness-95"
          >
            Edit availability
          </Link>
          <Link
            href="/profile"
            className="rounded-full px-3 py-1.5 font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
          >
            <span className="hidden sm:inline">{userName}</span>
            <span className="sm:hidden">Profile</span>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full px-3 py-1.5 font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
