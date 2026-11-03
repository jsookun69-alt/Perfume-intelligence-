"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { perfumes } from "@/lib/data";
import { sharedNotes, similarTo } from "@/lib/similarity";
import BottleSVG from "@/components/BottleSVG";
import { SplitHeadline } from "@/components/Reveal";

const sorted = [...perfumes].sort((a, b) => a.name.localeCompare(b.name));

/** Section 6 — pick two perfumes and see them side by side, plus alternatives to the first. */
export default function CompareTeaser({ initial }: { initial: [string, string] }) {
  const [a, setA] = useState(initial[0]);
  const [b, setB] = useState(initial[1]);
  const A = perfumes.find((p) => p.slug === a)!;
  const B = perfumes.find((p) => p.slug === b)!;
  const shared = useMemo(() => sharedNotes(A, B), [A, B]);
  const alts = useMemo(() => similarTo(A, 3).map((x) => x.p), [A]);

  const rows: [string, (p: typeof A) => string][] = [
    ["ScentLens", (p) => (p.scentLens ? `${p.scentLens.score.toFixed(1)}/100` : "Not yet rated")],
    ["Price (approx.)", (p) => `£${p.priceGbp}`],
    ["Family", (p) => p.family],
    ["Longevity", (p) => p.longevity],
    ["Best in", (p) => p.seasons.join(", ")],
  ];

  return (
    <section className="cave-bg py-28 text-ivory md:py-40" aria-labelledby="compare-h">
      <div className="mx-auto max-w-page px-5 md:px-10">
        <p className="eyebrow text-champagne-400">05 — Compare &amp; discover</p>
        <SplitHeadline className="h-section mt-5" lines={["Two treasures,", <em key="e" className="gold-text italic">side by side.</em>]} />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
          {[{ v: a, set: setA, p: A }, null, { v: b, set: setB, p: B }].map((x, i) =>
            x === null ? (
              <div key="vs" className="flex items-center justify-center font-serif text-5xl italic text-champagne-400/70" aria-hidden>vs</div>
            ) : (
              <div key={i} className="rounded-[28px] border border-ivory/10 bg-ivory/[0.04] p-6">
                <label className="block">
                  <span className="sr-only">Perfume {i === 0 ? "A" : "B"}</span>
                  <select value={x.v} onChange={(e) => x.set(e.target.value)} className="w-full rounded-full border border-ivory/20 bg-cave-900 px-4 py-3 font-serif text-lg text-ivory">
                    {sorted.map((p) => <option key={p.slug} value={p.slug}>{p.name} — {p.house}</option>)}
                  </select>
                </label>
                <div className="mt-6 flex items-center gap-5">
                  <BottleSVG bottle={x.p.bottle} seed={`${x.p.house}|${x.p.name}`} className="h-36 w-auto" />
                  <div>
                    <p className="eyebrow text-ivory/50">{x.p.house}</p>
                    <p className="font-serif text-3xl leading-tight">{x.p.name}</p>
                  </div>
                </div>
                <dl className="mt-6 divide-y divide-ivory/10 text-sm">
                  {rows.map(([k, f]) => (
                    <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-ivory/50">{k}</dt><dd className="text-right">{f(x.p)}</dd></div>
                  ))}
                </dl>
              </div>
            ),
          )}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] border border-champagne-500/30 p-6">
            <p className="eyebrow text-champagne-400">Shared notes · {shared.length}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {shared.length ? shared.map((n) => <span key={n} className="rounded-full bg-champagne-500/15 px-3 py-1 text-sm capitalize text-champagne-300">{n}</span>) : <span className="text-ivory/50">No notes in common — very different perfumes.</span>}
            </div>
          </div>
          <div className="rounded-[28px] border border-ivory/10 p-6">
            <p className="eyebrow text-ivory/50">If you like {A.name}, also explore</p>
            <ul className="mt-4 space-y-2">
              {alts.map((p) => (
                <li key={p.slug}><Link href={`/perfumes/${p.slug}`} className="flex justify-between gap-4 hover:text-champagne-300"><span className="font-serif text-lg">{p.name}</span><span className="text-sm text-ivory/50">{p.house}</span></Link></li>
              ))}
            </ul>
          </div>
        </div>
        <Link href={`/compare?p=${a},${b}`} className="btn-gold mt-10">Open full comparison</Link>
      </div>
    </section>
  );
}
