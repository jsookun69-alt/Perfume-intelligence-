import Link from "next/link";
import type { Perfume } from "@/lib/types";
import BottleSVG from "@/components/BottleSVG";
import { Reveal, SplitHeadline } from "@/components/Reveal";

const TONE: Record<string, string> = {
  emerald: "cave-bg text-ivory",
  champagne: "bg-gradient-to-br from-[#efe0c2] to-[#d9bf91] text-cave-900",
  clay: "bg-gradient-to-br from-[#c88a6f] to-[#8f4f38] text-ivory",
  ivory: "bg-white text-cave-900 border border-ink/10",
};

export interface CollectionTile { slug: string; title: string; kicker: string; description: string; tone: string; count: number; preview: Perfume[] }

/** Section 5 — asymmetric grid of collections by family, season, occasion and style. */
export default function CollectionsShowcase({ tiles }: { tiles: CollectionTile[] }) {
  const spans = ["md:col-span-7 md:row-span-2", "md:col-span-5", "md:col-span-5", "md:col-span-4", "md:col-span-4", "md:col-span-4"];
  return (
    <section className="bg-ivory py-28 md:py-40" aria-labelledby="collections-h">
      <div className="mx-auto max-w-page px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-champagne-700">05 — Explore the collections</p>
            <SplitHeadline className="h-section mt-5 text-cave" lines={["Chambers of", <em key="e" className="italic text-champagne-700">the cave.</em>]} />
          </div>
          <Link href="/collections" className="link-underline text-cave-600">All collections →</Link>
        </div>
        <Reveal className="mt-14 grid auto-rows-[minmax(15rem,auto)] gap-4 md:grid-cols-12" stagger={0.07}>
          {tiles.slice(0, 6).map((c, i) => (
            <Link key={c.slug} data-reveal href={`/collections/${c.slug}`}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-[28px] p-7 transition-transform duration-700 ease-luxe hover:-translate-y-1 ${TONE[c.tone]} ${spans[i]}`}>
              <div className="relative z-10">
                <p className="eyebrow opacity-70">{c.kicker} · {c.count}</p>
                <h3 className={`mt-3 font-serif font-light leading-none ${i === 0 ? "text-[clamp(2.6rem,5vw,4.6rem)]" : "text-4xl"}`}>{c.title}</h3>
                <p className="mt-3 max-w-xs text-sm opacity-75">{c.description}</p>
              </div>
              <div className="relative z-10 mt-8 flex items-end justify-between">
                <span className="text-sm opacity-80 transition-transform duration-500 group-hover:translate-x-1">Explore →</span>
                <div className="flex -space-x-3">
                  {c.preview.slice(0, i === 0 ? 4 : 3).map((p) => (
                    <BottleSVG key={p.slug} bottle={p.bottle} seed={`${p.house}|${p.name}`} animate={false}
                      className={`${i === 0 ? "h-28 md:h-40" : "h-20"} w-auto transition-transform duration-700 ease-luxe group-hover:-translate-y-2`} />
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
