import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COLLECTIONS, collectionItems, getCollection } from "@/lib/collections";
import PageHeader from "@/components/PageHeader";
import PerfumeCard from "@/components/PerfumeCard";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = getCollection((await params).slug);
  return c ? { title: c.title, description: c.description } : { title: "Collection not found" };
}

export default async function CollectionPage({ params }: Params) {
  const c = getCollection((await params).slug);
  if (!c) notFound();
  const items = collectionItems(c);
  const dark = c.tone === "emerald";
  return (
    <>
      <PageHeader dark={dark} kicker={`${c.kicker} · ${items.length} perfumes`} lines={[c.title]} intro={c.description}>
        <p className={`mt-6 inline-flex rounded-full border px-4 py-2 text-xs ${dark ? "border-ivory/20 text-ivory/70" : "border-ink/15 text-ink-mute"}`}>How it&rsquo;s chosen: {c.rule}</p>
      </PageHeader>
      <div className="mx-auto max-w-page px-5 py-14 pb-32 md:px-10">
        {items.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
            {items.map((p, i) => <PerfumeCard key={p.slug} perfume={p} index={i} />)}
          </div>
        ) : (
          <p className="rounded-[28px] border border-dashed border-ink/20 p-16 text-center text-ink-mute">No perfumes meet this collection&rsquo;s rule yet.</p>
        )}
      </div>
    </>
  );
}
