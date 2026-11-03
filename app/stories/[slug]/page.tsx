import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStory, STORIES } from "@/lib/stories";
import { SplitHeadline } from "@/components/Reveal";
import { StoryCard, STORY_TONE } from "@/components/home/StoriesSection";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return STORIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const s = getStory((await params).slug);
  return s ? { title: s.title, description: s.dek, openGraph: { type: "article" } } : { title: "Story not found" };
}

export default async function StoryPage({ params }: Params) {
  const s = getStory((await params).slug);
  if (!s) notFound();
  const more = STORIES.filter((x) => x.slug !== s.slug).slice(0, 2);
  return (
    <article>
      <header className={`${STORY_TONE[s.tone]} pb-20 pt-40 md:pt-48`}>
        <div className="mx-auto max-w-4xl px-5 md:px-10">
          <p className="eyebrow opacity-70">{s.kicker} · {s.minutes} min read</p>
          <SplitHeadline as="h1" immediate className="display mt-6 text-[clamp(2.8rem,7vw,6.4rem)]" lines={[s.title]} />
          <p className="mt-8 max-w-2xl font-serif text-2xl font-light leading-snug opacity-85">{s.dek}</p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-5 py-20 md:px-10">
        {s.body.map((b, i) => (
          <section key={i} className="mb-10">
            {b.h && <h2 className="mb-4 font-serif text-3xl text-cave">{b.h}</h2>}
            <p className={`leading-[1.85] text-ink-soft ${i === 0 ? "text-xl first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-7xl first-letter:leading-[.8] first-letter:text-champagne-700" : "text-lg"}`}>{b.p}</p>
          </section>
        ))}
        {s.explore && <Link href={s.explore.href} className="btn-gold mt-4">{s.explore.label}</Link>}
      </div>
      <div className="mx-auto max-w-page px-5 pb-28 md:px-10">
        <p className="eyebrow mb-6 text-ink-mute">Keep reading</p>
        <div className="grid gap-5 md:grid-cols-2">{more.map((m) => <StoryCard key={m.slug} story={m} />)}</div>
      </div>
    </article>
  );
}
