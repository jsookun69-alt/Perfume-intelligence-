"use client";

import { useMemo } from "react";
import Link from "next/link";
import { familiesInUse, noteIndex, perfumes } from "@/lib/data";
import { recommend } from "@/lib/similarity";
import { useMounted, useProfile } from "@/lib/store";
import PerfumeCard from "@/components/PerfumeCard";
import { Reveal, SplitHeadline } from "@/components/Reveal";

/** Shown before the visitor picks anything: well-reviewed, highly rated perfumes. */
const FAVOURITES = perfumes
  .filter((p) => p.scentLens && p.scentLens.totalReviews >= 150)
  .sort((a, b) => (b.scentLens!.score - a.scentLens!.score) || (b.scentLens!.totalReviews - a.scentLens!.totalReviews))
  .slice(0, 4);

const FAMILY_MOOD: Record<string, string> = {
  Fresh: "clean air", Aquatic: "sea spray", Citrus: "sunlit peel", Aromatic: "wild herbs", Woody: "dry cedar",
  Amber: "warm resin", Gourmand: "sweet treats", Floral: "petals", Fruity: "ripe fruit", Leather: "supple hide",
  Oud: "smoke & wood", Musky: "clean skin",
};

function matchesHref(liked: string[], families: string[]) {
  const qs = new URLSearchParams();
  if (liked[0]) qs.set("note", liked[0]);
  if (families.length) qs.set("family", families.join(","));
  return `/perfumes?${qs.toString()}`;
}

/** Section 2 — build a taste profile (families + liked/disliked notes) and get live recommendations. */
export default function DiscoverScent() {
  const { profile, update } = useProfile();
  const mounted = useMounted();
  const notes = useMemo(() => noteIndex.slice(0, 22).map((n) => n.note), []);
  const recs = useMemo(() => (mounted ? recommend(profile, 4) : []), [profile, mounted]);
  const empty = !profile.families.length && !profile.liked.length;

  const toggle = (key: "families" | "liked" | "disliked", v: string) => {
    const list = profile[key];
    const next = { ...profile, [key]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] };
    if (key === "liked") next.disliked = next.disliked.filter((x) => x !== v);
    if (key === "disliked") next.liked = next.liked.filter((x) => x !== v);
    update(next);
  };

  return (
    <section id="discover" className="relative bg-ivory py-28 md:py-40" aria-labelledby="discover-h">
      <div className="mx-auto max-w-page px-5 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="eyebrow text-champagne-700">02 — Discover your scent</p>
            <SplitHeadline className="h-section mt-5 text-cave" lines={["What do you", <em key="e" className="italic text-champagne-700">love to smell?</em>]} />
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              Choose the moods that draw you in and the notes you adore — or can&rsquo;t stand. Your recommendations update instantly and stay on this device.
            </p>
          </div>

          <Reveal className="space-y-8" stagger={0.06}>
            <fieldset data-reveal>
              <legend className="eyebrow mb-4 text-ink-mute">1 · Scent families</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {familiesInUse.map((f) => {
                  const on = mounted && profile.families.includes(f);
                  return (
                    <button key={f} type="button" aria-pressed={on} onClick={() => toggle("families", f)}
                      className={`group rounded-2xl border px-4 py-3 text-left transition-all duration-500 ease-luxe ${on ? "border-cave-600 bg-cave-700 text-ivory" : "border-ink/10 bg-white/60 hover:-translate-y-0.5 hover:border-champagne-600"}`}>
                      <span className="block font-serif text-lg">{f}</span>
                      <span className={`text-xs ${on ? "text-ivory/60" : "text-ink-mute"}`}>{FAMILY_MOOD[f]}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <fieldset data-reveal>
              <legend className="eyebrow mb-4 text-ink-mute">2 · Notes — tap once to love, twice to avoid</legend>
              <div className="flex flex-wrap gap-2">
                {notes.map((n) => {
                  const liked = mounted && profile.liked.includes(n);
                  const dis = mounted && profile.disliked.includes(n);
                  return (
                    <button key={n} type="button"
                      onClick={() => (liked ? toggle("disliked", n) : dis ? toggle("disliked", n) : toggle("liked", n))}
                      aria-label={`${n}: ${liked ? "loved" : dis ? "avoided" : "neutral"}`}
                      className={`chip capitalize ${liked ? "border-champagne-600 bg-champagne-500 text-cave-900" : dis ? "border-rose-clay/60 text-rose-clay line-through" : "border-ink/15 hover:border-champagne-600"}`}>
                      {liked ? "♥ " : dis ? "✕ " : ""}{n}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </Reveal>
        </div>

        <div className="mt-16" aria-live="polite">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 id="discover-h" className="font-serif text-3xl text-cave">{empty ? "Crowd favourites" : "Your treasures"}</h3>
              {empty && <p className="mt-1 text-sm text-ink-mute">Highly rated by hundreds of reviewers. Choose a family or note above to personalise.</p>}
            </div>
            {!empty && (
              <div className="flex gap-4 text-sm">
                <Link href={matchesHref(profile.liked, profile.families)} className="link-underline text-cave-600">See all matches →</Link>
                <button type="button" onClick={() => update({ families: [], liked: [], disliked: [] })} className="text-ink-mute hover:text-ink">Reset</button>
              </div>
            )}
          </div>
          {empty ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {FAVOURITES.map((p, i) => <PerfumeCard key={p.slug} perfume={p} index={i} />)}
            </div>
          ) : recs.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {recs.map((p, i) => <PerfumeCard key={p.slug} perfume={p} index={i} />)}
            </div>
          ) : (
            <p className="rounded-2xl border border-ink/10 p-6 text-ink-mute">Nothing fits all of that yet — try loving fewer notes or avoiding fewer.</p>
          )}
        </div>
      </div>
    </section>
  );
}
