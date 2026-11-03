"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fades and lifts children into view as they enter the viewport. Children with [data-reveal] stagger. */
export function Reveal({ children, className, as: Tag = "div", y = 40, stagger = 0.08, delay = 0 }: {
  children: ReactNode; className?: string; as?: ElementType; y?: number; stagger?: number; delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const targets = el.querySelectorAll("[data-reveal]");
    const items = targets.length ? Array.from(targets) : [el];
    const ctx = gsap.context(() => {
      gsap.from(items, {
        y, opacity: 0, duration: 1.1, ease: "power3.out", stagger, delay,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [y, stagger, delay]);
  return <Tag ref={ref} className={className}>{children}</Tag>;
}

/** Headline whose lines slide up from a mask. Pass lines as an array. */
export function SplitHeadline({ lines, className, as: Tag = "h2", immediate = false, delay = 0 }: {
  lines: ReactNode[]; className?: string; as?: ElementType; immediate?: boolean; delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const spans = el.querySelectorAll(".reveal-line > span");
    const ctx = gsap.context(() => {
      gsap.from(spans, {
        yPercent: 110, rotate: 2, duration: 1.3, ease: "expo.out", stagger: 0.09, delay,
        ...(immediate ? {} : { scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
      });
    }, el);
    return () => ctx.revert();
  }, [immediate, delay]);
  return (
    <Tag ref={ref} className={className}>
      {lines.map((l, i) => (
        <span key={i} className="reveal-line"><span>{l}</span></span>
      ))}
    </Tag>
  );
}

/** Moves an element at a different speed from the scroll for layered parallax. */
export function Parallax({ children, className, speed = 0.15 }: { children: ReactNode; className?: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { yPercent: -speed * 100 }, {
        yPercent: speed * 100, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, [speed]);
  return <div ref={ref} className={className}>{children}</div>;
}
