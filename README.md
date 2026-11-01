# Perfume Intelligence

Under-the-radar, long-lasting perfumes that compete with luxury scents for a fraction of the price.

- No luxury, designer or mainstream budget houses are listed. Luxury names appear only as the scent a find competes with.
- Every find carries its sources and an honest "catch".

## How the data gets here

1. A scheduled research agent (Claude) searches forums, review sites, retailers and the sources Josh lists, and writes findings to the **Research Finds** tracker (a Claude artifact database). Josh shortlists or rejects finds there.
2. At the end of each run the agent exports the tracker with `node scripts/export-finds.mjs <raw.json>`, which writes `src/data/finds.json` and enforces the listing rules (drops rejected finds, brand-only leads, excluded houses and finds without sources).
3. The agent commits `src/data/finds.json`; Vercel redeploys.

## Develop

```
npm install
npm run dev
```
