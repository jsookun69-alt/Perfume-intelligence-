import type { Family, Occasion, PerfumeRecord, Season } from "./types";

/*
 * Seasons and occasions are NOT published data. They are suggestions derived from
 * each perfume's scent family and notes using the simple, transparent rules below,
 * and are labelled as such in the UI.
 */

const WARM_NOTES = ["vanilla", "tobacco", "oud", "agarwood", "amber", "benzoin", "labdanum", "praline", "cinnamon", "leather", "myrrh", "incense", "tonka", "honey", "caramel", "saffron", "cacao", "chocolate", "coffee", "rum", "cognac", "date"];
const COOL_NOTES = ["citrus", "lemon", "bergamot", "grapefruit", "mandarin", "orange", "lime", "marine", "sea", "aquatic", "water", "mint", "green", "tea", "neroli", "ginger", "cucumber", "melon", "pineapple", "apple", "verbena"];

const FAMILY_SEASONS: Record<Family, Season[]> = {
  Fresh: ["Spring", "Summer"],
  Aquatic: ["Spring", "Summer"],
  Citrus: ["Spring", "Summer"],
  Aromatic: ["Spring", "Summer", "Autumn"],
  Woody: ["Autumn", "Winter", "Spring"],
  Amber: ["Autumn", "Winter"],
  Gourmand: ["Autumn", "Winter"],
  Floral: ["Spring", "Summer"],
  Fruity: ["Spring", "Summer"],
  Leather: ["Autumn", "Winter"],
  Oud: ["Autumn", "Winter"],
  Musky: ["Spring", "Autumn", "Winter"],
};

const FAMILY_OCCASIONS: Record<Family, Occasion[]> = {
  Fresh: ["Daytime", "Office"],
  Aquatic: ["Daytime", "Office"],
  Citrus: ["Daytime", "Office"],
  Aromatic: ["Daytime", "Office", "Evening"],
  Woody: ["Office", "Evening"],
  Amber: ["Evening", "Date night"],
  Gourmand: ["Evening", "Date night"],
  Floral: ["Daytime", "Date night"],
  Fruity: ["Daytime"],
  Leather: ["Evening", "Special occasion"],
  Oud: ["Evening", "Special occasion"],
  Musky: ["Daytime", "Office"],
};

const has = (notes: string[], list: string[]) => notes.some((n) => list.some((k) => n.includes(k)));

export function deriveSeasons(p: PerfumeRecord, notes: string[]): Season[] {
  const s = new Set<Season>(FAMILY_SEASONS[p.family] ?? ["Spring", "Autumn"]);
  if (has(notes, WARM_NOTES) && has(notes, ["vanilla", "tobacco", "oud", "praline", "leather"])) { s.add("Winter"); s.add("Autumn"); }
  if (has(notes, COOL_NOTES) && !has(notes, ["oud", "tobacco", "leather"])) { s.add("Spring"); }
  const order: Season[] = ["Spring", "Summer", "Autumn", "Winter"];
  return order.filter((x) => s.has(x));
}

export function deriveOccasions(p: PerfumeRecord, notes: string[]): Occasion[] {
  const o = new Set<Occasion>(FAMILY_OCCASIONS[p.family] ?? ["Daytime"]);
  if (p.longevity === "Very long" && has(notes, ["oud", "amber", "saffron", "incense"])) o.add("Special occasion");
  if (has(notes, ["vanilla", "tonka", "praline", "amber"]) && has(notes, ["rose", "jasmine", "orchid", "musk", "iris"])) o.add("Date night");
  const order: Occasion[] = ["Daytime", "Office", "Evening", "Date night", "Special occasion"];
  return order.filter((x) => o.has(x));
}

export function deriveVersatility(seasons: Season[], occasions: Occasion[]) {
  return Math.max(1, Math.min(5, Math.round((seasons.length / 4) * 2.5 + (occasions.length / 5) * 2.5)));
}

/** A hidden gem: strongly rated by real reviewers, yet with a small review footprint or a low price. */
export const HIDDEN_GEM_MIN_REVIEWS = 20;
export const HIDDEN_GEM_RULE =
  "ScentLens 80+ from at least 20 published reviews, with fewer than 400 reviews in total or a price of £30 or less.";

export function isHiddenGem(score: number | null, totalReviews: number, price: number) {
  if (score == null || totalReviews < HIDDEN_GEM_MIN_REVIEWS) return false;
  return score >= 80 && (totalReviews < 400 || price <= 30);
}

export const LONGEVITY_LEVEL: Record<string, number> = { Moderate: 2, Long: 3, "Very long": 4 };
