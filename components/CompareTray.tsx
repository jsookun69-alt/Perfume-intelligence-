"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPerfume } from "@/lib/data";
import { MAX_COMPARE, useCompare, useMounted } from "@/lib/store";
import BottleSVG from "./BottleSVG";

/** Floating tray showing perfumes queued for side-by-side comparison. */
export default function CompareTray() {
  const { items, toggle, clear } = useCompare();
  const mounted = useMounted();
  const path = usePathname();
  if (!mounted || !items.length || path === "/compare") return null;
  const list = items.map(getPerfume).filter(Boolean);
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4" role="region" aria-label="Comparison tray">
      <div className="glass-panel flex max-w-full items-center gap-3 overflow-x-auto rounded-full border border-champagne-500/40 py-2 pl-3 pr-2 shadow-2xl">
        {list.map((p) => p && (
          <span key={p.slug} className="flex shrink-0 items-center gap-2 rounded-full bg-white/70 py-1 pl-1 pr-2">
            <BottleSVG bottle={p.bottle} seed={`${p.house}|${p.name}`} animate={false} className="h-8 w-auto" />
            <span className="max-w-[9rem] truncate text-[13px]">{p.name}</span>
            <button type="button" onClick={() => toggle(p.slug)} className="text-ink-mute hover:text-ink" aria-label={`Remove ${p.name}`}>✕</button>
          </span>
        ))}
        {Array.from({ length: MAX_COMPARE - list.length }).map((_, i) => (
          <span key={i} className="hidden h-10 w-24 shrink-0 rounded-full border border-dashed border-ink/20 sm:block" aria-hidden />
        ))}
        <Link href={`/compare?p=${items.join(",")}`} className="btn-gold shrink-0 !px-5 !py-2.5">Compare {list.length}</Link>
        <button type="button" onClick={clear} className="shrink-0 px-2 text-xs text-ink-mute hover:text-ink">Clear</button>
      </div>
    </div>
  );
}
