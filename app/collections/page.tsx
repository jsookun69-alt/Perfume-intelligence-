import type { Metadata } from "next";
import Link from "next/link";
import { COLLECTIONS, collectionItems } from "@/lib/collections";
import PageHeader from "@/components/PageHeader";
import BottleSVG from "@/components/BottleSVG";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated perfume collections by season, occasion, ingredient and value — including our hidden gems.",
};

const TONE: Record<string, string> = {
  emerald: "cave-bg text-ivory",
  champagne: "bg-gradient-to-br from-[#efe0c2] to-[#d9bf91] text-cave-900",
  clay: "bg-gradient-to-br from-[#c88a6f] to-[#8f4f38] text-ivory",
  ivory: "bg-white text-cave-900 border border-ink/10",
};

export default function CollectionsPage() {
  return (
    <>
      <PageHeader kicker="Collections" lines={["Chambers of", <em key="e" className="italic text-champagne-700">the cave.</em>]}
        intro="Each collection publishes the rule that chooses it — no paid placements." />
      <div className="mx-auto max-w-page px-5 pb-32 md:px-10">
        <Reveal className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
          {COLLECTIONS.map((c) => {
            const items = collectionItems(c);
            return (
              <Link data-reveal key={c.slug} href={`/collections/${c.slug}`} className={`group flex min-h-[22rem] flex-col justify-between rounded-[28px] p-7 transition-transform duration-700 ease-luxe hover:-translate-y-1 ${TONE[c.tone]}`}>
                <div>
                  <p className="eyebrow opacity-70">{c.kicker} · {items.length} perfumes</p>
                  <h2 className="mt-3 font-serif text-4xl font-light leading-none">{c.title}</h2>
                  <p className="mt-3 text-sm opacity-75">{c.description}</p>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-sm opacity-80">Explore →</span>
                  <div className="flex -space-x-3">
                    {items.slice(0, 3).map((p) => <BottleSVG key={p.slug} bottle={p.bottle} seed={`${p.house}|${p.name}`} animate={false} className="h-24 w-auto transition-transform duration-700 group-hover:-translate-y-2" />)}
                  </div>
                </div>
              </Link>
            );
          })}
        </Reveal>
      </div>
    </>
  );
}
