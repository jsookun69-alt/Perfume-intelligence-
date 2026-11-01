import React, { useState, useEffect, useMemo } from "react";
import { Search, X, ExternalLink, Sparkles, ArrowLeft, Clock, PoundSterling, AlertTriangle } from "lucide-react";
import { finds, updatedAt, searchGems, similarGems, allTags } from "./lib/gems.js";

const C = {
  bg: "#0F0D0B",
  card: "#1A1613",
  ink: "#EDE6DA",
  muted: "#9C8F7C",
  faint: "#6B5F52",
  amber: "#C9922B",
  wine: "#6B2737",
  line: "rgba(237,230,218,0.08)",
};

const STATUS_LABEL = { new: "Verified find", shortlist: "Editor's pick", lead: "Under review" };

function Badge({ children, tone = "amber" }) {
  const tones = {
    amber: { background: "rgba(201,146,43,0.12)", color: C.amber, border: "1px solid rgba(201,146,43,0.3)" },
    quiet: { background: "rgba(237,230,218,0.05)", color: C.muted, border: `1px solid ${C.line}` },
    wine: { background: "rgba(107,39,55,0.35)", color: "#E6B7C1", border: "1px solid rgba(107,39,55,0.6)" },
  };
  return (
    <span className="rounded-full px-2.5 py-1 text-[11px]" style={tones[tone]}>
      {children}
    </span>
  );
}

