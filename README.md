# Caverne d’Ali Beauté

A luxury fragrance discovery platform for **hidden gems**: perfumes from under-the-radar houses, mapped note by note and rated independently out of 100 with the transparent **ScentLens Rating**.

Built with **Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · GSAP + ScrollTrigger · Lenis · Three.js / React Three Fiber**.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (static pages for every perfume)
```

Optional: set `NEXT_PUBLIC_SITE_URL` for canonical URLs, sitemap and Open Graph.

## What's inside

| Route | What it does |
| --- | --- |
| `/` | Cinematic homepage: 3D hero + search, Discover your scent (taste profile → live recommendations), pinned Hidden Gems gallery, Fragrance Intelligence explainer, Collections, Compare & Discover, Editorial stories |
| `/perfumes` | Explore + **Note finder**: require/avoid notes, family, wearer, price, longevity, season, occasion, house, hidden gems; URL-synced and shareable |
| `/perfumes/[slug]` | Profile: interactive 3D bottle, note pyramid with evaporation timeline, note composition, performance, ScentLens with every source, similar fragrances, hidden-gem alternatives |
| `/compare` | Up to 3 perfumes side by side (`?p=slug,slug`), shared notes highlighted, alternatives |
| `/collections`, `/collections/[slug]` | Rule-based collections (each publishes its rule) |
| `/stories`, `/stories/[slug]` | Editorial guides and ingredient stories |
| `/saved` | Saved perfumes (this device), copy list, recommendations |

Search palette: press `/` or `⌘K` anywhere.

## Data — `data/perfumes.json`

179 researched perfumes. Each record keeps its provenance:

- **Notes** — `notesBasis`: `official` (brand site), `consensus` (2+ independent sources) or `single`; `noteSources` links.
- **Ratings** — `ratings[]`: published third-party customer/community ratings with value, scale, review count and URL. Never estimated.
- **Bottle** — illustration colours; `basis` says whether from a description or estimated. No brand photography is used.
- **Prices** — approximate typical UK retail.

### ScentLens Rating (`lib/scentlens.ts`)

`MAX(0, average of normalised (0–100) source ratings − 7)`, rounded to 1 dp, clamped 0–100. Sources with fewer than 3 reviews are ignored. Computed at load time from `ratings[]`, so editing a rating updates every score automatically.

### Derived (and labelled) fields — `lib/derive.ts`

Seasons, occasions and versatility are suggestions from family + notes, shown as suggestions. Hidden gem = ScentLens 80+ with < 400 reviews, or 80+ at ≤ £30.

> Before a public launch: Fragrantica and Parfumo don't offer open data licences — get permission or rely on retailer/own-user ratings.

## Accessibility & performance

Keyboard-navigable search, filters and dialogs; skip link; visible focus; ARIA on interactive visuals. `prefers-reduced-motion` disables Lenis, GSAP reveals and WebGL. The 3D bottle loads lazily, falls back to SVG without WebGL, and pauses off-screen. Every perfume, collection and story page is statically generated with metadata, plus `sitemap.xml` and `robots.txt`.

## Legacy

The previous Vite + Supabase prototype lives in `legacy-vite/`; the Supabase schema in `supabase/` is unchanged and can back this app later.
