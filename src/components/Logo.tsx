export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#logo-gradient)" />
      <circle cx="16" cy="16" r="8.5" fill="none" stroke="white" strokeOpacity="0.9" strokeWidth="1.4" />
      <circle cx="12.2" cy="12.4" r="1.05" fill="white" />
      <circle cx="19.8" cy="12.4" r="1.05" fill="white" />
      <circle cx="16" cy="16" r="1.05" fill="white" />
      <circle cx="12.2" cy="19.6" r="1.05" fill="white" />
      <circle cx="19.8" cy="19.6" r="1.05" fill="white" />
    </svg>
  );
}

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark className="h-8 w-8 shrink-0" />
      <span className="flex flex-col leading-none">
        <span
          className={`text-sm font-semibold tracking-tight ${
            variant === "light" ? "text-white" : "text-neutral-900"
          }`}
        >
          North Hills
        </span>
        <span
          className={`text-[11px] font-medium ${
            variant === "light" ? "text-emerald-50/80" : "text-neutral-500"
          }`}
        >
          Pickleball
        </span>
      </span>
    </span>
  );
}
