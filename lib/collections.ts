import type { Perfume } from "./types";
import { perfumes } from "./data";

export interface Collection {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  /** How the collection is chosen — shown to visitors for transparency. */
  rule: string;
  tone: "emerald" | "ivory" | "champagne" | "clay";
  filter: (p: Perfume) => boolean;
  sort?: (a: Perfume, b: Perfume) => number;
}

const byScore = (a: Perfume, b: Perfume) => (b.scentLens?.score ?? -1) - (a.scentLens?.score ?? -1);
const hasNote = (p: Perfume, ...k: string[]) => p.allNotes.some((n) => k.some((x) => n.includes(x)));

export const COLLECTIONS: Collection[] = [
  {
    slug: "hidden-gems",
    title: "Hidden Gems",
    kicker: "Underrated",
    description: "Loved by the people who've worn them, barely known by everyone else.",
    rule: "ScentLens 80+ with under 400 published reviews, or 80+ for £30 or less.",
    tone: "emerald",
    filter: (p) => p.isHiddenGem,
    sort: byScore,
  },
  {
    slug: "most-reviewed",
    title: "The Most Reviewed",
    kicker: "Crowd favourites",
    description: "The perfumes with the largest number of published reviews across our sources.",
    rule: "Ranked by total review count across all ScentLens sources.",
    tone: "champagne",
    filter: (p) => !!p.scentLens,
    sort: (a, b) => (b.scentLens?.totalReviews ?? 0) - (a.scentLens?.totalReviews ?? 0),
  },
  {
    slug: "winter-nights",
    title: "Winter Nights",
    kicker: "Season",
    description: "Ambers, ouds and gourmands built for cold air and long evenings.",
    rule: "Amber, gourmand, oud or leather family with long or very long longevity.",
    tone: "clay",
    filter: (p) => ["Amber", "Gourmand", "Oud", "Leather"].includes(p.family) && p.longevity !== "Moderate",
    sort: byScore,
  },
  {
    slug: "summer-light",
    title: "Summer Light",
    kicker: "Season",
    description: "Citrus, sea air and green freshness for hot days.",
    rule: "Suggested for Summer by our note analysis.",
    tone: "ivory",
    filter: (p) => p.seasons.includes("Summer"),
    sort: byScore,
  },
  {
    slug: "office-safe",
    title: "Office Safe",
    kicker: "Occasion",
    description: "Clean, polished and easy to wear around other people.",
    rule: "Suggested for Office by our note analysis.",
    tone: "ivory",
    filter: (p) => p.occasions.includes("Office"),
    sort: byScore,
  },
  {
    slug: "date-night",
    title: "Date Night",
    kicker: "Occasion",
    description: "Warm skin scents — vanilla, rose, tonka and amber.",
    rule: "Contains a warm base (vanilla, tonka, praline or amber) and a skin-close floral or musk.",
    tone: "clay",
    filter: (p) => hasNote(p, "vanilla", "tonka", "praline", "amber") && hasNote(p, "rose", "jasmine", "orchid", "musk", "iris"),
    sort: byScore,
  },
  {
    slug: "the-vanilla-vault",
    title: "The Vanilla Vault",
    kicker: "Ingredient",
    description: "Every perfume with vanilla in its pyramid, from bourbon to Madagascar.",
    rule: "Contains a vanilla note.",
    tone: "champagne",
    filter: (p) => hasNote(p, "vanilla"),
    sort: byScore,
  },
  {
    slug: "oud-and-smoke",
    title: "Oud & Smoke",
    kicker: "Style",
    description: "Agarwood, incense and resin — the heart of Arabian perfumery.",
    rule: "Contains oud/agarwood or incense.",
    tone: "emerald",
    filter: (p) => hasNote(p, "oud", "agarwood", "incense", "frankincense"),
    sort: byScore,
  },
  {
    slug: "under-25",
    title: "Under £25",
    kicker: "Value",
    description: "Proof that a great perfume doesn't need a great price.",
    rule: "Approximate UK price of £25 or less.",
    tone: "ivory",
    filter: (p) => p.priceGbp <= 25,
    sort: byScore,
  },
];

export function collectionItems(c: Collection) {
  const items = perfumes.filter(c.filter);
  return c.sort ? items.sort(c.sort) : items;
}

export const getCollection = (slug: string) => COLLECTIONS.find((c) => c.slug === slug);
