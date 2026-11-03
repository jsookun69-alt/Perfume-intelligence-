import { Suspense } from "react";
import type { Metadata } from "next";
import CompareView from "@/components/CompareView";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Compare perfumes",
  description: "Compare up to three perfumes side by side — ScentLens ratings, price, longevity, seasons and shared notes.",
};

export default function ComparePage() {
  return (
    <>
      <PageHeader kicker="Compare & discover" lines={["Side by", <em key="e" className="italic text-champagne-700">side.</em>]}
        intro="Line up to three perfumes and see where they meet — notes in common are highlighted." />
      <Suspense fallback={<div className="mx-auto h-96 max-w-page px-5 md:px-10"><div className="skeleton h-full rounded-[28px]" /></div>}>
        <CompareView />
      </Suspense>
    </>
  );
}
