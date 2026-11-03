import type { ScentLens, SourceRating } from "./types";

/** Sources with fewer reviews than this are ignored (prevents one 5★ review dominating). */
export const MIN_REVIEWS = 3;
/** Points subtracted from the averaged rating. */
export const SCENTLENS_PENALTY = 7;

/**
 * ScentLens Rating = MAX(0, average of normalised (0–100) source ratings − 7),
 * rounded to 1 decimal place and clamped to 0–100.
 *
 * It is recomputed from the stored source ratings every time the data is loaded,
 * so updating a source rating automatically updates the score.
 * Returns null when no source qualifies — we never invent a rating.
 */
export function computeScentLens(ratings: SourceRating[]): ScentLens | null {
  const usable = ratings.filter(
    (r) => Number(r.value) > 0 && Number(r.scale) > 0 && (Number(r.count) || 0) >= MIN_REVIEWS,
  );
  if (!usable.length) return null;
  const sources = usable.map((r) => ({
    ...r,
    normalised: round1(Math.min(100, (Number(r.value) / Number(r.scale)) * 100)),
  }));
  const average = sources.reduce((a, s) => a + Math.min(100, (s.value / s.scale) * 100), 0) / sources.length;
  const score = round1(Math.min(100, Math.max(0, average - SCENTLENS_PENALTY)));
  return {
    score,
    average: round1(average),
    sources,
    totalReviews: sources.reduce((a, s) => a + (Number(s.count) || 0), 0),
  };
}

export function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function scoreLabel(score: number) {
  if (score >= 85) return "Exceptional";
  if (score >= 78) return "Excellent";
  if (score >= 70) return "Very good";
  if (score >= 60) return "Good";
  return "Mixed";
}
