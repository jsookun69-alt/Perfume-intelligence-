"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getPerfume } from "@/lib/data";
import { recommend } from "@/lib/similarity";
import { useCompare, useMounted, useProfile, useSaved } from "@/lib/store";
import PerfumeCard, { CardSkeleton } from "@/components/PerfumeCard";
import type { Perfume } from "@/lib/types";

export default function SavedPage() {
  const { saved, clear } = useSaved();
  const { set } = useCompare();
  const { profile } = useProfile();
  const mounted = useMounted();
  const [copied, setCopied] = useState(false);
  const list = saved.map(getPerfume).filter((p): p is Perfume => !!p);
  const total = list.reduce((a, p) => a + p.priceGbp, 0);
  const recs = useMemo(() => {
    if (!mounted) return [];
    const fam = Array.from(new Set(list.map((p) => p.family)));
    const liked = Array.from(new Set(list.flatMap((p) => p.notes.base.slice(0, 2).map((n) => n.toLowerCase()))));
    return recommend({ families: [...profile.families, ...fam], liked: [...profile.liked, ...liked], disliked: profile.disliked }, 8)
      .filter((p) => !saved.includes(p.slug)).slice(0, 4);
  }, [list, profile, saved, mounted]);

  const copy = async () => {
    const text = `My Caverne d’Ali Beauté list\n${list.map((p) => `• ${p.house} ${p.name} — approx. £${p.priceGbp}${p.scentLens ? ` · ScentLens ${p.scentLens.score.toFixed(1)}/100` : ""}`).join("\n")}`;
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); }
  };

  return (
    <div className="bg-ivory pb-32 pt-36 md:pt-44">
      <div className="mx-auto max-w-page px-5 md:px-10">
        <p className="eyebrow text-champagne-700">Your treasures</p>
        <h1 className="display mt-5 text-[clamp(3rem,7.5vw,7rem)] text-cave">Saved <em className="italic text-champagne-700">for later.</em></h1>
        <p className="mt-6 max-w-xl text-lg text-ink-soft">Saved on this device only. {mounted && list.length > 0 && <>{list.length} perfume{list.length > 1 ? "s" : ""} · approx. £{total} in total.</>}</p>

        {!mounted ? (
          <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : list.length ? (
          <>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={copy} className="btn-gold">{copied ? "Copied ✓" : "Copy my list"}</button>
              {list.length > 1 && <Link href={`/compare?p=${list.slice(0, 3).map((p) => p.slug).join(",")}`} onClick={() => set(list.slice(0, 3).map((p) => p.slug))} className="btn-ghost text-cave">Compare {Math.min(3, list.length)}</Link>}
              <button type="button" onClick={clear} className="btn text-ink-mute hover:text-ink">Clear all</button>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
              {list.map((p, i) => <PerfumeCard key={p.slug} perfume={p} index={i} />)}
            </div>
          </>
        ) : (
          <div className="mt-12 rounded-[28px] border border-dashed border-ink/20 px-6 py-20 text-center">
            <p className="font-serif text-3xl text-cave">Your cave is empty.</p>
            <p className="mx-auto mt-3 max-w-md text-ink-mute">Tap the heart on any perfume to keep it here.</p>
            <Link href="/collections/hidden-gems" className="btn-gold mt-6">Start with hidden gems</Link>
          </div>
        )}

        {mounted && recs.length > 0 && (
          <section className="mt-24" aria-labelledby="recs-h">
            <h2 id="recs-h" className="font-serif text-4xl text-cave">Recommended for you</h2>
            <p className="mt-2 text-ink-mute">Based on what you&rsquo;ve saved and your taste profile.</p>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">{recs.map((p, i) => <PerfumeCard key={p.slug} perfume={p} index={i + 1} />)}</div>
          </section>
        )}
      </div>
    </div>
  );
}
