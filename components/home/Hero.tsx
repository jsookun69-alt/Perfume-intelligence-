"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Perfume } from "@/lib/types";
import Bottle3D from "@/components/three/Bottle3D";
import { SplitHeadline } from "@/components/Reveal";
import { useSearch } from "@/components/SearchPalette";
import Magnetic from "@/components/Magnetic";

const SUGGESTIONS = ["vanilla", "oud", "saffron", "rose", "bergamot", "tobacco"];

export default function Hero({ featured, notes }: { featured: Perfume; notes: string[] }) {
  const { open } = useSearch();
  const [q, setQ] = useState("");
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { opacity: 0, y: 24, duration: 1.2, ease: "power3.out", stagger: 0.12, delay: 0.7 });
      gsap.from("[data-hero-bottle]", { opacity: 0, scale: 0.9, duration: 1.8, ease: "expo.out", delay: 0.2 });
      // scroll-out: bottle drifts up and fades, copy lifts
      gsap.to("[data-hero-bottle]", { yPercent: -18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      gsap.to("[data-hero-copy]", { yPercent: -12, opacity: 0, ease: "none", scrollTrigger: { trigger: el, start: "30% top", end: "bottom top", scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="cave-bg relative min-h-[100svh] overflow-hidden text-ivory" aria-labelledby="hero-title">
      {/* atmosphere: light shaft, arches, glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[120%] w-[46rem] -translate-x-1/2 rotate-[8deg] bg-[linear-gradient(180deg,rgba(236,217,180,.18),rgba(236,217,180,0)_70%)] blur-2xl" />
        <div className="absolute bottom-[-30%] left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,180,131,.16),transparent_60%)]" />
        <svg className="absolute inset-x-0 bottom-0 h-[78%] w-full opacity-[0.13]" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice">
          {[0, 1, 2, 3, 4].map((i) => {
            const w = 260 + i * 230, x = 720 - w / 2, y = 120 + i * 40;
            return <path key={i} d={`M${x} 800V${y + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V800`} fill="none" stroke="#d4b483" strokeWidth="1" />;
          })}
        </svg>
      </div>

      <div className="relative mx-auto grid min-h-[100svh] max-w-page items-center gap-6 px-5 pb-16 pt-28 md:px-10 lg:grid-cols-[1.05fr_.95fr]">
        <div data-hero-copy className="relative z-10 order-2 lg:order-1">
          <p data-hero-fade className="eyebrow mb-6 text-champagne-400">Caverne d&rsquo;Ali Beauté · The hidden gems of perfumery</p>
          <SplitHeadline
            as="h1"
            immediate
            delay={0.35}
            className="display text-[clamp(3.4rem,9vw,8.6rem)]"
            lines={[<>Discover the</>, <em key="e" className="gold-text animate-shimmer italic">Extraordinary.</em>]}
          />
          <p data-hero-fade className="mt-7 max-w-xl text-[clamp(1rem,1.3vw,1.15rem)] leading-relaxed text-ivory/70">
            Step inside a cave of underrated treasures — perfumes that rival the great houses, mapped note by note and rated independently out of 100.
          </p>

          <form
            data-hero-fade
            role="search"
            onSubmit={(e) => { e.preventDefault(); open(q); }}
            className="mt-9 flex max-w-xl items-center gap-2 rounded-full border border-champagne-500/40 bg-ivory/[0.06] p-2 pl-5 backdrop-blur-md transition-colors focus-within:border-champagne-400"
          >
            <label htmlFor="hero-search" className="sr-only">Search a perfume, house or ingredient</label>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="shrink-0 text-champagne-400" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
            <input
              id="hero-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search a perfume, house or ingredient"
              className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ivory outline-none placeholder:text-ivory/45"
              autoComplete="off"
            />
            <button type="submit" className="btn-gold !py-3">Search</button>
          </form>
          <div data-hero-fade className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ivory/55">
            <span>Try</span>
            {SUGGESTIONS.map((s) => (
              <Link key={s} href={`/perfumes?note=${s}`} className="rounded-full border border-ivory/15 px-3 py-1 capitalize transition-colors hover:border-champagne-400 hover:text-ivory">{s}</Link>
            ))}
          </div>
          <div data-hero-fade className="mt-10 flex flex-wrap gap-3">
            <Magnetic><Link href="#discover" className="btn-ghost text-ivory hover:bg-ivory hover:text-cave">Enter the cave ↓</Link></Magnetic>
            <Magnetic><Link href="/collections/hidden-gems" className="btn text-champagne-300 hover:text-ivory">Hidden gems →</Link></Magnetic>
          </div>
        </div>

        <div data-hero-bottle className="relative order-1 h-[46svh] lg:order-2 lg:h-[78svh]">
          <Bottle3D bottle={featured.bottle} seed={`${featured.house}|${featured.name}`} label={`${featured.name} by ${featured.house}, shown as an interactive 3D bottle`} className="h-full w-full" />
          <Link href={`/perfumes/${featured.slug}`} className="group absolute bottom-2 left-1/2 hidden -translate-x-1/2 items-center gap-3 rounded-full border border-ivory/15 bg-cave-900/40 px-4 py-2 text-sm backdrop-blur-md md:flex">
            <span className="text-champagne-400">◆</span>
            <span className="text-ivory/60">Featured treasure</span>
            <span className="font-serif text-base">{featured.name}</span>
            {featured.scentLens && <span className="text-champagne-300">{featured.scentLens.score.toFixed(1)}</span>}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

      {/* ingredient marquee */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 overflow-hidden border-t border-champagne-500/15 py-3">
        <div className="flex w-max animate-[marquee_60s_linear_infinite] gap-10 whitespace-nowrap font-serif text-lg italic text-ivory/35">
          {[...notes, ...notes].map((n, i) => <span key={i} className="capitalize">{n} <span className="not-italic text-champagne-500/60">✦</span></span>)}
        </div>
      </div>
      <style>{`@keyframes marquee{to{transform:translateX(-50%)}}`}</style>
    </section>
  );
}
