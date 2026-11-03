"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { search, type SearchHit } from "@/lib/search";
import { noteIndex, perfumes } from "@/lib/data";
import BottleSVG from "./BottleSVG";
import { useLockBody } from "@/lib/store";

const Ctx = createContext<{ open: (q?: string) => void }>({ open: () => {} });
export const useSearch = () => useContext(Ctx);

function hitHref(h: SearchHit) {
  if (h.kind === "perfume") return `/perfumes/${h.perfume.slug}`;
  if (h.kind === "house") return `/perfumes?house=${encodeURIComponent(h.house)}`;
  return `/perfumes?note=${encodeURIComponent(h.note)}`;
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  useLockBody(isOpen);

  const open = useCallback((initial = "") => { setQ(initial); setActive(0); setOpen(true); }, []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "/" && !isOpen && !(e.target as HTMLElement).closest("input,textarea")) { e.preventDefault(); open(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, open]);

  useEffect(() => { if (isOpen) setTimeout(() => input.current?.focus(), 30); }, [isOpen]);

  const hits = useMemo(() => search(q, 14), [q]);
  const go = (h: SearchHit) => { close(); router.push(hitHref(h)); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && hits[active]) { e.preventDefault(); go(hits[active]); }
    else if (e.key === "Escape") close();
  };

  const groups: { title: string; kind: SearchHit["kind"] }[] = [
    { title: "Perfumes", kind: "perfume" }, { title: "Houses", kind: "house" }, { title: "Notes", kind: "note" },
  ];

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label="Search perfumes">
          <button type="button" aria-label="Close search" className="absolute inset-0 bg-cave-900/60 backdrop-blur-md" onClick={close} />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-champagne-500/30 bg-ivory-50 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-ink/10 px-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-champagne-700" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
              <input
                ref={input}
                value={q}
                onChange={(e) => { setQ(e.target.value); setActive(0); }}
                onKeyDown={onKeyDown}
                placeholder="Search a perfume, house or ingredient…"
                className="h-16 flex-1 bg-transparent font-serif text-xl text-ink outline-none placeholder:text-ink-mute/70"
                role="combobox"
                aria-expanded={hits.length > 0}
                aria-controls="search-results"
                aria-activedescendant={hits[active] ? `hit-${active}` : undefined}
              />
              <kbd className="hidden rounded-md border border-ink/15 px-2 py-0.5 text-[11px] text-ink-mute sm:block">Esc</kbd>
            </div>
            <div id="search-results" role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
              {!q && (
                <div className="p-4">
                  <p className="eyebrow mb-3 text-ink-mute">Popular ingredients</p>
                  <div className="flex flex-wrap gap-2">
                    {noteIndex.slice(0, 12).map((n) => (
                      <button key={n.note} type="button" onClick={() => setQ(n.note)} className="chip border-ink/15 capitalize hover:border-champagne-600">{n.note}</button>
                    ))}
                  </div>
                  <p className="mt-5 text-xs text-ink-mute">{perfumes.length} perfumes · tip: press <kbd className="rounded border px-1">/</kbd> or <kbd className="rounded border px-1">⌘K</kbd> anywhere</p>
                </div>
              )}
              {q && !hits.length && <p className="p-6 text-center text-ink-mute">Nothing matches “{q}”. Try a note like vanilla, oud or bergamot.</p>}
              {groups.map((g) => {
                const list = hits.map((h, i) => ({ h, i })).filter((x) => x.h.kind === g.kind);
                if (!list.length) return null;
                return (
                  <div key={g.kind} className="mb-1">
                    <p className="eyebrow px-3 pb-1 pt-3 text-[10px] text-ink-mute">{g.title}</p>
                    {list.map(({ h, i }) => (
                      <button
                        key={i}
                        id={`hit-${i}`}
                        role="option"
                        aria-selected={i === active}
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(h)}
                        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${i === active ? "bg-cave-700 text-ivory" : "hover:bg-ink/5"}`}
                      >
                        {h.kind === "perfume" ? (
                          <>
                            <span className="grid h-11 w-9 place-items-center"><BottleSVG bottle={h.perfume.bottle} seed={`${h.perfume.house}|${h.perfume.name}`} animate={false} className="h-11 w-auto" /></span>
                            <span className="min-w-0 flex-1"><span className="block truncate font-serif text-lg leading-tight">{h.perfume.name}</span><span className={`text-xs ${i === active ? "text-ivory/60" : "text-ink-mute"}`}>{h.perfume.house} · {h.perfume.family}</span></span>
                            {h.perfume.scentLens && <span className="font-serif text-lg">{h.perfume.scentLens.score.toFixed(1)}</span>}
                          </>
                        ) : (
                          <>
                            <span className="grid h-9 w-9 place-items-center rounded-full border border-current text-xs opacity-70">{h.kind === "house" ? "H" : "♪"}</span>
                            <span className="flex-1 capitalize">{h.kind === "house" ? h.house : h.note}</span>
                            <span className={`text-xs ${i === active ? "text-ivory/60" : "text-ink-mute"}`}>{h.count} perfumes</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
