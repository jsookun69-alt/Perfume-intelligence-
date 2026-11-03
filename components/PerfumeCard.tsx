"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Perfume } from "@/lib/types";
import BottleSVG from "./BottleSVG";
import { CompareButton, SaveButton } from "./PerfumeActions";

const TONES = [
  "from-[#2f6350] to-[#123327]", // emerald
  "from-[#d49073] to-[#a95c41]", // clay
  "from-[#f1e6d2] to-[#dcc6a2]", // champagne ivory
];

/** Arched "treasure niche" card with tilt, bottle, rating and quick actions. */
export default function PerfumeCard({ perfume: p, index = 0, matched }: { perfume: Perfume; index?: number; matched?: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const tone = TONES[index % 3];
  const light = index % 3 === 2;

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ""; };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="group relative rounded-[26px] border border-champagne-500/25 bg-gradient-to-b from-white to-ivory-200/70 p-3 shadow-[0_18px_40px_-28px_rgba(40,28,10,.45)] transition-[transform,box-shadow,border-color] duration-500 ease-luxe hover:border-champagne-500/70 hover:shadow-[0_34px_60px_-30px_rgba(40,28,10,.55)] md:p-4"
    >
      <Link href={`/perfumes/${p.slug}`} className="block rounded-[22px] after:absolute after:inset-0 after:rounded-[26px] after:content-['']" aria-label={`${p.name} by ${p.house}`}>
      <div className={`arch relative flex h-52 items-end justify-center overflow-hidden bg-gradient-to-b ${tone} shadow-[inset_0_0_0_1.5px_rgba(226,198,150,.7),inset_0_18px_40px_rgba(0,0,0,.18)] md:h-60`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_78%,rgba(255,230,170,.55),transparent_60%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute inset-x-[8%] bottom-8 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[#f3dc9e] to-transparent shadow-[0_-6px_20px_rgba(255,226,160,.55)]" />
        <BottleSVG bottle={p.bottle} seed={`${p.house}|${p.name}`} className="relative mb-6 h-[74%] w-auto transition-transform duration-700 ease-luxe group-hover:-translate-y-2 group-hover:-rotate-2 group-hover:scale-105" />
        <span className={`absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] backdrop-blur ${light ? "border-white/70 bg-white/60 text-ink" : "border-white/30 bg-white/15 text-white"}`}>{p.family}</span>
        {p.isHiddenGem && (
          <span className="absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-cave-900/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-champagne-300 backdrop-blur">◆ Hidden gem</span>
        )}
      </div>
      <div className="px-1 pb-1 pt-4">
        <p className="eyebrow text-[10px] text-ink-mute">{p.house}</p>
        <h3 className="mt-1 font-serif text-[1.35rem] leading-tight text-ink md:text-2xl">{p.name}</h3>
        {matched && matched.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {matched.map((m) => <span key={m} className="rounded-full border border-champagne-600/50 px-2 py-0.5 text-[11px] capitalize text-champagne-700">{m}</span>)}
          </div>
        )}
        <div className="mt-3 flex items-end justify-between gap-3 border-t border-ink/10 pt-3">
          <div>
            {p.scentLens ? (
              <p className="flex items-baseline gap-1.5"><span className="font-serif text-2xl text-cave">{p.scentLens.score.toFixed(1)}</span><span className="text-[10px] uppercase leading-tight tracking-[0.14em] text-ink-mute">/100<br />ScentLens</span></p>
            ) : (
              <p className="text-xs italic text-ink-mute">Not yet rated</p>
            )}
          </div>
          <p className="font-serif text-xl text-ink">£{p.priceGbp}</p>
        </div>
      </div>
      </Link>
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 md:right-5 md:top-5">
        <SaveButton slug={p.slug} name={p.name} />
        <CompareButton slug={p.slug} name={p.name} />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-[26px] border border-ink/5 p-4">
      <div className="arch skeleton h-52 md:h-60" />
      <div className="skeleton mt-4 h-3 w-1/3 rounded" />
      <div className="skeleton mt-2 h-5 w-2/3 rounded" />
      <div className="skeleton mt-5 h-6 w-full rounded" />
    </div>
  );
}
