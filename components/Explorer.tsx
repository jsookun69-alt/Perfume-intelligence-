"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { familiesInUse, GENDER_LABEL, houses, noteIndex, norm, perfumes, priceRange } from "@/lib/data";
import { LONGEVITY_LEVEL } from "@/lib/derive";
import type { Occasion, Perfume, Season } from "@/lib/types";
import PerfumeCard from "./PerfumeCard";

const SEASONS: Season[] = ["Spring", "Summer", "Autumn", "Winter"];
const OCCASIONS: Occasion[] = ["Daytime", "Office", "Evening", "Date night", "Special occasion"];
const SORTS = {
  featured: "Featured",
  score: "ScentLens rating",
  reviews: "Most reviewed",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  longevity: "Longevity",
  name: "A–Z",
} as const;
type SortKey = keyof typeof SORTS;
const PAGE = 24;

interface F {
  q: string; notes: string[]; avoid: string[]; families: string[]; gender: string; house: string;
  max: number; longevity: number; season: string; occasion: string; rated: boolean; gems: boolean; sort: SortKey;
}

function fromParams(sp: URLSearchParams): F {
  const list = (k: string) => (sp.get(k) ? sp.get(k)!.split(",").map(norm).filter(Boolean) : []);
  return {
    q: sp.get("q") ?? "",
    notes: list("note"),
    avoid: list("avoid"),
    families: sp.get("family") ? sp.get("family")!.split(",") : [],
    gender: sp.get("gender") ?? "",
    house: sp.get("house") ?? "",
    max: Number(sp.get("max")) || priceRange.max,
    longevity: Number(sp.get("longevity")) || 0,
    season: sp.get("season") ?? "",
    occasion: sp.get("occasion") ?? "",
    rated: sp.get("rated") === "1",
    gems: sp.get("gems") === "1",
    sort: (sp.get("sort") as SortKey) in SORTS ? (sp.get("sort") as SortKey) : "featured",
  };
}

function toParams(f: F) {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.notes.length) p.set("note", f.notes.join(","));
  if (f.avoid.length) p.set("avoid", f.avoid.join(","));
  if (f.families.length) p.set("family", f.families.join(","));
  if (f.gender) p.set("gender", f.gender);
  if (f.house) p.set("house", f.house);
  if (f.max < priceRange.max) p.set("max", String(f.max));
  if (f.longevity) p.set("longevity", String(f.longevity));
  if (f.season) p.set("season", f.season);
  if (f.occasion) p.set("occasion", f.occasion);
  if (f.rated) p.set("rated", "1");
  if (f.gems) p.set("gems", "1");
  if (f.sort !== "featured") p.set("sort", f.sort);
  return p;
}

const hasNote = (p: Perfume, t: string) => p.allNotes.some((n) => n.includes(t));

