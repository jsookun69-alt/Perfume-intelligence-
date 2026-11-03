"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Perfume } from "@/lib/types";
import NotePyramid from "@/components/NotePyramid";
import RatingRing from "@/components/RatingRing";
import { SCENTLENS_PENALTY } from "@/lib/scentlens";
import { SplitHeadline } from "@/components/Reveal";

const TABS = [
  { key: "notes", label: "Notes", title: "A perfume changes as it evaporates", body: "Top notes greet you, the heart defines the character, and the base is what lingers. Drag the timeline to watch the layers hand over." },
  { key: "ratings", label: "Ratings", title: "A score you can check line by line", body: "ScentLens averages published customer and community ratings — converted to 100 — then subtracts seven points to stay conservative. Every source is linked." },
  { key: "performance", label: "Performance", title: "Longevity, season and occasion", body: "Longevity is an editorial estimate from reviews and concentration. Seasons and occasions are suggested from each perfume's family and notes, and always labelled as suggestions." },
] as const;

/** Section 4 — an interactive explainer of notes, ratings and performance using real perfumes. */
export default function FragranceIntelligence({ examples }: { examples: Perfume[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("notes");
  const [slug, setSlug] = useState(examples[0]?.slug);
  const p = useMemo(() => examples.find((x) => x.slug === slug) ?? examples[0], [slug, examples]);
  const t = TABS.find((x) => x.key === tab)!;
  if (!p) return null;

  return (
    <section className="relative overflow-hidden bg-ivory-200/60 py-28 md:py-40" aria-labelledby="intel-h">
      <div className="mx-auto max-w-page px-5 md:px-10">
        <p className="eyebrow text-champagne-700">04 — Fragrance intelligence</p>
        <SplitHeadline className="h-section mt-5 max-w-4xl text-cave" lines={["Understand a perfume", <em key="e" className="italic text-champagne-700">before you smell it.</em>]} />

        <div className="mt-12 grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <div role="tablist" aria-label="Fragrance intelligence topics" className="inline-flex rounded-full border border-ink/10 bg-white/60 p-1">
              {TABS.map((x) => (
                <button key={x.key} role="tab" type="button" aria-selected={tab === x.key} aria-controls={`panel-${x.key}`} id={`tab-${x.key}`}
                  onClick={() => setTab(x.key)}
                  className={`rounded-full px-5 py-2.5 text-sm transition-colors duration-300 ${tab === x.key ? "bg-cave-700 text-ivory" : "text-ink-soft hover:text-ink"}`}>
                  {x.label}
                </button>
              ))}
            </div>
            <h3 className="mt-8 font-serif text-3xl text-cave md:text-4xl">{t.title}</h3>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">{t.body}</p>
            <label className="mt-8 block max-w-sm">
              <span className="eyebrow text-ink-mute">Try it with</span>
              <select value={p.slug} onChange={(e) => setSlug(e.target.value)} className="mt-2 w-full rounded-full border border-ink/15 bg-white px-4 py-3 font-serif text-lg">
                {examples.map((x) => <option key={x.slug} value={x.slug}>{x.name} — {x.house}</option>)}
              </select>
            </label>
            <Link href={`/perfumes/${p.slug}`} className="link-underline mt-5 inline-block text-cave-600">Open the full profile →</Link>
          </div>

          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="rounded-[32px] border border-ink/10 bg-ivory-50 p-6 shadow-[0_40px_80px_-50px_rgba(12,35,27,.5)] md:p-10">
            {tab === "notes" && <NotePyramid key={p.slug} perfume={p} />}
            {tab === "ratings" && (
              p.scentLens ? (
                <div>
                  <div className="flex items-center gap-5">
                    <RatingRing score={p.scentLens.score} size={110} stroke={9} />
                    <div><p className="font-serif text-2xl text-cave">ScentLens Rating: {p.scentLens.score.toFixed(1)}/100</p><p className="text-sm text-ink-mute">{p.name}</p></div>
                  </div>
                  <ol className="mt-8 space-y-3">
                    {p.scentLens.sources.map((s) => (
                      <li key={s.source} className="flex items-center justify-between gap-4 rounded-2xl bg-white/70 px-4 py-3 text-sm">
                        <span>{s.source} <span className="text-ink-mute">· {s.count.toLocaleString("en-GB")} reviews</span></span>
                        <span className="tabular-nums">{+s.value.toFixed(2)}/{s.scale} → <strong className="font-semibold text-cave">{s.normalised.toFixed(1)}</strong></span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-5 rounded-2xl bg-cave-800 px-4 py-3 font-mono text-sm text-ivory">
                    ({p.scentLens.sources.map((s) => s.normalised.toFixed(1)).join(" + ")}) ÷ {p.scentLens.sources.length} − {SCENTLENS_PENALTY} = <span className="text-champagne-300">{p.scentLens.score.toFixed(1)}</span>
                  </p>
                </div>
              ) : <p className="text-ink-mute">This perfume has no qualifying published ratings yet, so it isn&rsquo;t scored. Choose another.</p>
            )}
            {tab === "performance" && (
              <div className="space-y-8">
                <Meter label="Longevity (editorial estimate)" value={p.longevity === "Very long" ? 4 : p.longevity === "Long" ? 3 : 2} max={4} caption={p.longevity} />
                <Meter label="Versatility (derived)" value={p.versatility} max={5} caption={`${p.seasons.length} seasons · ${p.occasions.length} occasions`} />
                <div>
                  <p className="eyebrow mb-3 text-ink-mute">Suggested seasons</p>
                  <div className="grid grid-cols-4 gap-2">
                    {(["Spring", "Summer", "Autumn", "Winter"] as const).map((s) => (
                      <div key={s} className={`rounded-2xl border px-3 py-3 text-center text-sm ${p.seasons.includes(s) ? "border-cave-600 bg-cave-700 text-ivory" : "border-ink/10 text-ink-mute"}`}>{s}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="eyebrow mb-3 text-ink-mute">Suggested occasions</p>
                  <div className="flex flex-wrap gap-2">{p.occasions.map((o) => <span key={o} className="chip border-champagne-600/50 text-champagne-700">{o}</span>)}</div>
                </div>
                <p className="text-xs text-ink-mute">Projection isn&rsquo;t published reliably for these perfumes, so we don&rsquo;t show a number for it.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Meter({ label, value, max, caption }: { label: string; value: number; max: number; caption?: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm"><span className="eyebrow text-ink-mute">{label}</span><span className="text-ink-soft">{caption}</span></div>
      <div className="flex gap-1.5" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
        {Array.from({ length: max }).map((_, i) => (
          <span key={i} className={`h-2.5 flex-1 rounded-full transition-colors duration-700 ${i < value ? "bg-gradient-to-r from-cave-600 to-champagne-600" : "bg-ink/10"}`} />
        ))}
      </div>
    </div>
  );
}
