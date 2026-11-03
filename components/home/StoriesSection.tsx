import Link from "next/link";
import { STORIES } from "@/lib/stories";
import { Reveal, SplitHeadline } from "@/components/Reveal";

export const STORY_TONE: Record<string, string> = {
  emerald: "cave-bg text-ivory",
  champagne: "bg-gradient-to-br from-[#efe0c2] to-[#cfb282] text-cave-900",
  clay: "bg-gradient-to-br from-[#c88a6f] to-[#7f4430] text-ivory",
  ivory: "bg-ivory-200 text-cave-900",
};

/** Section 7 — editorial guides, ingredient stories and brand discoveries. */
export default function StoriesSection() {
  const [lead, ...rest] = STORIES;
  return (
    <section className="bg-ivory py-28 md:py-40" aria-labelledby="stories-h">
      <div className="mx-auto max-w-page px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-champagne-700">06 — Editorial</p>
            <SplitHeadline className="h-section mt-5 text-cave" lines={["Stories from", <em key="e" className="italic text-champagne-700">the cave.</em>]} />
          </div>
          <Link href="/stories" className="link-underline text-cave-600">All stories →</Link>
        </div>
        <Reveal className="mt-14 grid gap-5 lg:grid-cols-[1.3fr_1fr]" stagger={0.08}>
          <StoryCard story={lead} big />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {rest.slice(0, 2).map((s) => <StoryCard key={s.slug} story={s} />)}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function StoryCard({ story, big = false }: { story: (typeof STORIES)[number]; big?: boolean }) {
  return (
    <Link data-reveal href={`/stories/${story.slug}`} className={`group relative flex flex-col justify-between overflow-hidden rounded-[28px] p-8 transition-transform duration-700 ease-luxe hover:-translate-y-1 ${STORY_TONE[story.tone]} ${big ? "min-h-[28rem] md:p-12" : "min-h-[15rem]"}`}>
      <p className="eyebrow opacity-70">{story.kicker} · {story.minutes} min read</p>
      <div>
        <h3 className={`font-serif font-light leading-[0.95] ${big ? "text-[clamp(2.4rem,4.6vw,4.4rem)]" : "text-3xl"}`}>{story.title}</h3>
        <p className={`mt-4 max-w-md opacity-75 ${big ? "text-lg" : "text-sm"}`}>{story.dek}</p>
        <span className="mt-6 inline-block text-sm opacity-80 transition-transform duration-500 group-hover:translate-x-1">Read →</span>
      </div>
      <span aria-hidden className="pointer-events-none absolute -right-6 -top-10 font-serif text-[12rem] leading-none opacity-[0.07]">❦</span>
    </Link>
  );
}
