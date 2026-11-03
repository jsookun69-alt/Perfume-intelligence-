import { Suspense } from "react";
import type { Metadata } from "next";
import Explorer from "@/components/Explorer";
import PageHeader from "@/components/PageHeader";
import { CardSkeleton } from "@/components/PerfumeCard";
import { perfumes, ratedCount } from "@/lib/data";

export const metadata: Metadata = {
  title: "Explore perfumes",
  description: "Search and filter hidden-gem perfumes by note, family, season, occasion, longevity and price — with transparent ScentLens ratings.",
};

export default function PerfumesPage() {
  return (
    <>
      <PageHeader
        kicker="Explore"
        lines={["Every treasure", <em key="e" className="italic text-champagne-700">in the cave.</em>]}
        intro={<>{perfumes.length} perfumes from under-the-radar houses, {ratedCount} with an independent ScentLens Rating. Filter by what you love to smell — or what you never want to.</>}
      />
      <Suspense fallback={<div className="mx-auto grid max-w-page grid-cols-2 gap-5 px-5 md:grid-cols-3 md:px-10">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>}>
        <Explorer />
      </Suspense>
    </>
  );
}
