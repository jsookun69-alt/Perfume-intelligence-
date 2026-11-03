import { getPerfume, noteIndex, perfumes } from "@/lib/data";
import { COLLECTIONS, collectionItems } from "@/lib/collections";
import Hero from "@/components/home/Hero";
import DiscoverScent from "@/components/home/DiscoverScent";
import HiddenGems from "@/components/home/HiddenGems";
import FragranceIntelligence from "@/components/home/FragranceIntelligence";
import CollectionsShowcase from "@/components/home/CollectionsShowcase";
import CompareTeaser from "@/components/home/CompareTeaser";
import StoriesSection from "@/components/home/StoriesSection";

export default function Home() {
  const gems = collectionItems(COLLECTIONS[0]);
  const featured = getPerfume("french-avenue-liquid-brun") ?? gems[0] ?? perfumes[0];
  const examples = ["lattafa-khamrah", "french-avenue-liquid-brun", "armaf-club-de-nuit-intense-man-edp", "lattafa-yara", "maison-alhambra-delilah", "afnan-9pm"]
    .map(getPerfume)
    .filter((p): p is NonNullable<typeof p> => !!p);
  const tiles = ["hidden-gems", "winter-nights", "summer-light", "date-night", "oud-and-smoke", "under-25"]
    .map((s) => COLLECTIONS.find((c) => c.slug === s)!)
    .map((c) => {
      const items = collectionItems(c);
      return { slug: c.slug, title: c.title, kicker: c.kicker, description: c.description, tone: c.tone, count: items.length, preview: items.slice(0, 4) };
    });
  const compareA = getPerfume("lattafa-khamrah")?.slug ?? perfumes[0].slug;
  const compareB = getPerfume("maison-alhambra-kismet-angel-kismet-magic")?.slug ?? perfumes[1].slug;

  return (
    <>
      <Hero featured={featured} notes={noteIndex.slice(0, 24).map((n) => n.note)} />
      <DiscoverScent />
      <HiddenGems gems={gems} />
      <FragranceIntelligence examples={examples.length ? examples : perfumes.slice(0, 5)} />
      <CollectionsShowcase tiles={tiles} />
      <CompareTeaser initial={[compareA, compareB]} />
      <StoriesSection />
    </>
  );
}
