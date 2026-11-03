import type { MetadataRoute } from "next";
import { perfumes } from "@/lib/data";
import { COLLECTIONS } from "@/lib/collections";
import { STORIES } from "@/lib/stories";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://perfume-intelligence.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...["", "/perfumes", "/collections", "/compare", "/stories"].map((p) => ({ url: `${SITE}${p}`, lastModified: now })),
    ...perfumes.map((p) => ({ url: `${SITE}/perfumes/${p.slug}`, lastModified: now })),
    ...COLLECTIONS.map((c) => ({ url: `${SITE}/collections/${c.slug}`, lastModified: now })),
    ...STORIES.map((s) => ({ url: `${SITE}/stories/${s.slug}`, lastModified: now })),
  ];
}