export default function Explorer() {
  const sp = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [f, setF] = useState<F>(() => fromParams(new URLSearchParams(sp.toString())));
  const [limit, setLimit] = useState(PAGE);
  const [noteQ, setNoteQ] = useState("");
  const [panel, setPanel] = useState(false);
  const first = useRef(true);

  // keep the URL in sync so filtered views are shareable
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const qs = toParams(f).toString();
    router.replace(`${path}${qs ? `?${qs}` : ""}`, { scroll: false });
    setLimit(PAGE);
  }, [f, path, router]);

  // follow external navigation (e.g. clicking a note link while already on this page)
  useEffect(() => {
    const next = fromParams(new URLSearchParams(sp.toString()));
    setF((cur) => (toParams(cur).toString() === toParams(next).toString() ? cur : next));
  }, [sp]);

  const set = <K extends keyof F>(k: K, v: F[K]) => setF((cur) => ({ ...cur, [k]: v }));
  const toggleIn = (k: "notes" | "avoid" | "families", v: string) =>
    setF((cur) => ({ ...cur, [k]: cur[k].includes(v) ? cur[k].filter((x) => x !== v) : [...cur[k], v] }));

  const results = useMemo(() => {
    const q = norm(f.q);
    let list = perfumes.filter((p) =>
      (!q || norm(`${p.name} ${p.house} ${p.family}`).includes(q) || p.allNotes.some((n) => n.includes(q))) &&
      f.notes.every((t) => hasNote(p, t)) &&
      !f.avoid.some((t) => hasNote(p, t)) &&
      (!f.families.length || f.families.includes(p.family)) &&
      (!f.gender || p.gender === f.gender) &&
      (!f.house || p.house === f.house) &&
      p.priceGbp <= f.max &&
      (LONGEVITY_LEVEL[p.longevity] ?? 0) >= f.longevity &&
      (!f.season || p.seasons.includes(f.season as Season)) &&
      (!f.occasion || p.occasions.includes(f.occasion as Occasion)) &&
      (!f.rated || !!p.scentLens) &&
      (!f.gems || p.isHiddenGem),
    );
    const s = (p: Perfume) => p.scentLens?.score ?? -1;
    switch (f.sort) {
      case "score": list = [...list].sort((a, b) => s(b) - s(a)); break;
      case "reviews": list = [...list].sort((a, b) => (b.scentLens?.totalReviews ?? 0) - (a.scentLens?.totalReviews ?? 0)); break;
      case "price-asc": list = [...list].sort((a, b) => a.priceGbp - b.priceGbp); break;
      case "price-desc": list = [...list].sort((a, b) => b.priceGbp - a.priceGbp); break;
      case "longevity": list = [...list].sort((a, b) => (LONGEVITY_LEVEL[b.longevity] ?? 0) - (LONGEVITY_LEVEL[a.longevity] ?? 0) || s(b) - s(a)); break;
      case "name": list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      default: list = [...list].sort((a, b) => Number(b.isHiddenGem) - Number(a.isHiddenGem) || s(b) - s(a));
    }
    return list;
  }, [f]);

  const noteSuggestions = useMemo(() => {
    const q = norm(noteQ);
    return (q ? noteIndex.filter((n) => n.note.includes(q)) : noteIndex).filter((n) => !f.notes.includes(n.note) && !f.avoid.includes(n.note)).slice(0, q ? 8 : 18);
  }, [noteQ, f.notes, f.avoid]);

  const activeCount = f.notes.length + f.avoid.length + f.families.length + (f.gender ? 1 : 0) + (f.house ? 1 : 0) + (f.max < priceRange.max ? 1 : 0) + (f.longevity ? 1 : 0) + (f.season ? 1 : 0) + (f.occasion ? 1 : 0) + (f.rated ? 1 : 0) + (f.gems ? 1 : 0);
  const reset = () => setF({ ...fromParams(new URLSearchParams()), q: f.q, sort: f.sort });

  const filters = (
    <div className="space-y-7">
      <Group title="Scent family">
        <div className="flex flex-wrap gap-1.5">
          {familiesInUse.map((fam) => (
            <Chip key={fam} on={f.families.includes(fam)} onClick={() => toggleIn("families", fam)}>{fam}</Chip>
          ))}
        </div>
      </Group>
      <Group title="Wearer">
        <div className="flex flex-wrap gap-1.5">
          <Chip on={!f.gender} onClick={() => set("gender", "")}>Everyone</Chip>
          {(["M", "W", "U"] as const).map((g) => <Chip key={g} on={f.gender === g} onClick={() => set("gender", f.gender === g ? "" : g)}>{GENDER_LABEL[g]}</Chip>)}
        </div>
      </Group>
      <Group title={`Max price · £${f.max}`}>
        <input type="range" aria-label="Maximum price in pounds" min={priceRange.min} max={priceRange.max} value={f.max} onChange={(e) => set("max", +e.target.value)} className="w-full accent-[#1a4535]" />
      </Group>
      <Group title="Performance (longevity)">
        <div className="flex flex-wrap gap-1.5">
          {[[0, "Any"], [3, "Long +"], [4, "Very long"]].map(([v, l]) => <Chip key={v} on={f.longevity === v} onClick={() => set("longevity", v as number)}>{l}</Chip>)}
        </div>
      </Group>
      <Group title="Season" hint="Suggested from notes">
        <div className="flex flex-wrap gap-1.5">
          {SEASONS.map((s) => <Chip key={s} on={f.season === s} onClick={() => set("season", f.season === s ? "" : s)}>{s}</Chip>)}
        </div>
      </Group>
      <Group title="Occasion" hint="Suggested from notes">
        <div className="flex flex-wrap gap-1.5">
          {OCCASIONS.map((o) => <Chip key={o} on={f.occasion === o} onClick={() => set("occasion", f.occasion === o ? "" : o)}>{o}</Chip>)}
        </div>
      </Group>
      <Group title="House">
        <select value={f.house} onChange={(e) => set("house", e.target.value)} aria-label="House" className="w-full rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm">
          <option value="">All {houses.length} houses</option>
          {houses.map((h) => <option key={h}>{h}</option>)}
        </select>
      </Group>
      <div className="space-y-2">
        <Toggle on={f.gems} onClick={() => set("gems", !f.gems)}>Hidden gems only</Toggle>
        <Toggle on={f.rated} onClick={() => set("rated", !f.rated)}>Only perfumes with a ScentLens Rating</Toggle>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-page px-5 pb-32 md:px-10">
      {/* Note finder */}
      <section id="notes" aria-labelledby="notes-h" className="mb-10 rounded-[30px] border border-champagne-500/30 bg-white/60 p-5 md:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="notes-h" className="font-serif text-2xl text-cave">Note finder</h2>
          <p className="text-xs text-ink-mute">Tap a note to require it · tap ✕ on a chosen note to remove it · use “avoid” to exclude</p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[22px] border border-ink/10 bg-ivory-50 p-2 focus-within:border-champagne-600">
          {f.notes.map((n) => (
            <span key={n} className="inline-flex items-center gap-1.5 rounded-full bg-cave-700 py-1.5 pl-3 pr-1.5 text-sm capitalize text-ivory">
              {n}
              <button type="button" onClick={() => toggleIn("notes", n)} className="grid h-5 w-5 place-items-center rounded-full bg-ivory/15 text-[10px]" aria-label={`Remove ${n}`}>✕</button>
            </span>
          ))}
          {f.avoid.map((n) => (
            <span key={n} className="inline-flex items-center gap-1.5 rounded-full border border-rose-clay/50 py-1.5 pl-3 pr-1.5 text-sm capitalize text-rose-clay line-through">
              {n}
              <button type="button" onClick={() => toggleIn("avoid", n)} className="grid h-5 w-5 place-items-center rounded-full bg-rose-clay/10 text-[10px] no-underline" aria-label={`Stop avoiding ${n}`}>✕</button>
            </span>
          ))}
          <input
            value={noteQ}
            onChange={(e) => setNoteQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && noteQ.trim()) { e.preventDefault(); toggleIn("notes", noteSuggestions[0]?.note ?? norm(noteQ)); setNoteQ(""); }
              if (e.key === "Backspace" && !noteQ && f.notes.length) toggleIn("notes", f.notes[f.notes.length - 1]);
            }}
            placeholder={f.notes.length ? "Add another note…" : "Type a note, e.g. vanilla, then press Enter"}
            aria-label="Add a note"
            className="min-w-[12rem] flex-1 bg-transparent px-2 py-1.5 text-[15px] outline-none"
          />
        </div>
        <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {noteSuggestions.map((n) => (
            <span key={n.note} className="inline-flex shrink-0 overflow-hidden rounded-full border border-ink/15 text-[13px]">
              <button type="button" onClick={() => { toggleIn("notes", n.note); setNoteQ(""); }} className="px-3 py-1.5 capitalize hover:bg-champagne-500/20">
                <span className="text-champagne-700">+</span> {n.note} <span className="text-ink-mute">{n.count}</span>
              </button>
              <button type="button" onClick={() => { toggleIn("avoid", n.note); setNoteQ(""); }} className="border-l border-ink/10 px-2 text-ink-mute hover:bg-rose-clay/10 hover:text-rose-clay" aria-label={`Avoid ${n.note}`}>avoid</button>
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24">
            <div className="mb-6 flex items-center justify-between"><p className="eyebrow text-ink-mute">Filters</p>{activeCount > 0 && <button type="button" onClick={reset} className="text-xs text-cave-600 underline">Clear {activeCount}</button>}</div>
            {filters}
          </div>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[14rem] flex-1">
              <input value={f.q} onChange={(e) => set("q", e.target.value)} placeholder="Search name, house or ingredient" aria-label="Search perfumes"
                className="w-full rounded-full border border-ink/15 bg-white/80 py-3 pl-11 pr-4 text-[15px] outline-none focus:border-champagne-600" />
              <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            </div>
            <select value={f.sort} onChange={(e) => set("sort", e.target.value as SortKey)} aria-label="Sort" className="rounded-full border border-ink/15 bg-white/80 px-4 py-3 text-sm">
              {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button type="button" onClick={() => setPanel(true)} className="rounded-full border border-ink/15 px-4 py-3 text-sm lg:hidden" aria-expanded={panel}>
              Filters{activeCount ? ` · ${activeCount}` : ""}
            </button>
          </div>
          <p className="mb-5 text-sm text-ink-mute" aria-live="polite"><strong className="font-semibold text-cave">{results.length}</strong> of {perfumes.length} perfumes</p>

          {results.length ? (
            <>
              <div className="grid grid-cols-2 gap-3 md:gap-5 xl:grid-cols-3">
                {results.slice(0, limit).map((p, i) => (
                  <PerfumeCard key={p.slug} perfume={p} index={i} matched={f.notes.length ? p.allNotes.filter((n) => f.notes.some((t) => n.includes(t))).slice(0, 3) : undefined} />
                ))}
              </div>
              {limit < results.length && (
                <div className="mt-12 text-center">
                  <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="btn-ghost text-cave">Show more · {results.length - limit} left</button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-[28px] border border-dashed border-ink/20 px-6 py-20 text-center">
              <p className="font-serif text-3xl text-cave">No treasures match — yet.</p>
              <p className="mx-auto mt-3 max-w-md text-ink-mute">Try removing a note, widening the price, or switching to fewer filters.</p>
              <button type="button" onClick={reset} className="btn-gold mt-6">Clear filters</button>
            </div>
          )}
        </div>
      </div>

      {panel && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" className="absolute inset-0 bg-cave-900/50" aria-label="Close filters" onClick={() => setPanel(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[28px] bg-ivory-50 p-6 pb-28">
            <div className="mb-6 flex items-center justify-between"><p className="font-serif text-2xl">Filters</p><button type="button" onClick={reset} className="text-sm text-cave-600 underline">Clear all</button></div>
            {filters}
            <div className="fixed inset-x-0 bottom-0 bg-ivory-50 p-4"><button type="button" onClick={() => setPanel(false)} className="btn-gold w-full">Show {results.length} perfumes</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="eyebrow mb-3 flex w-full justify-between text-[10.5px] text-ink-mute">{title}{hint && <span className="normal-case tracking-normal opacity-70">{hint}</span>}</legend>
      {children}
    </fieldset>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`chip ${on ? "border-cave-600 bg-cave-700 text-ivory" : "border-ink/15 text-ink hover:border-champagne-600"}`}>
      {children}
    </button>
  );
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onClick} className="flex w-full items-center justify-between gap-3 text-left text-sm">
      <span>{children}</span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-cave-600" : "bg-ink/15"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}
