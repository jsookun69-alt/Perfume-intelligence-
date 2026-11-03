export type Gender = "M" | "W" | "U";
export type Family =
  | "Fresh" | "Aquatic" | "Citrus" | "Aromatic" | "Woody" | "Amber"
  | "Gourmand" | "Floral" | "Fruity" | "Leather" | "Oud" | "Musky";
export type Longevity = "Moderate" | "Long" | "Very long";
export type BottleShape = "rect" | "round" | "faceted" | "square" | "tapered" | "rounded_rect";
export type CapStyle = "gold" | "silver" | "black" | "white" | "wood" | "coloured" | "crystal";

export interface SourceRating {
  source: string;
  value: number;
  scale: number;
  count: number;
  url?: string | null;
  seenIn?: string | null;
}

export interface NoteSource {
  label: string;
  url: string;
}

export interface Bottle {
  glass: string;
  opaque: boolean;
  liquid: string;
  cap: string;
  capStyle: CapStyle | string;
  shape: BottleShape | string;
  accent?: string | null;
  /** how the colours were determined: photo | description | guess */
  basis: string;
}

export interface PerfumeRecord {
  slug: string;
  name: string;
  house: string;
  gender: Gender;
  priceGbp: number;
  family: Family;
  notes: { top: string[]; heart: string[]; base: string[] };
  flatNotes: boolean;
  longevity: Longevity;
  notesBasis: "official" | "consensus" | "single";
  noteSources: NoteSource[];
  ratings: SourceRating[];
  bottle: Bottle;
}

export type Season = "Spring" | "Summer" | "Autumn" | "Winter";
export type Occasion = "Daytime" | "Office" | "Evening" | "Date night" | "Special occasion";

export interface ScentLens {
  score: number;
  average: number;
  sources: (SourceRating & { normalised: number })[];
  totalReviews: number;
}

export interface Perfume extends PerfumeRecord {
  allNotes: string[];
  scentLens: ScentLens | null;
  seasons: Season[];
  occasions: Occasion[];
  versatility: number; // 1–5, derived from seasons × occasions
  isHiddenGem: boolean;
}
