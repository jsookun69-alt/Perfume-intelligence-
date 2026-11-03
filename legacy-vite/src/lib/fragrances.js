import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY — copy .env.example to .env.local");
}

export const supabase = createClient(url, key, { auth: { persistSession: false } });

// Maps a fragrance_profiles row to the shape the UI components expect.
function toPerfume(row) {
  return {
    id: row.slug,
    name: row.name,
    brand: row.brand,
    year: row.year,
    concentration: row.concentration,
    gender: row.gender,
    family: row.family,
    subfamilies: row.subfamilies,
    notes: row.notes,
    accords: row.accords,
    longevity: Number(row.longevity),
    projection: Number(row.projection),
    priceTier: row.price_tier,
    source: row.source,
  };
}

// Returns [{ id, name, brand, family, score }], best match first.
export async function searchFragrances(query, limit = 6) {
  const { data, error } = await supabase.rpc("search_fragrances", { q: query, max_results: limit });
  if (error) throw error;
  return data.map((r) => ({ id: r.slug, name: r.name, brand: r.brand, family: r.family, score: r.score }));
}

export async function getFragrance(slug) {
  const { data, error } = await supabase.from("fragrance_profiles").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data && toPerfume(data);
}

// Returns [{ perfume: { id, name, brand }, score }] with score in 0..1.
export async function getSimilarFragrances(slug, limit = 4) {
  const { data, error } = await supabase.rpc("similar_fragrances", { fragrance_slug: slug, max_results: limit });
  if (error) throw error;
  return data.map((r) => ({ perfume: { id: r.slug, name: r.name, brand: r.brand }, score: r.score }));
}
