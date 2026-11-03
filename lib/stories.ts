export interface Story {
  slug: string;
  title: string;
  kicker: string;
  dek: string;
  minutes: number;
  tone: "emerald" | "champagne" | "clay" | "ivory";
  /** A note or collection to link readers onward to. */
  explore?: { label: string; href: string };
  body: { h?: string; p: string }[];
}

export const STORIES: Story[] = [
  {
    slug: "reading-a-note-pyramid",
    title: "How to Read a Note Pyramid",
    kicker: "Fragrance 101",
    dek: "Top, heart and base aren't marketing poetry. They describe a perfume that changes as it evaporates.",
    minutes: 4,
    tone: "ivory",
    explore: { label: "Try the Note Finder", href: "/perfumes#notes" },
    body: [
      { p: "Every perfume is a mixture of materials that evaporate at different speeds. The note pyramid is simply a map of that timing — what you smell first, what you live with for most of the day, and what lingers on your skin and clothes long after." },
      { h: "Top notes: the first impression", p: "The lightest, most volatile molecules: citrus peels, aromatic herbs, sparkling spices, bright fruits. They lead for roughly the first fifteen to thirty minutes. Top notes are why a perfume can smell completely different in a shop than it does an hour later — so never judge a scent on the first spray alone." },
      { h: "Heart notes: the character", p: "Once the top fades, the heart emerges — florals, softer spices, fruits and green notes. This is the perfume's personality, usually present for the next few hours. When two fragrances 'smell alike', it is often because their hearts share the same structure." },
      { h: "Base notes: the memory", p: "Woods, resins, musks, vanilla, amber and oud evaporate slowly and anchor everything above them. They can last many hours, and they are what people remember when you've left the room. Strong longevity almost always comes from a generous base." },
      { h: "How to use it here", p: "On every Caverne d'Ali Beauté profile the pyramid is interactive: hover or tap a layer to see when it plays, and use the Note Finder to search by the materials you already love. If you adore one base note — say, tonka or sandalwood — searching for it is the fastest route to your next favourite." },
    ],
  },
  {
    slug: "oud-the-wood-of-the-gods",
    title: "Oud: The Wood of the Gods",
    kicker: "Ingredient story",
    dek: "One of the rarest natural materials in perfumery begins as a tree's response to injury.",
    minutes: 5,
    tone: "emerald",
    explore: { label: "Explore Oud & Smoke", href: "/collections/oud-and-smoke" },
    body: [
      { p: "Oud — also called agarwood — comes from Aquilaria trees native to South and Southeast Asia. Healthy heartwood is pale and almost scentless. When the tree is wounded and infected by mould, it defends itself by producing a dark, fragrant resin. That resin-soaked wood is oud." },
      { h: "Why it's so precious", p: "Only a fraction of wild trees ever produce resin, and high-grade natural oud oil can cost more by weight than gold. Several Aquilaria species are protected under international trade rules, and much of today's natural oud comes from cultivated, deliberately inoculated plantations." },
      { h: "What you're actually smelling", p: "Most affordable 'oud' perfumes use an accord: a blend of woods, resins, leathery and animalic materials that evokes oud's smoky, sweet, slightly medicinal depth. That isn't a cheat — a well-built accord can be smoother and more wearable than raw oil." },
      { h: "Wearing it", p: "Oud loves company. Rose softens it, saffron makes it glow, vanilla and amber turn it plush. If you're new to oud, start with a rose- or vanilla-led composition before moving to the darker, smokier styles." },
    ],
  },
  {
    slug: "saffron-red-gold",
    title: "Saffron, the Red Gold",
    kicker: "Ingredient story",
    dek: "Leathery, honeyed and metallic — the spice behind a generation of modern ambers.",
    minutes: 4,
    tone: "clay",
    explore: { label: "Search saffron perfumes", href: "/perfumes?note=saffron" },
    body: [
      { p: "Saffron is the hand-picked stigma of the Crocus sativus flower. Each bloom gives just three threads, which is why it is the world's most expensive spice by weight." },
      { h: "Its scent", p: "Saffron smells warm, leathery and faintly honeyed, with a dry, almost metallic edge. Much of its character comes from a molecule called safranal. In perfume, natural saffron is rarely used at scale — perfumers usually rebuild the effect with safe, stable aroma materials." },
      { h: "Why it's everywhere now", p: "Saffron sits at the heart of many of today's most popular ambery-woody perfumes, where it adds a glowing, luminous quality to woods and resins. Pair it with rose for something classic and Arabian; with jasmine and ambergris for something airy and modern." },
    ],
  },
  {
    slug: "the-new-houses",
    title: "The New Houses Rewriting Luxury",
    kicker: "Brand discovery",
    dek: "Why some of the most interesting perfumes of the decade cost less than a dinner out.",
    minutes: 5,
    tone: "champagne",
    explore: { label: "Browse Hidden Gems", href: "/collections/hidden-gems" },
    body: [
      { p: "A wave of perfume houses — many based in the United Arab Emirates — has changed what people expect for their money. Names like Lattafa, Armaf, Afnan, Maison Alhambra and French Avenue now appear in the collections of serious fragrance lovers alongside niche bottles costing ten times as much." },
      { h: "How the price is possible", p: "A luxury perfume's price pays for much more than its formula: global advertising, prestige retail space, licensing and elaborate packaging. Houses that sell at scale through their own channels, with simpler marketing, can put more of the price into what's inside the bottle." },
      { h: "Inspired-by, and beyond", p: "Many of these houses became known for compositions inspired by famous perfumes. The more interesting story is what came next: original creations with their own identities, and flankers that push familiar ideas somewhere new." },
      { h: "Choose with data, not hype", p: "Quality varies between releases, even within one house. That's why every perfume here shows its source ratings and review counts, and why our Hidden Gems rule is published openly rather than decided by who paid for placement." },
    ],
  },
  {
    slug: "how-scentlens-works",
    title: "How the ScentLens Rating Works",
    kicker: "Methodology",
    dek: "An independent score you can check line by line — and that we never invent.",
    minutes: 3,
    tone: "ivory",
    explore: { label: "See the top-rated perfumes", href: "/perfumes?sort=score" },
    body: [
      { h: "1. Collect", p: "For each perfume we collect publicly displayed customer and community ratings — from sources such as Parfumo, Notino, Nykaa and established retailers — together with their review counts and a link to where they were found. Sources with fewer than three reviews are ignored." },
      { h: "2. Normalise", p: "Every rating is converted to a scale of 100. A 4.4 out of 5 becomes 88; an 8.7 out of 10 becomes 87." },
      { h: "3. Average, then subtract 7", p: "We average the normalised ratings and subtract seven points. Retailer star ratings tend to run high, and the deduction keeps our scores conservative. The result is rounded to one decimal place and kept between 0 and 100." },
      { h: "4. Show the working", p: "Every profile lists each source, its original rating, its converted score and its review count. Scores recalculate automatically whenever a source rating is updated." },
      { h: "What we don't do", p: "We never estimate or invent a rating. If a perfume has no qualifying published ratings yet, it simply shows 'not yet rated'. Ratings belong to their sources; we link to every one." },
    ],
  },
];

export const getStory = (slug: string) => STORIES.find((s) => s.slug === slug);
