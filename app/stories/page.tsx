import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { StoryCard } from "@/components/home/StoriesSection";
import { STORIES } from "@/lib/stories";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Stories & guides",
  description: "Perfume guides, ingredient stories and brand discoveries from Caverne d’Ali Beauté.",
};

export default function StoriesPage() {
  return (
    <>
      <PageHeader kicker="Editorial" lines={["Stories from", <em key="e" className="italic text-champagne-700">the cave.</em>]}
        intro="Guides, ingredient stories and the methods behind our ratings." />
      <div className="mx-auto max-w-page px-5 pb-32 md:px-10">
        <Reveal className="grid gap-5 md:grid-cols-2" stagger={0.06}>
          {STORIES.map((s, i) => <StoryCard key={s.slug} story={s} big={i === 0} />)}
        </Reveal>
      </div>
    </>
  );
}
