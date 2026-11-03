import Link from "next/link";
import { Logo } from "./Nav";
import { COLLECTIONS } from "@/lib/collections";
import { DATA_META, perfumes, ratedCount } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="cave-bg relative overflow-hidden text-ivory">
      <div className="mx-auto max-w-page px-5 pb-10 pt-24 md:px-10">
        <div className="grid gap-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-6 max-w-sm font-serif text-2xl font-light leading-snug text-ivory/85">
              A treasure cave for the perfumes the world hasn&rsquo;t discovered yet.
            </p>
            <p className="mt-6 text-sm text-ivory/50">Independent research. Not affiliated with any brand shown.</p>
          </div>
          <FooterCol title="Discover" links={[["/perfumes", "All perfumes"], ["/perfumes#notes", "Note finder"], ["/collections/hidden-gems", "Hidden gems"], ["/compare", "Compare"]]} />
          <FooterCol title="Collections" links={COLLECTIONS.slice(2, 7).map((c) => [`/collections/${c.slug}`, c.title])} />
          <FooterCol title="Community" links={[["/saved", "Your saved perfumes"], ["/stories", "Stories & guides"], ["/stories/how-scentlens-works", "How we rate"]]} />
        </div>
        <div className="mt-20 flex flex-col justify-between gap-4 border-t border-ivory/10 pt-6 text-xs text-ivory/45 md:flex-row">
          <p>© {new Date().getFullYear()} Caverne d&rsquo;Ali Beauté · {perfumes.length} perfumes · {ratedCount} with a ScentLens Rating</p>
          <p className="max-w-2xl md:text-right">{DATA_META.note}</p>
        </div>
      </div>
      <p aria-hidden className="pointer-events-none select-none whitespace-nowrap text-center font-serif text-[18vw] font-light leading-[0.8] text-ivory/[0.04]">Caverne</p>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="eyebrow mb-5 text-champagne-400">{title}</p>
      <ul className="space-y-3 text-[15px] text-ivory/75">
        {links.map(([href, label]) => (
          <li key={href}><Link href={href} className="link-underline hover:text-ivory">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
