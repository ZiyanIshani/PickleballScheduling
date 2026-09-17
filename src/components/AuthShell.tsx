import { Logo, LogoMark } from "@/components/Logo";

export function AuthShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 lg:flex lg:w-[44%] lg:shrink-0 lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <LogoMark className="relative h-10 w-10" />
        <div className="relative max-w-sm">
          <h2 className="text-3xl font-semibold tracking-tight text-white xl:text-4xl">
            See who&apos;s playing before you show up.
          </h2>
          <p className="mt-4 text-base text-emerald-50/90">
            North Hills regulars signal when they&apos;re heading to the courts — drag a
            time window, see who else is in, skip the guesswork.
          </p>
        </div>
        <p className="relative text-sm font-medium text-emerald-50/70">
          North Hills Park &middot; Pickleball
        </p>
      </div>

      <div className="bg-court-texture flex flex-1 flex-col items-center justify-center px-6 py-12 lg:bg-none lg:bg-white">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <div className="w-full max-w-sm rounded-2xl border border-neutral-200/70 bg-white p-7 shadow-[var(--shadow-card)] lg:border-neutral-200 lg:shadow-none">
          {children}
        </div>
        {footer && <div className="mt-6 w-full max-w-sm text-center text-sm text-neutral-500">{footer}</div>}
      </div>
    </div>
  );
}
