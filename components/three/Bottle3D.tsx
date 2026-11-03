"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import BottleSVG from "@/components/BottleSVG";
import type { Bottle } from "@/lib/types";
import type { BottleSceneProps } from "./BottleScene";

const BottleScene = dynamic(() => import("./BottleScene"), { ssr: false, loading: () => null });

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGL2RenderingContext && c.getContext("webgl2")) || !!c.getContext("webgl");
  } catch {
    return false;
  }
}

/**
 * Interactive 3D bottle with graceful fallback: the SVG bottle shows instantly,
 * and is replaced by the WebGL scene only when WebGL is supported and motion is allowed.
 * The render loop pauses while the canvas is off-screen.
 */
export default function Bottle3D({ bottle, seed, label, className, hint, ...props }: Omit<BottleSceneProps, "active"> & {
  seed: string; label: string; className?: string; hint?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [use3D, setUse3D] = useState(false);
  const [inView, setInView] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setUse3D(!reduced && webglAvailable());
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "100px" });
    if (ref.current) io.observe(ref.current);
    const t = setTimeout(() => setReady(true), 600);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`} role="img" aria-label={label}>
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${use3D && ready ? "opacity-0" : "opacity-100"}`}>
        <BottleSVG bottle={bottle} seed={seed} className="h-[62%] w-auto animate-floaty drop-shadow-2xl" />
      </div>
      {use3D && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          <BottleScene bottle={bottle} active={inView} {...props} />
        </div>
      )}
      {hint && (
        <p className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] uppercase tracking-[0.18em] text-ivory/50">
          {use3D && ready ? hint : "Illustration"}
        </p>
      )}
    </div>
  );
}
