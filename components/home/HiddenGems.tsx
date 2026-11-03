"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Perfume } from "@/lib/types";
import PerfumeCard from "@/components/PerfumeCard";
import { HIDDEN_GEM_RULE } from "@/lib/derive";

gsap.registerPlugin(ScrollTrigger);

/** Section 3 — pinned horizontal gallery of hidden gems (desktop); swipeable row on touch. */
export default function HiddenGems({ gems }: { gems: Perfume[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  // useLayoutEffect so the pin is undone before React removes this DOM on navigation
  useLayoutEffect(() => {
    const s = section.current, t = track.current;
    if (!s || !t) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const dist = () => t.scrollWidth - window.innerWidth + 80;
      gsap.to(t, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: s, start: "top top", end: () => `+=${dist()}`, scrub: 0.8, pin: true, invalidateOnRefresh: true },
      });
    });
    return () => { mm.revert(); ScrollTrigger.refresh(); };
  }, []);

  return (
    <div>
    <section ref={section} className="cave-bg relative overflow-hidden py-24 text-ivory lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0" aria-labelledby="gems-h">
      <div className="mx-auto mb-10 flex w-full max-w-page flex-wrap items-end justify-between gap-6 px-5 md:px-10">
        <div>
          <p className="eyebrow text-champagne-400">03 — Hidden gems</p>
          <h2 id="gems-h" className="h-section mt-4">The <em className="gold-text italic">underrated</em> few.</h2>
        </div>
        <div className="max-w-sm text-sm text-ivory/60">
          <p>{HIDDEN_GEM_RULE}</p>
          <Link href="/collections/hidden-gems" className="link-underline mt-3 inline-block text-champagne-300">All {gems.length} hidden gems →</Link>
        </div>
      </div>
      <div className="no-scrollbar overflow-x-auto lg:overflow-visible">
        <div ref={track} className="flex w-max gap-4 px-5 pb-4 md:px-10 lg:gap-6">
          {gems.slice(0, 10).map((p, i) => (
            <div key={p.slug} className="w-[72vw] shrink-0 sm:w-[300px] lg:w-[320px]">
              <PerfumeCard perfume={p} index={i} />
            </div>
          ))}
          <Link href="/collections/hidden-gems" className="arch flex w-[60vw] shrink-0 flex-col items-center justify-center border border-champagne-500/40 p-8 text-center sm:w-[280px]">
            <span className="font-serif text-4xl text-champagne-300">+{Math.max(0, gems.length - 10)}</span>
            <span className="mt-2 text-sm text-ivory/60">more treasures</span>
          </Link>
        </div>
      </div>
    </section>
    </div>
  );
}