function Pyramid({ notes }) {
  const tiers = [
    { label: "Top", items: notes.top, width: "62%" },
    { label: "Heart", items: notes.heart, width: "80%" },
    { label: "Base", items: notes.base, width: "100%" },
  ].filter((t) => t.items && t.items.length);
  if (!tiers.length) return null;
  return (
    <div className="flex flex-col gap-3">
      {tiers.map((tier) => (
        <div key={tier.label} className="flex items-start gap-4">
          <div className="w-14 shrink-0 pt-1 text-right text-[10px] uppercase tracking-[0.15em]" style={{ color: C.muted }}>
            {tier.label}
          </div>
          <div className="flex-1" style={{ maxWidth: tier.width }}>
            <div className="flex flex-wrap gap-1.5">
              {tier.items.map((n) => (
                <span
                  key={n}
                  className="rounded-full px-2.5 py-1 text-xs"
                  style={{ background: "rgba(201,146,43,0.12)", color: C.amber, border: "1px solid rgba(201,146,43,0.3)" }}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(237,230,218,0.03)", border: `1px solid ${C.line}` }}>
      <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em]" style={{ color: C.muted }}>
        <Icon size={11} style={{ color: C.amber }} /> {label}
      </div>
      <div className="text-sm" style={{ color: C.ink }}>{value}</div>
    </div>
  );
}

function GemCard({ gem, onSelect }) {
  return (
    <button
      onClick={() => onSelect(gem.id)}
      className="w-full rounded-2xl p-5 text-left transition-colors hover:bg-[rgba(237,230,218,0.04)]"
      style={{ background: C.card, border: `1px solid ${C.line}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: C.amber }}>{gem.house}</div>
          <div className="font-serif mt-1 text-xl" style={{ color: C.ink }}>{gem.name}</div>
        </div>
        {gem.awareness === "low" && <Badge>Hidden gem</Badge>}
      </div>
      {gem.rivals.length > 0 && (
        <div className="mt-2 text-xs" style={{ color: C.muted }}>
          Rivals <span style={{ color: C.ink }}>{gem.rivals.join(" · ")}</span>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="quiet">{gem.priceText}</Badge>
        <Badge tone="quiet">⏱ {gem.longevity}</Badge>
        {gem.status === "lead" && <Badge tone="wine">Under review</Badge>}
      </div>
    </button>
  );
}

function GemDetail({ gem, onSelect, onBack }) {
  const similar = useMemo(() => similarGems(gem.id), [gem.id]);
  return (
    <div className="rounded-2xl p-6 sm:p-8" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <button onClick={onBack} className="mb-5 flex items-center gap-1.5 text-xs" style={{ color: C.muted }}>
        <ArrowLeft size={13} /> All finds
      </button>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: C.amber }}>
            {gem.house}{gem.country ? ` · ${gem.country}` : ""}
          </div>
          <h2 className="mt-1 font-serif text-3xl" style={{ color: C.ink }}>{gem.name}</h2>
          <div className="mt-2 text-[11px]" style={{ color: C.muted }}>{gem.concentration}</div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {gem.awareness === "low" && <Badge>Hidden gem</Badge>}
          <Badge tone={gem.status === "lead" ? "wine" : "quiet"}>{STATUS_LABEL[gem.status] || gem.status}</Badge>
        </div>
      </div>

      {gem.rivals.length > 0 && (
        <div className="mt-5 rounded-xl p-4" style={{ background: "linear-gradient(90deg, rgba(107,39,55,0.25), rgba(201,146,43,0.08))", border: "1px solid rgba(201,146,43,0.2)" }}>
          <div className="text-[10px] uppercase tracking-[0.15em]" style={{ color: C.muted }}>Competes with</div>
          <div className="font-serif mt-1 text-lg" style={{ color: C.ink }}>{gem.rivals.join(" · ")}</div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Fact icon={PoundSterling} label="Price" value={gem.priceText} />
        <Fact icon={Clock} label="Longevity" value={gem.longevity} />
      </div>

      <div className="my-6 h-px" style={{ background: C.line }} />
      <Pyramid notes={gem.notes} />

      <div className="mt-6">
        <div className="text-[11px] uppercase tracking-[0.15em]" style={{ color: C.muted }}>Why it made the list</div>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: C.ink }}>{gem.summary}</p>
      </div>

      {gem.caveats && (
        <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(176,71,63,0.08)", border: "1px solid rgba(176,71,63,0.25)" }}>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em]" style={{ color: "#D9837A" }}>
            <AlertTriangle size={12} /> The honest catch
          </div>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: C.ink }}>{gem.caveats}</p>
        </div>
      )}

      {gem.sources.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-[11px] uppercase tracking-[0.15em]" style={{ color: C.muted }}>Sources</div>
          <div className="flex flex-col gap-1.5">
            {gem.sources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs transition-colors hover:bg-[rgba(237,230,218,0.05)]"
                style={{ color: C.ink, border: `1px solid ${C.line}` }}
              >
                <span>{s.title}</span>
                <ExternalLink size={11} style={{ color: C.muted, flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]" style={{ color: C.muted }}>
            <Sparkles size={13} style={{ color: C.amber }} />
            Similar finds
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {similar.map(({ gem: sg, score }) => (
              <button
                key={sg.id}
                onClick={() => onSelect(sg.id)}
                className="rounded-xl p-3 text-left transition-colors hover:bg-[rgba(237,230,218,0.06)]"
                style={{ background: "rgba(237,230,218,0.03)", border: `1px solid ${C.line}` }}
              >
                <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color: C.muted }}>{sg.house}</div>
                <div className="mt-0.5 flex items-center justify-between">
                  <span className="text-sm" style={{ color: C.ink }}>{sg.name}</span>
                  <span className="text-[10px]" style={{ color: C.amber }}>{Math.round(score * 100)}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function readHash() {
  const h = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  return finds.some((f) => f.id === h) ? h : null;
}

export default function PerfumeIntelligence() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState(null);
  const [gemsOnly, setGemsOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(readHash);

  useEffect(() => {
    const onHash = () => setSelectedId(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function select(id) {
    window.location.hash = id || "";
    if (!id) history.replaceState(null, "", window.location.pathname + window.location.search);
    setSelectedId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const selected = finds.find((f) => f.id === selectedId) || null;
  const tags = useMemo(() => allTags(), []);
  const results = useMemo(() => {
    let list = query.trim() ? searchGems(query) : finds;
    if (tag) list = list.filter((g) => g.tags.includes(tag));
    if (gemsOnly) list = list.filter((g) => g.awareness === "low");
    return list;
  }, [query, tag, gemsOnly]);

  const exampleChips = ["Baccarat Rouge 540", "Althaïr", "Blue Talisman", "Tygar", "Oajan"];
  const updated = new Date(updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen w-full" style={{ background: C.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
        .font-serif { font-family: 'Fraunces', serif; }
        * { font-family: 'Inter', sans-serif; }
        input::placeholder { color: ${C.faint}; }
      `}</style>

      <div className="mx-auto max-w-2xl px-5 py-14 sm:py-20">
        <div className="mb-10 text-center">
          <div className="text-[11px] uppercase tracking-[0.3em]" style={{ color: C.amber }}>Perfume Intelligence</div>
          <h1 className="font-serif mt-3 text-4xl sm:text-5xl" style={{ color: C.ink }}>
            Smell expensive.<br />Pay a fraction.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: C.muted }}>
            Under-the-radar perfumes that last and hold their own against the big houses — researched, sourced, and honest about the catch.
          </p>
        </div>

        {selected ? (
          <GemDetail gem={selected} onSelect={select} onBack={() => select(null)} />
        ) : (
          <>
            <div
              className="flex items-center gap-3 rounded-full px-5 py-4"
              style={{ background: C.card, border: "1px solid rgba(201,146,43,0.25)" }}
            >
              <Search size={18} style={{ color: C.amber }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="A scent you love, a note, or a house…"
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: C.ink }}
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Clear search">
                  <X size={16} style={{ color: C.muted }} />
                </button>
              )}
            </div>

            {!query && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="w-full text-center text-[11px]" style={{ color: C.faint }}>Love one of these? See what rivals it:</span>
                {exampleChips.map((c) => (
                  <button
                    key={c}
                    onClick={() => setQuery(c)}
                    className="rounded-full px-3 py-1.5 text-xs transition-colors hover:bg-[rgba(237,230,218,0.06)]"
                    style={{ color: C.muted, border: "1px solid rgba(237,230,218,0.1)" }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setGemsOnly((v) => !v)}
                className="rounded-full px-3 py-1.5 text-xs"
                style={gemsOnly
                  ? { background: C.amber, color: C.bg, border: `1px solid ${C.amber}` }
                  : { color: C.amber, border: "1px solid rgba(201,146,43,0.35)" }}
              >
                Hidden gems only
              </button>
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(tag === t ? null : t)}
                  className="rounded-full px-3 py-1.5 text-xs capitalize"
                  style={tag === t
                    ? { background: C.ink, color: C.bg, border: `1px solid ${C.ink}` }
                    : { color: C.muted, border: `1px solid ${C.line}` }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-4 text-[11px]" style={{ color: C.faint }}>
              {results.length} {results.length === 1 ? "find" : "finds"}{query ? ` for “${query}”` : ""}
            </div>

            <div className="mt-3 grid gap-3">
              {results.map((g) => <GemCard key={g.id} gem={g} onSelect={select} />)}
              {results.length === 0 && (
                <div className="rounded-2xl p-8 text-center text-sm" style={{ color: C.muted, border: `1px dashed ${C.line}` }}>
                  Nothing yet for that. New finds are researched daily — check back soon.
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-12 text-center text-[11px] leading-relaxed" style={{ color: C.faint }}>
          {finds.length} finds · updated {updated}<br />
          Longevity and similarity come from community reviews and vary by skin and batch. No paid placements.
        </div>
      </div>
    </div>
  );
}
