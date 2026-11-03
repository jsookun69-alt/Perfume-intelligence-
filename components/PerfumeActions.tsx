"use client";

import { useCompare, useMounted, useSaved } from "@/lib/store";

export function SaveButton({ slug, name, variant = "icon" }: { slug: string; name: string; variant?: "icon" | "full" }) {
  const { isSaved, toggle } = useSaved();
  const mounted = useMounted();
  const on = mounted && isSaved(slug);
  const heart = (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden className={on ? "scale-110 transition-transform" : "transition-transform"}>
      <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.1 3.6 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.6 0 5.7 3.6 4.5 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"
        fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
  if (variant === "full")
    return (
      <button type="button" onClick={() => toggle(slug)} aria-pressed={on}
        className={`btn border ${on ? "border-rose-clay bg-rose-clay text-ivory" : "border-ink/20 text-ink hover:border-rose-clay hover:text-rose-clay"}`}>
        {heart}{on ? "Saved" : "Save"}
      </button>
    );
  return (
    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(slug); }} aria-pressed={on}
      aria-label={on ? `Remove ${name} from saved` : `Save ${name}`}
      className={`grid h-10 w-10 place-items-center rounded-full border backdrop-blur transition-all duration-300 hover:scale-110 ${on ? "border-rose-clay bg-rose-clay text-ivory" : "border-ink/10 bg-ivory/85 text-ink/50 hover:text-rose-clay"}`}>
      {heart}
    </button>
  );
}

export function CompareButton({ slug, name, variant = "icon" }: { slug: string; name: string; variant?: "icon" | "full" }) {
  const { has, toggle, items } = useCompare();
  const mounted = useMounted();
  const on = mounted && has(slug);
  const icon = (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M7 4v16M17 4v16M3 8h8M13 16h8" strokeLinecap="round" />
    </svg>
  );
  const label = on ? `Remove ${name} from comparison` : `Add ${name} to comparison${items.length >= 3 ? " (replaces the oldest)" : ""}`;
  if (variant === "full")
    return (
      <button type="button" onClick={() => toggle(slug)} aria-pressed={on} aria-label={label}
        className={`btn border ${on ? "border-cave-600 bg-cave-700 text-ivory" : "border-ink/20 text-ink hover:border-cave-600"}`}>
        {icon}{on ? "In comparison" : "Compare"}
      </button>
    );
  return (
    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(slug); }} aria-pressed={on} aria-label={label}
      className={`grid h-10 w-10 place-items-center rounded-full border backdrop-blur transition-all duration-300 hover:scale-110 ${on ? "border-cave-600 bg-cave-700 text-ivory" : "border-ink/10 bg-ivory/85 text-ink/50 hover:text-cave-600"}`}>
      {icon}
    </button>
  );
}
