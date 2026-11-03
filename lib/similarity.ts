import type { Perfume } from "./types";
import { perfumes } from "./data";

/** Tokenise notes so "bourbon vanilla" and "vanilla" overlap. */
function tokens(p: Perfume) {
  const t = new Set<string>();
  for (const n of p.allNotes) {
    t.add(n);
    for (const w of n.split(/[\s-]+/)) if (w.length > 3) t.add(w);
  }
  return t;
}

const cache = new Map<string, Set<string>>();
const tok = (p: Perfume) => {
  let s = cache.get(p.slug);
  if (!s) { s = tokens(p); cache.set(p.slug, s); }
  return s;
};

/** 0–1 similarity: Jaccard overlap of notes (70%) + same family (20%) + compatible gender (10%). */
export function similarity(a: Perfume, b: Perfume) {
  const A = tok(a), B = tok(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const jacc = inter / (A.size + B.size - inter || 1);
  const fam = a.family === b.family ? 1 : 0;
  const gen = a.gender === b.gender || a.gender === "U" || b.gender === "U" ? 1 : 0;
  return jacc * 0.7 + fam * 0.2 + gen * 0.1;
}

export function similarTo(p: Perfume, n = 6, pool: Perfume[] = perfumes) {
  return pool
    .filter((q) => q.slug !== p.slug)
    .map((q) => ({ p: q, s: similarity(p, q) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n);
}

export function sharedNotes(a: Perfume, b: Perfume) {
  const B = new Set(b.allNotes);
  return Array.from(new Set(a.allNotes.filter((n) => B.has(n))));
}

/** Rank perfumes against a taste profile: liked notes/families add, disliked notes subtract. */
export function recommend(profile: { families: string[]; liked: string[]; disliked: string[] }, n = 8) {
  const like = profile.liked.map((x) => x.toLowerCase());
  const dis = profile.disliked.map((x) => x.toLowerCase());
  return perfumes
    .map((p) => {
      let s = 0;
      if (profile.families.includes(p.family)) s += 2;
      for (const l of like) if (p.allNotes.some((n) => n.includes(l))) s += 1.5;
      for (const d of dis) if (p.allNotes.some((n) => n.includes(d))) s -= 3;
      if (p.scentLens) s += (p.scentLens.score - 70) / 20;
      return { p, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.p);
}
