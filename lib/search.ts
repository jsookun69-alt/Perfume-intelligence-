import type { Perfume } from "./types";
import { houses, noteIndex, norm, perfumes } from "./data";

export type SearchHit =
  | { kind: "perfume"; perfume: Perfume; score: number }
  | { kind: "house"; house: string; count: number; score: number }
  | { kind: "note"; note: string; count: number; score: number };

function match(hay: string, q: string) {
  if (!q) return 0;
  if (hay === q) return 100;
  if (hay.startsWith(q)) return 80;
  if (hay.split(/[\s'’-]+/).some((w) => w.startsWith(q))) return 60;
  if (hay.includes(q)) return 40;
  // loose subsequence match for typos like "khmrah"
  let i = 0;
  for (const c of hay) if (c === q[i]) i++;
  return i === q.length && q.length > 3 ? 15 : 0;
}

/** Intelligent search across perfume names, houses and notes. */
export function search(query: string, limit = 12): SearchHit[] {
  const q = norm(query);
  if (!q) return [];
  const hits: SearchHit[] = [];
  for (const p of perfumes) {
    const s = Math.max(match(norm(p.name), q) + 5, match(norm(`${p.house} ${p.name}`), q), match(norm(p.house), q) * 0.6, p.allNotes.some((n) => n.includes(q)) ? 25 : 0);
    if (s > 0) hits.push({ kind: "perfume", perfume: p, score: s + (p.scentLens ? p.scentLens.score / 50 : 0) });
  }
  for (const h of houses) {
    const s = match(norm(h), q);
    if (s > 0) hits.push({ kind: "house", house: h, count: perfumes.filter((p) => p.house === h).length, score: s + 10 });
  }
  for (const n of noteIndex) {
    const s = match(n.note, q);
    if (s > 0) hits.push({ kind: "note", note: n.note, count: n.count, score: s + Math.min(n.count, 20) / 4 });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
