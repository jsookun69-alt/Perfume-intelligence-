                                                                                                                    import React, { useState, useEffect } from "react";
import { Search, X, ExternalLink, Sparkles } from "lucide-react";
import { searchFragrances, getFragrance, getSimilarFragrances } from "./lib/fragrances.js";

                                                                                                                    function computeRating(p) {
                                                                                                                    const avgPerf = (p.longevity + p.projection) / 2;
                                                                                                                    const noteCount = p.notes.top.length + p.notes.heart.length + p.notes.base.length;
                                                                                                                    const complexity = Math.min(noteCount / 12, 1) * 10;
                                                                                                                    const accordDiversity = Math.min(p.accords.length / 5, 1) * 10;
                                                                                                                    const rating = avgPerf * 0.5 + complexity * 0.25 + accordDiversity * 0.25;
                                                                                                                    return Math.round(rating * 10) / 10;
                                                                                                                    }
                                                                                                                    
                                                                                                                    const AFFILIATE_CONFIG = {
                                                                                                                    amazonTag: "",
                                                                                                                    fragranceXAffId: "",
                                                                                                                    sephoraAffId: "",
                                                                                                                    };
                                                                                                                    
                                                                                                                    const EMAIL_ENDPOINT = "";
                                                                                                                    
                                                                                                                    function buildRetailerUrl(retailer, perfume) {
                                                                                                                    const q = encodeURIComponent(`${perfume.brand} ${perfume.name}`);
                                                                                                                    switch (retailer.id) {
                                                                                                                    case "amazon": {
                                                                                                                    const tag = AFFILIATE_CONFIG.amazonTag;
                                                                                                                    return `https://www.amazon.com/s?k=${q}${tag ? `&tag=${tag}` : ""}`;
                                                                                                                    }
                                                                                                                    case "fragrancex": {
                                                                                                                    const affId = AFFILIATE_CONFIG.fragranceXAffId;
                                                                                                                    return `https://www.fragrancex.com/search.aspx?keyword=${q}${affId ? `&aff=${affId}` : ""}`;
                                                                                                                    }
                                                                                                                    case "sephora": {
                                                                                                                    return `https://www.sephora.com/search?keyword=${q}`;
                                                                                                                    }
                                                                                                                    default:
                                                                                                                    return "#";
                                                                                                                    }
                                                                                                                    }
                                                                                                                    
                                                                                                                    const RETAILERS = [
                                                                                                                    { id: "sephora", name: "Sephora" },
                                                                                                                    { id: "fragrancex", name: "FragranceX" },
                                                                                                                    { id: "amazon", name: "Amazon" },
                                                                                                                    ];
                                                                                                                    
                                                                                                                    function Pyramid({ notes }) {
                                                                                                                    const tiers = [
                                                                                                                    { label: "Top", items: notes.top, width: "62%" },
                                                                                                                    { label: "Heart", items: notes.heart, width: "80%" },
                                                                                                                    { label: "Base", items: notes.base, width: "100%" },
                                                                                                                    ];
                                                                                                                    return (
                                                                                                                    <div className="flex flex-col gap-3">
                                                                                                                    {tiers.map((tier) => (
                                                                                                                    <div key={tier.label} className="flex items-start gap-4">
                                                                                                                    <div className="w-14 shrink-0 pt-1 text-right text-[10px] uppercase tracking-[0.15em]" style={{ color: "#9C8F7C" }}>
                                                                                                                    {tier.label}
                                                                                                                    </div>
                                                                                                                    <div className="flex-1" style={{ maxWidth: tier.width }}>
                                                                                                                    <div className="flex flex-wrap gap-1.5">
                                                                                                                    {tier.items.map((n) => (
                                                                                                                    <span
                                                                                                                    key={n}
                                                                                                                    className="rounded-full px-2.5 py-1 text-xs"
                                                                                                                    style={{ background: "rgba(201,146,43,0.12)", color: "#C9922B", border: "1px solid rgba(201,146,43,0.3)" }}
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
                                                                                                                    
                                                                                                                    function StatBar({ label, value }) {
                                                                                                                    return (
                                                                                                                    <div>
                                                                                                                    <div className="mb-1 flex items-center justify-between text-[11px]" style={{ color: "#9C8F7C" }}>
                                                                                                                    <span className="uppercase tracking-[0.1em]">{label}</span>
                                                                                                                    <span style={{ color: "#EDE6DA" }}>{value}/10</span>
                                                                                                                    </div>
                                                                                                                    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(237,230,218,0.08)" }}>
                                                                                                                    <div
                                                                                                                    className="h-full rounded-full"
                                                                                                                    style={{ width: `${value * 10}%`, background: "linear-gradient(90deg, #6B2737, #C9922B)" }}
                                                                                                                    />
                                                                                                                    </div>
                                                                                                                    </div>
                                                                                                                    );
                                                                                                                    }
                                                                                                                    
                                                                                                                    function EmailCapture({ perfume }) {
                                                                                                                    const [email, setEmail] = useState("");
                                                                                                                    const [status, setStatus] = useState("idle");
                                                                                                                    
                                                                                                                    async function handleSubmit(e) {
                                                                                                                    e.preventDefault();
                                                                                                                    if (!email.trim() || status === "sending") return;
                                                                                                                    setStatus("sending");
                                                                                                                    try {
                                                                                                                    if (EMAIL_ENDPOINT) {
                                                                                                                    await fetch(EMAIL_ENDPOINT, {
                                                                                                                    method: "POST",
                                                                                                                    headers: { "Content-Type": "application/json" },
                                                                                                                    body: JSON.stringify({ email, lastViewed: `${perfume.brand} ${perfume.name}` }),
                                                                                                                    });
                                                                                                                    } else {
                                                                                                                    console.log("Email capture (no endpoint set):", email, perfume.name);
                                                                                                                    }
                                                                                                                    setStatus("sent");
                                                                                                                    } catch (err) {
                                                                                                                    setStatus("error");
                                                                                                                    }
                                                                                                                    }
                                                                                                                    
                                                                                                                    if (status === "sent") {
                                                                                                                    return (
                                                                                                                    <div
                                                                                                                    className="mt-6 rounded-xl p-4 text-center text-xs"
                                                                                                                    style={{ background: "rgba(201,146,43,0.08)", border: "1px solid rgba(201,146,43,0.25)", color: "#C9922B" }}
                                                                                                                    >
                                                                                                                    You're on the list — we'll send matches worth trying.
                                                                                                                    </div>
                                                                                                                    );
                                                                                                                    }
                                                                                                                    
                                                                                                                    return (
                                                                                                                    <form onSubmit={handleSubmit} className="mt-6 rounded-xl p-4" style={{ background: "rgba(237,230,218,0.03)", border: "1px solid rgba(237,230,218,0.08)" }}>
                                                                                                                    <div className="mb-2 text-[11px] uppercase tracking-[0.15em]" style={{ color: "#9C8F7C" }}>
                                                                                                                    Get matched fragrances by email
                                                                                                                    </div>
                                                                                                                    <div className="flex gap-2">
                                                                                                                    <input
                                                                                                                    type="email"
                                                                                                                    required
                                                                                                                    value={email}
                                                                                                                    onChange={(e) => setEmail(e.target.value)}
                                                                                                                    placeholder="you@email.com"
                                                                                                                    className="w-full rounded-full bg-transparent px-4 py-2 text-xs outline-none"
                                                                                                                    style={{ color: "#EDE6DA", border: "1px solid rgba(237,230,218,0.15)" }}
                                                                                                                    />
                                                                                                                    <button
                                                                                                                    type="submit"
                                                                                                                    disabled={status === "sending"}
                                                                                                                    className="shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                                                                                                                    style={{ background: "#C9922B", color: "#0F0D0B" }}
                                                                                                                    >
                                                                                                                    {status === "sending" ? "..." : "Notify me"}
                                                                                                                    </button>
                                                                                                                    </div>
                                                                                                                    {status === "error" && (
                                                                                                                    <div className="mt-2 text-[11px]" style={{ color: "#B0473F" }}>
                                                                                                                    Something went wrong — try again in a moment.
                                                                                                                    </div>
                                                                                                                    )}
                                                                                                                    </form>
                                                                                                                    );
                                                                                                                    }
                                                                                                                    
                                                                                                                    function ResultCard({ perfume, onSelect, similar }) {
                                                                                                                    const rating = computeRating(perfume);
                                                                                                                    return (
                                                                                                                    <div className="rounded-2xl p-6 sm:p-8" style={{ background: "#1A1613", border: "1px solid rgba(237,230,218,0.08)" }}>
                                                                                                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                                                                                                    <div>
                                                                                                                    <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#C9922B" }}>
                                                                                                                    {perfume.brand}
                                                                                                                    </div>
                                                                                                                    <h2 className="mt-1 font-serif text-3xl" style={{ color: "#EDE6DA" }}>
                                                                                                                    {perfume.name}
                                                                                                                    </h2>
                                                                                                                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]" style={{ color: "#9C8F7C" }}>
                                                                                                                    <span>{perfume.year}</span>
                                                                                                                    <span>·</span>
                                                                                                                    <span>{perfume.concentration}</span>
                                                                                                                    <span>·</span>
                                                                                                                    <span>{perfume.gender}</span>
                                                                                                                    <span>·</span>
                                                                                                                    <span>{perfume.family}</span>
                                                                                                                    </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex flex-col items-end">
                                                                                                                    <div className="font-serif text-4xl" style={{ color: "#C9922B" }}>{rating}</div>
                                                                                                                    <div className="text-[10px] uppercase tracking-[0.15em]" style={{ color: "#9C8F7C" }}>Rating / 10</div>
                                                                                                                    </div>
                                                                                                                    </div>
                                                                                                                    
                                                                                                                    <div className="my-6 h-px" style={{ background: "rgba(237,230,218,0.08)" }} />
                                                                                                                    
                                                                                                                    <Pyramid notes={perfume.notes} />
                                                                                                                    
                                                                                                                    <div className="mt-6 grid grid-cols-2 gap-6">
                                                                                                                    <StatBar label="Longevity" value={perfume.longevity} />
                                                                                                                    <StatBar label="Projection" value={perfume.projection} />
                                                                                                                    </div>
                                                                                                                    
                                                                                                                    <div className="mt-6 flex flex-wrap gap-2">
                                                                                                                    {RETAILERS.map((r) => (
                                                                                                                    <a
                                                                                                                    key={r.id}
                                                                                                                    href={buildRetailerUrl(r, perfume)}
                                                                                                                    target="_blank"
                                                                                                                    rel="noopener noreferrer sponsored"
                                                                                                                    className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs transition-opacity hover:opacity-80"
                                                                                                                    style={{ background: "rgba(237,230,218,0.06)", color: "#EDE6DA", border: "1px solid rgba(237,230,218,0.12)" }}
                                                                                                                    >
                                                                                                                    {r.name} <ExternalLink size={11} />
                                                                                                                    </a>
                                                                                                                    ))}
                                                                                                                    </div>
                                                                                                                    
                                                                                                                    <EmailCapture perfume={perfume} />
                                                                                                                    
                                                                                                                    {similar.length > 0 && (
                                                                                                                    <div className="mt-8">
                                                                                                                    <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]" style={{ color: "#9C8F7C" }}>
                                                                                                                    <Sparkles size={13} style={{ color: "#C9922B" }} />
                                                                                                                    Smells Similar
                                                                                                                    </div>
                                                                                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                                                                                    {similar.map(({ perfume: sp, score }) => (
                                                                                                                    <button
                                                                                                                    key={sp.id}
                                                                                                                    onClick={() => onSelect(sp)}
                                                                                                                    className="rounded-xl p-3 text-left transition-colors hover:bg-[rgba(237,230,218,0.06)]"
                                                                                                                    style={{ background: "rgba(237,230,218,0.03)", border: "1px solid rgba(237,230,218,0.08)" }}
                                                                                                                    >
                                                                                                                    <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "#9C8F7C" }}>
                                                                                                                    {sp.brand}
                                                                                                                    </div>
                                                                                                                    <div className="mt-0.5 flex items-center justify-between">
                                                                                                                    <span className="text-sm" style={{ color: "#EDE6DA" }}>{sp.name}</span>
                                                                                                                    <span className="text-[10px]" style={{ color: "#C9922B" }}>
                                                                                                                    {Math.round(score * 100)}%
                                                                                                                    </span>
                                                                                                                    </div>
                                                                                                                    </button>
                                                                                                                    ))}
                                                                                                                    </div>
                                                                                                                    </div>
                                                                                                                    )}
                                                                                                                    </div>
                                                                                                                    );
                                                                                                                    }
                                                                                                                    
                                                                                                                    export default function PerfumeIntelligence() {
                                                                                                                    const [query, setQuery] = useState("");
                                                                                                                    const [selected, setSelected] = useState(null);
                                                                                                                    const [suggestions, setSuggestions] = useState([]);
                                                                                                                    const [similar, setSimilar] = useState([]);
                                                                                                                    const [error, setError] = useState(null);
                                                                                                                    
                                                                                                                    // Debounced server-side search; stale responses are ignored.
                                                                                                                    useEffect(() => {
                                                                                                                    if (!query.trim() || selected) {
                                                                                                                    setSuggestions([]);
                                                                                                                    return;
                                                                                                                    }
                                                                                                                    let cancelled = false;
                                                                                                                    const timer = setTimeout(() => {
                                                                                                                    searchFragrances(query)
                                                                                                                    .then((rows) => { if (!cancelled) { setSuggestions(rows); setError(null); } })
                                                                                                                    .catch((err) => { if (!cancelled) setError(err); });
                                                                                                                    }, 150);
                                                                                                                    return () => { cancelled = true; clearTimeout(timer); };
                                                                                                                    }, [query, selected]);
                                                                                                                    
                                                                                                                    useEffect(() => {
                                                                                                                    setSimilar([]);
                                                                                                                    if (!selected) return;
                                                                                                                    let cancelled = false;
                                                                                                                    getSimilarFragrances(selected.id)
                                                                                                                    .then((rows) => { if (!cancelled) setSimilar(rows); })
                                                                                                                    .catch((err) => { if (!cancelled) setError(err); });
                                                                                                                    return () => { cancelled = true; };
                                                                                                                    }, [selected]);
                                                                                                                    
                                                                                                                    async function selectFragrance(slug) {
                                                                                                                    try {
                                                                                                                    const perfume = await getFragrance(slug);
                                                                                                                    if (!perfume) return;
                                                                                                                    setSelected(perfume);
                                                                                                                    setQuery(`${perfume.brand} ${perfume.name}`);
                                                                                                                    setError(null);
                                                                                                                    } catch (err) {
                                                                                                                    setError(err);
                                                                                                                    }
                                                                                                                    }
                                                                                                                    
                                                                                                                    const exampleChips = ["Sauvage", "Aventus", "Baccarat Rouge", "Black Opium", "Santal 33"];
                                                                                                                    
                                                                                                                    return (
                                                                                                                    <div className="min-h-screen w-full" style={{ background: "#0F0D0B" }}>
                                                                                                                    <style>{`
                                                                                                                    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
                                                                                                                    .font-serif { font-family: 'Fraunces', serif; }
                                                                                                                    * { font-family: 'Inter', sans-serif; }
                                                                                                                    input::placeholder { color: #6B5F52; }
                                                                                                                    `}</style>
                                                                                                                    
                                                                                                                    <div className="mx-auto max-w-2xl px-5 py-14 sm:py-20">
                                                                                                                    <div className="mb-10 text-center">
                                                                                                                    <div className="text-[11px] uppercase tracking-[0.3em]" style={{ color: "#C9922B" }}>
                                                                                                                    Perfume Intelligence
                                                                                                                    </div>
                                                                                                                    <h1 className="font-serif mt-3 text-4xl sm:text-5xl" style={{ color: "#EDE6DA" }}>
                                                                                                                    Find your fragrance.
                                                                                                                    </h1>
                                                                                                                    <p className="mt-3 text-sm" style={{ color: "#9C8F7C" }}>
                                                                                                                    Notes, ratings, and what to try next — search a perfume to begin.
                                                                                                                    </p>
                                                                                                                    </div>
                                                                                                                    
                                                                                                                    <div className="relative">
                                                                                                                    <div
                                                                                                                    className="flex items-center gap-3 rounded-full px-5 py-4"
                                                                                                                    style={{ background: "#1A1613", border: "1px solid rgba(201,146,43,0.25)" }}
                                                                                                                    >
                                                                                                                    <Search size={18} style={{ color: "#C9922B" }} />
                                                                                                                    <input
                                                                                                                    value={query}
                                                                                                                    onChange={(e) => {
                                                                                                                    setQuery(e.target.value);
                                                                                                                    setSelected(null);
                                                                                                                    }}
                                                                                                                    placeholder="Try 'Bleu de Chanel' or 'Sauvage'..."
                                                                                                                    className="w-full bg-transparent text-sm outline-none"
                                                                                                                    style={{ color: "#EDE6DA" }}
                                                                                                                    />
                                                                                                                    {query && (
                                                                                                                    <button onClick={() => { setQuery(""); setSelected(null); }}>
                                                                                                                    <X size={16} style={{ color: "#9C8F7C" }} />
                                                                                                                    </button>
                                                                                                                    )}
                                                                                                                    </div>
                                                                                                                    
                                                                                                                    {suggestions.length > 0 && !selected && (
                                                                                                                    <div
                                                                                                                    className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl"
                                                                                                                    style={{ background: "#1A1613", border: "1px solid rgba(237,230,218,0.1)" }}
                                                                                                                    >
                                                                                                                    {suggestions.map((p) => (
                                                                                                                    <button
                                                                                                                    key={p.id}
                                                                                                                    onClick={() => selectFragrance(p.id)}
                                                                                                                    className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-[rgba(237,230,218,0.05)]"
                                                                                                                    >
                                                                                                                    <div>
                                                                                                                    <span className="text-sm" style={{ color: "#EDE6DA" }}>{p.name}</span>
                                                                                                                    <span className="ml-2 text-xs" style={{ color: "#9C8F7C" }}>{p.brand}</span>
                                                                                                                    </div>
                                                                                                                    <span className="text-[10px] uppercase tracking-wide" style={{ color: "#6B5F52" }}>{p.family}</span>
                                                                                                                    </button>
                                                                                                                    ))}
                                                                                                                    </div>
                                                                                                                    )}
                                                                                                                    </div>
                                                                                                                    
                                                                                                                    {error && (
                                                                                                                    <div className="mt-4 text-center text-xs" style={{ color: "#B0473F" }}>
                                                                                                                    Couldn't reach the fragrance database — try again in a moment.
                                                                                                                    </div>
                                                                                                                    )}
                                                                                                                    
                                                                                                                    {!selected && (
                                                                                                                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                                                                                                                    {exampleChips.map((c) => (
                                                                                                                    <button
                                                                                                                    key={c}
                                                                                                                    onClick={() => setQuery(c)}
                                                                                                                    className="rounded-full px-3 py-1.5 text-xs transition-colors hover:bg-[rgba(237,230,218,0.06)]"
                                                                                                                    style={{ color: "#9C8F7C", border: "1px solid rgba(237,230,218,0.1)" }}
                                                                                                                    >
                                                                                                                    {c}
                                                                                                                    </button>
                                                                                                                    ))}
                                                                                                                    </div>
                                                                                                                    )}
                                                                                                                    
                                                                                                                    {selected && (
                                                                                                                    <div className="mt-8">
                                                                                                                    <ResultCard perfume={selected} onSelect={(sp) => selectFragrance(sp.id)} similar={similar} />
                                                                                                                    </div>
                                                                                                                    )}
                                                                                                                    </div>
                                                                                                                    </div>
                                                                                                                    );
                                                                                                                    }
                                                                                                                    
