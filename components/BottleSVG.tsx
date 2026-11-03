"use client";

import type { Bottle } from "@/lib/types";
import { useId, type ReactElement } from "react";

const SHAPES: Record<string, number> = { rect: 0, round: 1, faceted: 2, square: 3, tapered: 4, rounded_rect: 5 };
const CAPS: Record<string, [string, string, string]> = {
  gold: ["#8a6a33", "#f1d89a", "#6b4f22"],
  silver: ["#6f757c", "#f4f6f8", "#5f656b"],
  black: ["#0d0d0d", "#4b4b4b", "#090909"],
  white: ["#cfcac1", "#ffffff", "#c2bcb2"],
  wood: ["#4f321d", "#a8744a", "#3f2816"],
  crystal: ["#e9eef2", "#ffffff", "#d5dde3"],
};

function hx(c: string) {
  let s = (c || "#888").replace("#", "");
  if (s.length === 3) s = s.split("").map((x) => x + x).join("");
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function mix(c: string, t: string, a: number) {
  const A = hx(c), B = hx(t);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * a).toString(16).padStart(2, "0")).join("");
}
export const lum = (c: string) => { const [r, g, b] = hx(c); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

function hash(s: string) {
  let h = 2166136261;
  for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Lightweight, deterministic SVG bottle coloured from the researched bottle data. */
export default function BottleSVG({ bottle, seed, label, className, animate = true }: {
  bottle: Bottle; seed: string; label?: string; className?: string; animate?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const h = hash(seed);
  const shape = SHAPES[bottle.shape] ?? h % 6;
  const cap = (h >>> 3) % 4;
  const fill = 0.5 + ((h >>> 6) % 35) / 100;
  let body: ReactElement, neckY: number;
  switch (shape) {
    case 0: body = <rect x="44" y="106" width="112" height="174" rx="12" />; neckY = 106; break;
    case 1: body = <path d="M100 105c55 0 75 45 75 95s-25 82-75 82-75-32-75-82 20-95 75-95z" />; neckY = 108; break;
    case 2: body = <path d="M60 110h80l25 40v120l-25 12H60l-25-12V150z" />; neckY = 110; break;
    case 3: body = <rect x="30" y="128" width="140" height="152" rx="6" />; neckY = 128; break;
    case 4: body = <path d="M70 108h60l35 172H35z" strokeLinejoin="round" />; neckY = 108; break;
    default: body = <path d="M55 110h90c10 0 18 8 18 18v130c0 14-12 24-26 24H63c-14 0-26-10-26-24V128c0-10 8-18 18-18z" />; neckY = 110;
  }
  const opaque = bottle.opaque;
  const glass = bottle.glass || "#eef0ee";
  const liq = bottle.liquid || glass;
  const clearish = !opaque && lum(glass) > 0.82;
  const capCols = CAPS[bottle.capStyle] ?? [mix(bottle.cap, "#000", 0.35), mix(bottle.cap, "#fff", 0.35), mix(bottle.cap, "#000", 0.5)];
  const capW = [56, 44, 70, 36][cap], capH = [48, 62, 38, 70][cap], capR = [6, 22, 4, 18][cap];
  const level = 280 - (280 - neckY) * fill;
  const wave = `M-200 ${level} q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 V300 H-200z`;
  const dur = 7 + (h % 5);
  const midY = (neckY + 280) / 2;
  const txt = bottle.accent ? (lum(bottle.accent) > 0.6 ? "#2b2420" : "#fff") : opaque && lum(glass) > 0.6 ? "#2b2420" : "#fff";

  return (
    <svg viewBox="0 0 200 300" className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <clipPath id={`c${uid}`}>{body}</clipPath>
        <linearGradient id={`l${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={liq} stopOpacity=".95" /><stop offset="1" stopColor={mix(liq, "#000", 0.28)} /></linearGradient>
        <linearGradient id={`o${uid}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={mix(glass, "#fff", 0.18)} /><stop offset=".55" stopColor={glass} /><stop offset="1" stopColor={mix(glass, "#000", 0.35)} /></linearGradient>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity=".24" /><stop offset=".35" stopColor="#fff" stopOpacity=".04" /><stop offset=".8" stopColor="#fff" stopOpacity=".1" /><stop offset="1" stopColor="#fff" stopOpacity=".26" /></linearGradient>
        <linearGradient id={`k${uid}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={capCols[0]} /><stop offset=".45" stopColor={capCols[1]} /><stop offset="1" stopColor={capCols[2]} /></linearGradient>
      </defs>
      <ellipse cx="100" cy="290" rx="78" ry="7" fill="#000" opacity=".35" />
      <g clipPath={`url(#c${uid})`}>
        {opaque ? (
          <>
            <rect width="200" height="300" fill={`url(#o${uid})`} />
            {animate && (
              <rect x="-80" y="0" width="60" height="300" fill="#fff" opacity=".2" transform="skewX(-18)">
                <animate attributeName="x" values="-120;260;260" keyTimes="0;.45;1" dur={`${dur}s`} repeatCount="indefinite" />
              </rect>
            )}
          </>
        ) : (
          <>
            <rect width="200" height="300" fill={glass} opacity={clearish ? 0.18 : 0.45} />
            <path d={wave} fill={`url(#l${uid})`} opacity={clearish ? 1 : 0.92}>
              {animate && <animateTransform attributeName="transform" type="translate" from="0 0" to="100 0" dur={`${dur}s`} repeatCount="indefinite" />}
            </path>
          </>
        )}
        <rect width="200" height="300" fill={`url(#g${uid})`} />
        <rect x="48" y={neckY + 14} width="10" height={(280 - neckY) * 0.6} rx="5" fill="#fff" opacity={opaque ? 0.12 : 0.2} />
      </g>
      <g fill="none" stroke={opaque ? mix(glass, "#fff", 0.3) : "#fff"} strokeOpacity={opaque ? 0.5 : 0.4} strokeWidth="2">{body}</g>
      <rect x={100 - capW / 2} y={neckY - 14 - capH} width={capW} height={capH} rx={capR} fill={`url(#k${uid})`} />
      <rect x="86" y={neckY - 16} width="28" height="18" rx="3" fill={opaque ? mix(glass, "#000", 0.4) : "#2a221c"} />
      {bottle.accent && <rect x="70" y={midY - 12} width="60" height="22" rx="3" fill={bottle.accent} opacity=".9" />}
      <text x="100" y={midY + 4} textAnchor="middle" fontFamily="Fraunces Variable, Georgia, serif" fontSize="12" letterSpacing="2" fill={txt} fillOpacity=".8">
        {seed.split("|")[1]?.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 3).map((w) => w[0]).join("").toUpperCase()}
      </text>
    </svg>
  );
}
