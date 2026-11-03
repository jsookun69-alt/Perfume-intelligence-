"use client";

import { useState } from "react";
import Link from "next/link";
import type { Perfume } from "@/lib/types";

const LAYERS = [
  { key: "top", label: "Top", time: "0–30 min", desc: "The first impression — bright and volatile.", width: "62%" },
  { key: "heart", label: "Heart", time: "30 min – 4 h", desc: "The character of the perfume.", width: "80%" },
  { key: "base", label: "Base", time: "4 h +", desc: "What lingers on skin and clothes.", width: "100%" },
] as const;

/**
 * Interactive note pyramid. Hover/tap a layer to focus it; the evaporation slider
 * shows which layer is dominant at a given time after spraying.
 */
export default function NotePyramid({ perfume, highlight = [] }: { perfume: Perfume; highlight?: string[] }) {
  const [hour, setHour] = useState(0.2);
  const [focus, setFocus] = useState<string | null>(null);
  const active = focus ?? (hour < 0.5 ? "top" : hour < 4 ? "heart" : "base");
  const hl = highlight.map((h) => h.toLowerCase());

  if (perfume.flatNotes) {
    return (
      <div>
        <p className="mb-4 text-sm text-ink-mute">The house publishes this perfume's notes as a single list, without top, heart and base.</p>
        <NoteChips notes={perfume.notes.heart} hl={hl} />
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3" role="list">
        {LAYERS.map((L) => {
          const notes = perfume.notes[L.key];
          const on = active === L.key;
          return (
            <div
              key={L.key}
              role="listitem"
              tabIndex={0}
              aria-label={`${L.label} notes, ${L.time}`}
              aria-current={on ? "true" : undefined}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setHour(L.key === "top" ? 0.2 : L.key === "heart" ? 2 : 6); } }}
              onMouseEnter={() => setFocus(L.key)}
              onMouseLeave={() => setFocus(null)}
              onFocus={() => setFocus(L.key)}
              onBlur={() => setFocus(null)}
              onClick={() => setHour(L.key === "top" ? 0.2 : L.key === "heart" ? 2 : 6)}
              className="group relative mx-auto block w-full cursor-pointer text-left"
              style={{ width: L.width }}
            >
              <div className={`rounded-2xl border px-5 py-4 transition-all duration-500 ease-luxe ${on ? "border-cave-600 bg-cave-700 text-ivory shadow-xl shadow-cave-900/20" : "border-ink/10 bg-white/50 text-ink"}`}>
                <div className="mb-2.5 flex items-baseline justify-between gap-3">
                  <span className={`eyebrow ${on ? "text-champagne-300" : "text-champagne-700"}`}>{L.label} notes</span>
                  <span className={`text-[11px] ${on ? "text-ivory/60" : "text-ink-mute"}`}>{L.time}</span>
                </div>
                {notes.length ? <NoteChips notes={notes} hl={hl} dark={on} /> : <span className="text-sm opacity-60">Not published</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <label htmlFor={`evap-${perfume.slug}`} className="mb-2 flex justify-between text-xs text-ink-mute">
          <span>Evaporation timeline</span>
          <span className="font-medium text-ink">{hour < 1 ? `${Math.round(hour * 60)} min` : `${hour.toFixed(1)} h`} after spraying</span>
        </label>
        <input
          id={`evap-${perfume.slug}`}
          type="range" min={0} max={8} step={0.1} value={hour}
          onChange={(e) => { setHour(+e.target.value); setFocus(null); }}
          className="w-full accent-[#b8925a]"
        />
        <p className="mt-2 text-xs text-ink-mute">{LAYERS.find((l) => l.key === active)?.desc} Timings are typical, not measured for this perfume.</p>
      </div>
    </div>
  );
}

function NoteChips({ notes, hl, dark = false }: { notes: string[]; hl: string[]; dark?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {notes.map((n) => {
        const hit = hl.some((h) => n.toLowerCase().includes(h));
        return (
          <Link
            key={n}
            href={`/perfumes?note=${encodeURIComponent(n.toLowerCase())}`}
            onClick={(e) => e.stopPropagation()}
            className={`rounded-full px-3 py-1 text-[13px] capitalize transition-colors ${hit ? "bg-champagne-500 text-cave-900" : dark ? "bg-ivory/10 text-ivory hover:bg-ivory/20" : "bg-ink/5 text-ink hover:bg-ink/10"}`}
          >
            {n}
          </Link>
        );
      })}
    </div>
  );
}
