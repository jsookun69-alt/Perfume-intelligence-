// Catalogue of affordable, lesser-known perfumes that compete with luxury scents.
// The data lives in src/data/finds.json and is refreshed by the scheduled research agent.
// Luxury names appear only as the scent a find competes with — never as listings.
import data from "../data/finds.json";

const norm = (s) =>
  String(s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

const STATUS_ORDER = { shortlist: 0, new: 1, lead: 2 };

export const updatedAt = data.updatedAt;

export const finds = data.finds
  .filter((f) => f.status !== "rejected" && f.awareness !== "high")
  .map((f) => ({
    ...f,
    rivals: f.rivals || [],
    tags: f.tags || [],
    sources: f.sources || [],
    notes: f.notes || { top: [], heart: [], base: [] },
  }))
  .sort(
    (a, b) =>
      (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3) ||
      String(b.foundAt).localeCompare(String(a.foundAt))
  );

function allNotes(g) {
  return [...g.notes.top, ...g.notes.heart, ...g.notes.base];
}

// Scores: rival match 100/80, name 90/70, house 60, note or tag 40.
export function searchGems(query) {
  const q = norm(query);
  if (!q) return finds;
  return finds
    .map((g) => {
      let score = 0;
      for (const r of g.rivals) {
        const nr = norm(r);
        if (nr === q) score = Math.max(score, 100);
        else if (nr.includes(q) || q.includes(nr)) score = Math.max(score, 80);
      }
      const nn = norm(g.name);
      if (nn === q) score = Math.max(score, 90);
      else if (nn.includes(q) || norm(g.house + g.name).includes(q)) score = Math.max(score, 70);
      if (norm(g.house).includes(q)) score = Math.max(score, 60);
      if ([...allNotes(g), ...g.tags].some((n) => norm(n).includes(q))) score = Math.max(score, 40);
      return { g, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.g);
}

// Jaccard over tags + notes, with a strong bonus for competing with the same scent.
export function similarGems(id, limit = 4) {
  const t = finds.find((f) => f.id === id);
  if (!t) return [];
  const set = (g) => new Set([...g.tags, ...allNotes(g)].map(norm));
  const ts = set(t);
  const tr = new Set(t.rivals.map(norm));
  return finds
    .filter((g) => g.id !== id)
    .map((g) => {
      const gs = set(g);
      const inter = [...gs].filter((x) => ts.has(x)).length;
      const union = new Set([...gs, ...ts]).size || 1;
      const sameRival = g.rivals.some((r) => tr.has(norm(r)));
      return { gem: g, score: Math.min(1, (inter / union) * 0.6 + (sameRival ? 0.4 : 0)) };
    })
    .filter((x) => x.score > 0.12)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function allTags(max = 10) {
  const counts = new Map();
  for (const g of finds) for (const t of g.tags) counts.set(t, (counts.get(t) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, max).map(([t]) => t);
}
