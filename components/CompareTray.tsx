"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPerfume } from "@/lib/data";
import { MAX_COMPARE, useCompare, useMounted } from "@/lib/store";
import BottleSVG from "./BottleSVG";

/**
 * Floating tray showing perfumes queued for side-by-side comparison.
 * The Compare button is pinned on the right so it's always reachable on phones;
 * the perfume chips scroll on their own if there isn't room.
 */
export default function CompareTray() {
  const { items, toggle, clear } = useCompare();
  const mounted = useMounted();
  const path = usePathname();
  if (!mounted || !items.length || path === "/compare") return null;
  const list = items.map(getPerfume).filter(Boolean);
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-4 sm:px-4 sm:pb-0"
      role="region"
      aria-label="Comparison tray"
    >
      <div className="glass-panel flex w-full max-w-3xl items-center gap-2 rounded-[22px] border border-champagne-500/40 p-2 shadow-2xl sm:w-auto sm:rounded-full">
        <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
          {list.map((p) => p && (
            <span key={p.slug} className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/80 py-1 pl-1 pr-1.5 sm:pr-2">
              <BottleSVG bottle={p.bottle} seed={`${p.house}|${p.name}`} animate={false} className="h-8 w-auto" />
              <span className="hidden max-w-[8rem] truncate text-[13px] sm:inline">{p.name}</span>
              <button
                type="button"
                onClick={() => toggle(p.slug)}
                className="grid h-6 w-6 place-items-center rounded-full text-[11px] text-ink-mute hover:bg-ink/5 hover:text-ink"
                aria-label={`Remove ${p.name} from comparison`}
              >
                ✕
              </button>
            </span>
          ))}
          {Array.from({ length: MAX_COMPARE - list.length }).map((_, i) => (
            <span key={i} className="hidden h-10 w-20 shrink-0 rounded-full border border-dashed border-ink/20 sm:block" aria-hidden />
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={clear} className="px-2 text-xs text-ink-mute hover:text-ink">Clear</button>
          <Link
            href={`/compare?p=${items.join(",")}`}
            className="btn-gold !px-4 !py-3 sm:!px-5"
            aria-label={`Compare ${list.length} perfume${list.length > 1 ? "s" : ""}`}
          >
            Compare {list.length}
          </Link>
        </div>
      </div>
    </div>
  );
}
