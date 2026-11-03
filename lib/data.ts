import raw from "@/data/perfumes.json";
import type { Family, Perfume, PerfumeRecord } from "./types";
import { computeScentLens } from "./scentlens";
import { deriveOccasions, deriveSeasons, deriveVersatility, isHiddenGem } from "./derive";

export const DATA_META = raw.meta as { generated: string; note: string; count: number };

const records = raw.perfumes as unknown as PerfumeRecord[];

export const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").trim();

function enrich(p: PerfumeRecord): Perfume {
  const allNotes = [...p.notes.top, ...p.notes.heart, ...p.notes.base].map(norm);
  const scentLens = computeScentLens(p.ratings ?? []);
  const seasons = deriveSeasons(p, allNotes);
  const occasions = deriveOccasions(p, allNotes);
  return {
    ...p,
    allNotes,
    scentLens,
    seasons,
    occasions,
    versatility: deriveVersatility(seasons, occasions),
    isHiddenGem: isHiddenGem(scentLens?.score ?? null, scentLens?.totalReviews ?? 0, p.priceGbp),
  };
}

export const perfumes: Perfume[] = records.map(enrich);

const bySlug = new Map(perfumes.map((p) => [p.slug, p]));
export const getPerfume = (slug: string) => bySlug.get(slug);

export const houses = Array.from(new Set(perfumes.map((p) => p.house))).sort((a, b) => a.localeCompare(b));

export const FAMILIES: Family[] = ["Fresh", "Aquatic", "Citrus", "Aromatic", "Woody", "Amber", "Gourmand", "Floral", "Fruity", "Leather", "Oud", "Musky"];

export const familiesInUse = FAMILIES.filter((f) => perfumes.some((p) => p.family === f));

export const noteIndex: { note: string; count: number }[] = (() => {
  const m = new Map<string, number>();
  for (const p of perfumes) for (const n of new Set(p.allNotes)) m.set(n, (m.get(n) ?? 0) + 1);
  return Array.from(m, ([note, count]) => ({ note, count })).sort((a, b) => b.count - a.count);
})();

export const GENDER_LABEL = { M: "Masculine", W: "Feminine", U: "Unisex" } as const;

export const priceRange = {
  min: Math.min(...perfumes.map((p) => p.priceGbp)),
  max: Math.max(...perfumes.map((p) => p.priceGbp)),
};

export const ratedCount = perfumes.filter((p) => p.scentLens).length;
