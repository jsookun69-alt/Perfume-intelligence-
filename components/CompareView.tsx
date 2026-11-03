"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getPerfume, GENDER_LABEL, perfumes } from "@/lib/data";
import { similarTo } from "@/lib/similarity";
import { MAX_COMPARE, useCompare, useMounted } from "@/lib/store";
import BottleSVG from "./BottleSVG";
import RatingRing from "./RatingRing";
import type { Perfume } from "@/lib/types";

const sorted = [...perfumes].sort((a, b) => a.name.localeCompare(b.name));

/** Side-by-side comparison of up to three perfumes, shareable via ?p=slug,slug,slug */
export default function CompareView() {
  const sp = useSearchParams();
  const router = useRouter();
  const { items, set } = useCompare();
  const mounted = useMounted();
  const [adding, setAdding] = useState("");

  // URL wins on first load; afterwards the tray store drives the URL
  useEffect(() => {
    const fromUrl = (sp.get("p") ?? "").split(",").filter((s) => getPerfume(s));
    if (fromUrl.length) set(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!mounted) return;
    const qs = items.length ? `?p=${items.join(",")}` : "";
    router.replace(`/compare${qs}`, { scroll: false });
  }, [items, mounted, router]);

  const list = items.map(getPerfume).filter((p): p is Perfume => !!p);
  const allNotes = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of list) for (const n of new Set(p.allNotes)) m.set(n, (m.get(n) ?? 0) + 1);
    return Array.from(m).sort((a, b) => b[1] - a[1]);
  }, [list]);
  const alternatives = useMemo(() => (list[0] ? similarTo(list[0], 6).map((x) => x.p).filter((p) => !items.includes(p.slug)).slice(0, 4) : []), [list, items]);

  if (!mounted) return <div className="mx-auto h-96 max-w-page px-5 md:px-10"><div className="skeleton h-full rounded-[28px]" /></div>;

  const rows: { label: string; render: (p: Perfume) => React.ReactNode }[] = [
    { label: "ScentLens", render: (p) => <div className="flex items-center gap-3"><RatingRing score={p.scentLens?.score ?? null} size={56} stroke={5} /><span className="text-xs text-ink-mute">{p.scentLens ? `${p.scentLens.sources.length} sources · ${p.scentLens.totalReviews.toLocaleString("en-GB")} reviews` : "Not yet rated"}</span></div> },
    { label: "Price (approx.)", render: (p) => <span className="font-serif text-2xl">£{p.priceGbp}</span> },
    { label: "Family", render: (p) => p.family },
    { label: "Wearer", render: (p) => GENDER_LABEL[p.gender] },
    { label: "Longevity", render: (p) => p.longevity },
    { label: "Seasons (suggested)", render: (p) => p.seasons.join(", ") },
    { label: "Occasions (suggested)", render: (p) => p.occasions.join(", ") },
    { label: "Top notes", render: (p) => <Notes notes={p.notes.top} shared={allNotes} n={list.length} /> },
    { label: "Heart notes", render: (p) => <Notes notes={p.notes.heart} shared={allNotes} n={list.length} /> },
    { label: "Base notes", render: (p) => <Notes notes={p.notes.base} shared={allNotes} n={list.length} /> },
  ];

  return (
    <div className="mx-auto max-w-page px-5 pb-32 md:px-10">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <label className="flex min-w-[16rem] flex-1 items-center gap-3">
          <span className="sr-only">Add a perfume to compare</span>
          <select value={adding} onChange={(e) => { if (e.target.value) { set([...items, e.target.value].slice(-MAX_COMPARE)); setAdding(""); } }}
            className="w-full rounded-full border border-ink/15 bg-white px-4 py-3 font-serif text-lg" disabled={false}>
            <option value="">{items.length >= MAX_COMPARE ? "Add another (replaces the first)…" : "+ Add a perfume to compare…"}</option>
            {sorted.filter((p) => !items.includes(p.slug)).map((p) => <option key={p.slug} value={p.slug}>{p.name} — {p.house}</option>)}
          </select>
        </label>
        {list.length > 0 && <button type="button" onClick={() => set([])} className="text-sm text-ink-mute underline">Clear</button>}
      </div>

      {!list.length ? (
        <div className="rounded-[28px] border border-dashed border-ink/20 px-6 py-24 text-center">
          <p className="font-serif text-3xl text-cave">Nothing to compare yet.</p>
          <p className="mx-auto mt-3 max-w-md text-ink-mute">Add up to three perfumes above, or tap the compare icon on any card while you explore.</p>
          <Link href="/perfumes" className="btn-gold mt-6">Explore perfumes</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[28px] border border-ink/10 bg-white/60">
          <table className="w-full min-w-[640px] table-fixed text-left text-sm">
            <caption className="sr-only">Comparison of {list.map((p) => p.name).join(", ")}</caption>
            <thead>
              <tr>
                <th className="w-40 p-5 align-bottom"><span className="eyebrow text-ink-mute">{list.length} of {MAX_COMPARE}</span></th>
                {list.map((p) => (
                  <th key={p.slug} className="p-5 align-bottom font-normal">
                    <div className="arch cave-bg mb-4 flex h-44 items-end justify-center pb-4">
                      <BottleSVG bottle={p.bottle} seed={`${p.house}|${p.name}`} className="h-32 w-auto" />
                    </div>
                    <p className="eyebrow text-[10px] text-ink-mute">{p.house}</p>
                    <Link href={`/perfumes/${p.slug}`} className="font-serif text-2xl leading-tight text-cave hover:underline">{p.name}</Link>
                    <button type="button" onClick={() => set(items.filter((s) => s !== p.slug))} className="mt-2 block text-xs text-ink-mute underline">Remove</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-ink/10 align-top">
                  <th scope="row" className="p-5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-mute">{r.label}</th>
                  {list.map((p) => <td key={p.slug} className="p-5">{r.render(p)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          {list.length > 1 && <p className="border-t border-ink/10 px-5 py-3 text-xs text-ink-mute"><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-champagne-500 align-middle" /> Highlighted notes appear in every perfume compared.</p>}
        </div>
      )}

      {alternatives.length > 0 && (
        <section className="mt-16" aria-labelledby="alt-h">
          <h2 id="alt-h" className="font-serif text-3xl text-cave">Alternatives to {list[0].name}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {alternatives.map((p) => (
              <li key={p.slug} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/60 p-3">
                <BottleSVG bottle={p.bottle} seed={`${p.house}|${p.name}`} animate={false} className="h-16 w-auto" />
                <div className="min-w-0 flex-1">
                  <Link href={`/perfumes/${p.slug}`} className="block truncate font-serif text-lg hover:underline">{p.name}</Link>
                  <p className="text-xs text-ink-mute">{p.house}{p.scentLens ? ` · ${p.scentLens.score.toFixed(1)}` : ""}</p>
                </div>
                <button type="button" onClick={() => set([...items, p.slug].slice(-MAX_COMPARE))} className="rounded-full border border-ink/15 px-3 py-1.5 text-xs hover:border-cave-600" aria-label={`Add ${p.name} to comparison`}>+ Add</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Notes({ notes, shared, n }: { notes: string[]; shared: [string, number][]; n: number }) {
  if (!notes.length) return <span className="text-ink-mute">—</span>;
  const common = new Set(shared.filter(([, c]) => c === n && n > 1).map(([k]) => k));
  return (
    <div className="flex flex-wrap gap-1">
      {notes.map((x) => (
        <span key={x} className={`rounded-full px-2.5 py-0.5 text-[12.5px] capitalize ${common.has(x.toLowerCase()) ? "bg-champagne-500 text-cave-900" : "bg-ink/5"}`}>{x}</span>
      ))}
    </div>
  );
}
