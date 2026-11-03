/**
 * Groups individual notes into broad scent categories for the "note composition"
 * visual. This is our own keyword classification, not a published accord breakdown.
 */
export const CATEGORIES = [
  { key: "Citrus", color: "#e8c35a", words: ["bergamot", "lemon", "lime", "grapefruit", "mandarin", "orange", "citrus", "yuzu", "tangerine", "kumquat", "neroli", "petitgrain", "verbena"] },
  { key: "Fresh & Green", color: "#8fb79a", words: ["mint", "green", "tea", "marine", "sea", "aquatic", "water", "ozonic", "cucumber", "galbanum", "violet leaf", "basil", "aldehyde", "calone", "sage", "thyme", "rosemary", "herb", "lavandin", "artemisia"] },
  { key: "Fruity", color: "#e08a7a", words: ["apple", "pear", "peach", "plum", "berry", "raspberry", "blackcurrant", "cassis", "cherry", "lychee", "pineapple", "mango", "coconut", "fig", "melon", "date", "apricot", "passion", "pomegranate", "rhubarb", "strawberry", "fruit", "currant", "litchi", "quince", "grape"] },
  { key: "Floral", color: "#d9a0b8", words: ["rose", "jasmine", "iris", "orris", "tuberose", "lily", "peony", "orchid", "violet", "magnolia", "ylang", "gardenia", "heliotrope", "lavender", "geranium", "orange blossom", "freesia", "mimosa", "osmanthus", "narcissus", "cyclamen", "carnation", "flower", "floral", "tagetes", "blossom"] },
  { key: "Spicy", color: "#c46a43", words: ["pepper", "cinnamon", "cardamom", "nutmeg", "saffron", "clove", "ginger", "pimento", "spice", "cumin", "anise", "coriander", "chili", "spic"] },
  { key: "Sweet & Gourmand", color: "#c99a62", words: ["vanilla", "tonka", "caramel", "praline", "honey", "sugar", "chocolate", "cacao", "coffee", "almond", "pistachio", "hazelnut", "milk", "cream", "rum", "cognac", "candy", "marshmallow", "toffee", "meringue", "liquor", "cocoa", "gourmand", "sweet"] },
  { key: "Woody", color: "#8b6a4a", words: ["cedar", "sandalwood", "vetiver", "guaiac", "wood", "birch", "cypress", "pine", "fir", "cashmere", "akigalawood", "papyrus", "patchouli", "oakmoss", "moss", "cypriol", "nagarmotha", "woody"] },
  { key: "Amber & Resin", color: "#a8642e", words: ["amber", "ambroxan", "ambergris", "benzoin", "labdanum", "myrrh", "incense", "frankincense", "olibanum", "resin", "styrax", "copal", "cistus", "tolu", "elemi"] },
  { key: "Oud & Smoke", color: "#4d3a35", words: ["oud", "agarwood", "smoke", "tobacco", "birch tar", "leather", "suede", "castoreum"] },
  { key: "Musky", color: "#b9b0a3", words: ["musk", "ambrette", "skin", "powder", "cashmeran", "iso e"] },
] as const;

export function composition(notes: string[]) {
  const counts = new Map<string, number>();
  for (const n of notes) {
    const cat = CATEGORIES.find((c) => c.words.some((w) => n.includes(w)));
    if (cat) counts.set(cat.key, (counts.get(cat.key) ?? 0) + 1);
  }
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0) || 1;
  return CATEGORIES.filter((c) => counts.has(c.key))
    .map((c) => ({ key: c.key, color: c.color, share: (counts.get(c.key)! / total) * 100, count: counts.get(c.key)! }))
    .sort((a, b) => b.share - a.share);
}
