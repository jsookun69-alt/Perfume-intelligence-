// Turns the research agent's findings (from the "Perfume Intelligence — Research Finds"
// artifact database) into src/data/finds.json, which the site reads at build time.
//
//   node scripts/export-finds.mjs <raw.json>
//
// <raw.json> is either an array of documents or JSON lines, each shaped like
// { "id": "...", "data": { ...find fields... } } (the db_list output) or a bare find object with an "id".
//
// Rules enforced here, whatever the database says:
//   - rejected finds, brand-only leads, and anything marked awareness "high" are dropped
//   - mainstream budget houses and luxury houses are never listed (luxury names may only appear as "rivals")
//   - every listed find needs at least one http(s) source

import { readFileSync, writeFileSync } from "node:fs";

const EXCLUDED_HOUSES = [
  // mainstream budget / dupe houses
  "lattafa", "armaf", "zara", "maison alhambra", "dossier", "alt fragrances", "oakcha",
  // luxury, designer and expensive niche houses
  "chanel", "dior", "creed", "tom ford", "maison francis kurkdjian", "mfk", "parfums de marly",
  "xerjoff", "kilian", "by kilian", "amouage", "roja", "clive christian", "initio", "louis vuitton",
  "hermes", "guerlain", "yves saint laurent", "ysl", "giorgio armani", "armani", "prada", "gucci",
  "versace", "paco rabanne", "rabanne", "jean paul gaultier", "carolina herrera", "valentino",
  "bvlgari", "bulgari", "ex nihilo", "le labo", "byredo", "diptyque", "jo malone", "montale",
  "mancera", "nishane", "frederic malle", "maison margiela", "penhaligon's", "penhaligons",
];

const norm = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").trim();
const isExcluded = (house) => {
  const h = norm(house);
  return EXCLUDED_HOUSES.some((x) => h === x || h.startsWith(x + " ") || h.startsWith(x + " ("));
};
const isUrl = (u) => { try { return /^https?:$/.test(new URL(u).protocol); } catch { return false; } };
const list = (s) => String(s || "").split(/,|·|\//).map((x) => x.trim()).filter(Boolean);
const titleCase = (s) => s.replace(/\b([a-z])/g, (m) => m.toUpperCase());

function parseInput(text) {
  const t = text.trim();
  if (t.startsWith("[")) return JSON.parse(t);
  return t.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("{")).map((l) => JSON.parse(l));
}

// "Khadlaj (UAE)" -> { house: "Khadlaj", country: "UAE" }
function splitHouse(house, country) {
  const m = String(house || "").match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  if (!m) return { house: String(house || "").trim(), country: country || "" };
  const inner = m[2].split(",").map((x) => x.trim());
  return { house: m[1].trim(), country: country || inner[inner.length - 1] || "" };
}

function toRivals(r) {
  if (Array.isArray(r)) return r.map((x) => String(x).trim()).filter(Boolean);
  const s = String(r || "").replace(/\(.*?\)/g, "").trim();
  if (!s || /^(unconfirmed|not yet|none)/i.test(s)) return [];
  return s.split(/\s+\/\s+|\s+·\s+|;\s*/).map((x) => x.trim()).filter(Boolean);
}

// Accepts {top,heart,base} or a profile string like "Pear, bergamot → jasmine → musk, amber".
function toNotes(notes, profile) {
  if (notes && typeof notes === "object" && !Array.isArray(notes)) {
    return { top: notes.top || [], heart: notes.heart || [], base: notes.base || [] };
  }
  const p = String(profile || "").replace(/\(.*?\)/g, "").replace(/\.$/, "");
  const tiers = p.split(/→|->/).map((t) => list(t).map(titleCase));
  if (tiers.length >= 3) return { top: tiers[0], heart: tiers[1], base: tiers.slice(2).flat() };
  if (tiers.length === 2) return { top: tiers[0], heart: [], base: tiers[1] };
  return { top: [], heart: [], base: [] };
}

const [, , inPath] = process.argv;
if (!inPath) { console.error("usage: node scripts/export-finds.mjs <raw.json>"); process.exit(1); }

const docs = parseInput(readFileSync(inPath, "utf8"));
const out = [];
const skipped = [];
for (const d of docs) {
  const id = d.id;
  const f = d.data || d;
  const { house, country } = splitHouse(f.house, f.country);
  const sources = (f.sources || []).filter((s) => s && isUrl(s.url)).map((s) => ({ title: String(s.title || s.url), url: s.url }));
  const why =
    !id ? "no id" :
    f.status === "rejected" ? "rejected" :
    id.startsWith("brand-") ? "brand-only lead" :
    f.awareness === "high" ? "too well known" :
    isExcluded(house) ? "excluded house" :
    !sources.length ? "no sources" : null;
  if (why) { skipped.push(`${id}: ${why}`); continue; }
  out.push({
    id,
    name: String(f.name || "").trim(),
    house,
    country,
    concentration: f.concentration || "",
    rivals: toRivals(f.rivals),
    notes: toNotes(f.notes, f.profile),
    summary: f.summary || "",
    caveats: f.caveats || "",
    priceText: f.priceText || "Price to check",
    priceGBP: typeof f.priceGBP === "number" ? f.priceGBP : null,
    longevity: f.longevity || "Being researched",
    awareness: f.awareness || "low",
    status: f.status || "new",
    tags: (f.tags || []).map((t) => String(t).toLowerCase()).slice(0, 8),
    sources,
    foundAt: f.foundAt || null,
  });
}

out.sort((a, b) => String(b.foundAt).localeCompare(String(a.foundAt)));
writeFileSync(new URL("../src/data/finds.json", import.meta.url), JSON.stringify({ updatedAt: new Date().toISOString(), finds: out }, null, 1) + "\n");
console.log(`finds.json: ${out.length} listed, ${skipped.length} skipped`);
for (const s of skipped) console.log("  skipped " + s);
