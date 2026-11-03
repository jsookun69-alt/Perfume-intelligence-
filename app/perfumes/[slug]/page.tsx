import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GENDER_LABEL, getPerfume, perfumes } from "@/lib/data";
import { sharedNotes, similarTo } from "@/lib/similarity";
import Bottle3D from "@/components/three/Bottle3D";
import NotePyramid from "@/components/NotePyramid";
import ScentLensPanel from "@/components/ScentLensPanel";
import Composition from "@/components/Composition";
import PerfumeCard from "@/components/PerfumeCard";
import RatingRing from "@/components/RatingRing";
import { CompareButton, SaveButton } from "@/components/PerfumeActions";
import { Meter } from "@/components/home/FragranceIntelligence";
import { Reveal, SplitHeadline } from "@/components/Reveal";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return perfumes.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getPerfume((await params).slug);
  if (!p) return { title: "Perfume not found" };
  const notes = [...p.notes.top, ...p.notes.heart, ...p.notes.base].slice(0, 6).join(", ");
  return {
    title: `${p.name} by ${p.house}`,
    description: `${p.name} by ${p.house}: ${p.family.toLowerCase()} fragrance with ${notes}. ${p.scentLens ? `ScentLens Rating ${p.scentLens.score.toFixed(1)}/100.` : ""} Notes, performance and similar hidden gems.`,
    alternates: { canonical: `/perfumes/${p.slug}` },
  };
}

const BASIS: Record<string, string> = {
  official: "Notes from the house's official website",
  consensus: "Notes confirmed by two or more independent sources",
  single: "Notes from a single source",
};

