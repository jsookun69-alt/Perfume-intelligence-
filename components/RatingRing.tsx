"use client";

import { useEffect, useRef, useState } from "react";

/** Animated circular ScentLens score. Shows an em dash when a perfume isn't rated. */
export default function RatingRing({ score, size = 88, stroke = 7, dark = false, label = true }: {
  score: number | null; size?: number; stroke?: number; dark?: boolean; label?: boolean;
}) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const ref = useRef<SVGSVGElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const offset = score == null ? C : C * (1 - (shown ? score : 0) / 100);
  const gid = `rg-${size}-${dark ? "d" : "l"}`;
  return (
    <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={score == null ? "ScentLens: not yet rated" : `ScentLens Rating ${score.toFixed(1)} out of 100`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={dark ? "#ecd9b4" : "#1a4535"} />
          <stop offset="1" stopColor="#b8925a" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? "rgba(246,240,228,.14)" : "rgba(12,35,27,.1)"} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(.2,.8,.2,1)" }} />
      {label && (
        <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle" fontFamily="Fraunces Variable, Georgia, serif"
          fontSize={size * (score == null ? 0.26 : 0.24)} fill={dark ? "#f6f0e4" : "#0c231b"}>
          {score == null ? "—" : score.toFixed(1)}
        </text>
      )}
    </svg>
  );
}
