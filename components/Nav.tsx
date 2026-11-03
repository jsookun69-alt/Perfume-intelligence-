"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSearch } from "./SearchPalette";
import { useCompare, useMounted, useSaved } from "@/lib/store";
import Magnetic from "./Magnetic";

const LINKS = [
  { href: "/perfumes", label: "Explore" },
  { href: "/collections", label: "Collections" },
  { href: "/compare", label: "Compare" },
  { href: "/stories", label: "Stories" },
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`flex items-center gap-2.5 ${light ? "text-ivory" : "text-cave"}`}>
      <svg width="26" height="30" viewBox="0 0 26 30" aria-hidden>
        <path d="M13 1 3 10v18h20V10L13 1Z" fill="none" stroke="#d4b483" strokeWidth="1.4" />
        <path d="M13 9 9 15l4 6 4-6-4-6Z" fill="#d4b483" />
      </svg>
      <span className="font-serif text-[1rem] leading-none tracking-tight sm:text-[1.15rem]">
        Caverne <span className="italic text-champagne-600">d&rsquo;Ali</span> Beauté
      </span>
    </span>
  );
}

export default function Nav() {
  const path = usePathname();
  const { open } = useSearch();
  const { saved } = useSaved();
  const { items } = useCompare();
  const mounted = useMounted();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const overHero = path === "/" && !scrolled;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > window.innerHeight * 0.7);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setMenu(false), [path]);

  const light = overHero && !menu;
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-500 ${light ? "text-ivory" : "glass-panel text-ink shadow-[0_1px_0_rgba(29,26,22,.08)]"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-ivory focus:px-4 focus:py-2 focus:text-ink">Skip to content</a>
      <nav className="mx-auto flex h-[72px] max-w-page items-center justify-between gap-4 px-5 md:px-10" aria-label="Main">
        <Link href="/" aria-label="Caverne d'Ali Beauté — home"><Logo light={light} /></Link>
        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={path.startsWith(l.href) ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-[12.5px] uppercase tracking-[0.16em] transition-colors ${path.startsWith(l.href) ? "text-champagne-600" : "hover:text-champagne-600"}`}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Magnetic>
            <button type="button" onClick={() => open()} className={`flex h-10 items-center gap-2 rounded-full border px-3 text-[12.5px] sm:px-3.5 transition-colors ${light ? "border-ivory/30 hover:border-champagne-400" : "border-ink/15 hover:border-champagne-600"}`} aria-label="Search perfumes (press / or Ctrl+K)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded border border-current px-1.5 text-[10px] opacity-70 md:inline">⌘K</kbd>
            </button>
          </Magnetic>
          <Link href="/saved" className={`relative grid h-10 w-10 place-items-center rounded-full border transition-colors ${light ? "border-ivory/30" : "border-ink/15"} hover:border-rose-clay`} aria-label={`Saved perfumes${mounted ? ` (${saved.length})` : ""}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.1 3.6 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.6 0 5.7 3.6 4.5 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
            {mounted && saved.length > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-clay px-1 text-[10px] text-ivory">{saved.length}</span>}
          </Link>
          {mounted && items.length > 0 && (
            <Link href={`/compare?p=${items.join(",")}`} className="flex h-10 items-center gap-1.5 rounded-full bg-cave-700 px-3 text-[12px] text-ivory sm:px-3.5" aria-label={`Compare ${items.length} perfumes`}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7" className="sm:hidden"><path d="M7 4v16M17 4v16M3 8h8M13 16h8" strokeLinecap="round" /></svg>
              <span className="hidden sm:inline">Compare</span>
              <span className="rounded-full bg-champagne-500 px-1.5 text-[10px] text-cave-900">{items.length}</span>
            </Link>
          )}
          <button type="button" className="grid h-10 w-10 place-items-center lg:hidden" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="mobile-menu" aria-label="Menu">
            <span className="relative block h-3 w-5">
              <span className={`absolute left-0 top-0 h-px w-5 bg-current transition-transform ${menu ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`absolute bottom-0 left-0 h-px w-5 bg-current transition-transform ${menu ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </nav>
      {menu && (
        <div id="mobile-menu" className="border-t border-ink/10 px-5 pb-6 lg:hidden">
          {[...LINKS, { href: "/saved", label: "Saved" }].map((l) => (
            <Link key={l.href} href={l.href} className="block border-b border-ink/5 py-4 font-serif text-3xl">{l.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