export default async function PerfumePage({ params }: Params) {
  const p = getPerfume((await params).slug);
  if (!p) notFound();
  const similar = similarTo(p, 7);
  const gems = similarTo(p, 40).filter((x) => x.p.isHiddenGem).slice(0, 3);

  return (
    <article>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ivory pt-24 md:pt-28">
        <div className="mx-auto grid max-w-page gap-8 px-5 md:px-10 lg:grid-cols-2 lg:gap-14">
          <div className="arch cave-bg relative h-[56svh] min-h-[420px] overflow-hidden shadow-[inset_0_0_0_1.5px_rgba(212,180,131,.55)] lg:h-[78svh]">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(212,180,131,.25),transparent_60%)]" />
            <Bottle3D bottle={p.bottle} seed={`${p.house}|${p.name}`} label={`Interactive 3D illustration of the ${p.name} bottle. Drag to rotate.`} interactive hint="Drag to rotate · illustration" className="h-full w-full" />
          </div>

          <div className="flex flex-col justify-center pb-6">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-mute">
              <Link href="/perfumes" className="link-underline">Explore</Link> <span aria-hidden>/</span>{" "}
              <Link href={`/perfumes?house=${encodeURIComponent(p.house)}`} className="link-underline">{p.house}</Link>
            </nav>
            <p className="eyebrow text-champagne-700">{p.house}</p>
            <SplitHeadline as="h1" immediate className="display mt-3 text-[clamp(3rem,6.5vw,6rem)] text-cave" lines={[p.name]} />
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="chip border-champagne-600/60 text-champagne-700">{p.family}</span>
              <span className="chip border-ink/15">{GENDER_LABEL[p.gender]}</span>
              <span className="chip border-ink/15">{p.longevity} longevity</span>
              {p.isHiddenGem && <span className="chip border-cave-600 bg-cave-700 text-champagne-300">◆ Hidden gem</span>}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-8 border-y border-ink/10 py-6">
              <div className="flex items-center gap-4">
                <RatingRing score={p.scentLens?.score ?? null} size={84} />
                <div>
                  <p className="eyebrow text-[10px] text-ink-mute">ScentLens Rating</p>
                  <p className="font-serif text-xl text-cave">{p.scentLens ? `${p.scentLens.score.toFixed(1)}/100` : "Not yet rated"}</p>
                  <a href="#scentlens" className="text-xs text-cave-600 underline">See sources</a>
                </div>
              </div>
              <div>
                <p className="eyebrow text-[10px] text-ink-mute">Approx. price</p>
                <p className="font-serif text-4xl text-ink">£{p.priceGbp}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <SaveButton slug={p.slug} name={p.name} variant="full" />
              <CompareButton slug={p.slug} name={p.name} variant="full" />
            </div>
            <p className="mt-6 text-xs text-ink-mute">{BASIS[p.notesBasis]}. Bottle is an illustration — colours {p.bottle.basis === "guess" ? "estimated" : "based on a written description"}. Concentration and projection aren&rsquo;t shown because we couldn&rsquo;t verify them.</p>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="bg-ivory py-24 md:py-32" aria-labelledby="notes-h">
        <div className="mx-auto grid max-w-page gap-14 px-5 md:px-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="eyebrow text-champagne-700">The composition</p>
            <h2 id="notes-h" className="h-section mt-4 text-cave">Notes</h2>
            <div className="mt-10"><Composition notes={p.allNotes} /></div>
            {p.noteSources.length > 0 && (
              <div className="mt-10">
                <p className="eyebrow mb-3 text-ink-mute">Note sources</p>
                <ul className="flex flex-wrap gap-2">
                  {p.noteSources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className={`inline-flex flex-col rounded-2xl border px-3.5 py-2 text-sm transition-colors hover:border-champagne-600 ${/official/i.test(s.label) ? "border-cave-600 text-cave-600" : "border-ink/15"}`}>
                        <span>{/official/i.test(s.label) ? "★ " : ""}{s.label}</span>
                        <span className="text-[11px] text-ink-mute">{(() => { try { return new URL(s.url).hostname.replace("www.", ""); } catch { return s.url; } })()}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="rounded-[32px] border border-ink/10 bg-white/50 p-6 md:p-10">
            <NotePyramid perfume={p} />
          </div>
        </div>
      </section>

      {/* Performance + rating */}
      <section className="bg-ivory-200/60 py-24 md:py-32" aria-labelledby="perf-h">
        <div className="mx-auto grid max-w-page gap-10 px-5 md:px-10 lg:grid-cols-[.9fr_1.1fr]">
          <div className="space-y-8">
            <div>
              <p className="eyebrow text-champagne-700">Wear</p>
              <h2 id="perf-h" className="h-section mt-4 text-cave">Performance</h2>
            </div>
            <Meter label="Longevity (editorial estimate)" value={p.longevity === "Very long" ? 4 : p.longevity === "Long" ? 3 : 2} max={4} caption={p.longevity} />
            <Meter label="Versatility (derived)" value={p.versatility} max={5} caption={`${p.versatility}/5`} />
            <div>
              <p className="eyebrow mb-3 text-ink-mute">Suggested seasons</p>
              <div className="grid grid-cols-4 gap-2">
                {(["Spring", "Summer", "Autumn", "Winter"] as const).map((s) => (
                  <div key={s} className={`rounded-2xl border px-2 py-3 text-center text-sm ${p.seasons.includes(s) ? "border-cave-600 bg-cave-700 text-ivory" : "border-ink/10 text-ink-mute"}`}>{s}</div>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-3 text-ink-mute">Suggested occasions</p>
              <div className="flex flex-wrap gap-2">{p.occasions.map((o) => <Link key={o} href={`/perfumes?occasion=${encodeURIComponent(o)}`} className="chip border-champagne-600/50 text-champagne-700 hover:bg-champagne-500/10">{o}</Link>)}</div>
            </div>
            <p className="text-xs text-ink-mute">Seasons, occasions and versatility are suggestions derived from the scent family and notes — not published data.</p>
          </div>
          <div id="scentlens" className="scroll-mt-28"><ScentLensPanel perfume={p} /></div>
        </div>
      </section>

      {/* Similar */}
      <section className="bg-ivory py-24 md:py-32" aria-labelledby="similar-h">
        <div className="mx-auto max-w-page px-5 md:px-10">
          <p className="eyebrow text-champagne-700">If you like {p.name}</p>
          <SplitHeadline className="h-section mt-4 text-cave" lines={["Similar", <em key="e" className="italic text-champagne-700">fragrances.</em>]} />
          <p className="mt-4 max-w-xl text-ink-soft">Ranked by shared notes, scent family and wearer. The overlapping notes are shown on each card.</p>
          <Reveal className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4" stagger={0.06}>
            {similar.slice(0, 4).map(({ p: q }, i) => (
              <div data-reveal key={q.slug}><PerfumeCard perfume={q} index={i} matched={sharedNotes(p, q).slice(0, 3)} /></div>
            ))}
          </Reveal>
        </div>
      </section>

      {gems.length > 0 && (
        <section className="cave-bg py-24 text-ivory md:py-32" aria-labelledby="gems-h">
          <div className="mx-auto max-w-page px-5 md:px-10">
            <p className="eyebrow text-champagne-400">Hidden-gem alternatives</p>
            <h2 id="gems-h" className="h-section mt-4">Underrated, and <em className="gold-text italic">close in spirit.</em></h2>
            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {gems.map(({ p: q }, i) => <PerfumeCard key={q.slug} perfume={q} index={i} matched={sharedNotes(p, q).slice(0, 3)} />)}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
