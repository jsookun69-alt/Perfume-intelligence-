import Link from "next/link";
import type { Perfume } from "@/lib/types";
import RatingRing from "./RatingRing";
import { MIN_REVIEWS, SCENTLENS_PENALTY, scoreLabel } from "@/lib/scentlens";

const fmt = (n: number) => n.toLocaleString("en-GB");

/** ScentLens score with every source rating, its conversion and review count — fully explainable. */
export default function ScentLensPanel({ perfume }: { perfume: Perfume }) {
  const s = perfume.scentLens;
  return (
    <section aria-labelledby="scentlens-h" className="rounded-[28px] border border-ink/10 bg-white/60 p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-6">
        <RatingRing score={s?.score ?? null} size={112} stroke={9} />
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-champagne-700">Independent rating</p>
          <h2 id="scentlens-h" className="mt-1 font-serif text-2xl text-cave md:text-3xl">
            {s ? <>ScentLens Rating: {s.score.toFixed(1)}/100</> : <>ScentLens Rating: not yet rated</>}
          </h2>
          <p className="mt-1 text-sm text-ink-mute">
            {s ? <>{scoreLabel(s.score)} · from {s.sources.length} source{s.sources.length > 1 ? "s" : ""} · {fmt(s.totalReviews)} reviews</> : <>No published ratings with at least {MIN_REVIEWS} reviews were found yet. We never estimate one.</>}
          </p>
        </div>
      </div>

      {s && (
        <div className="mt-7 overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <caption className="sr-only">Source ratings used for the ScentLens Rating</caption>
            <thead>
              <tr className="border-b border-ink/10 text-[11px] uppercase tracking-[0.16em] text-ink-mute">
                <th className="py-2 pr-3 font-medium">Source</th>
                <th className="py-2 pr-3 font-medium">Rating</th>
                <th className="py-2 pr-3 font-medium">Out of 100</th>
                <th className="py-2 font-medium">Reviews</th>
              </tr>
            </thead>
            <tbody>
              {s.sources.map((r) => (
                <tr key={r.source} className="border-b border-ink/5">
                  <td className="py-3 pr-3">{r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer" className="link-underline text-cave-600">{r.source}</a> : r.source}</td>
                  <td className="py-3 pr-3 tabular-nums">{+r.value.toFixed(2)}/{r.scale}</td>
                  <td className="py-3 pr-3 tabular-nums">{r.normalised.toFixed(1)}</td>
                  <td className="py-3 tabular-nums">{fmt(r.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 rounded-2xl bg-cave-800 px-4 py-3 font-mono text-[12.5px] text-ivory/90">
            Average {s.average.toFixed(1)} − {SCENTLENS_PENALTY} = <span className="text-champagne-300">{s.score.toFixed(1)}</span>
          </p>
        </div>
      )}
      <p className="mt-4 text-xs text-ink-mute">
        Ratings belong to their sources and are shown for transparency. <Link href="/stories/how-scentlens-works" className="link-underline text-cave-600">How the ScentLens Rating works →</Link>
      </p>
    </section>
  );
}
