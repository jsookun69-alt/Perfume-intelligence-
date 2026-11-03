import { composition } from "@/lib/accords";

/** Stacked bar + legend showing which scent categories a perfume's notes fall into. */
export default function Composition({ notes }: { notes: string[] }) {
  const parts = composition(notes);
  if (!parts.length) return null;
  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-full" role="img"
        aria-label={`Note composition: ${parts.map((p) => `${p.key} ${Math.round(p.share)}%`).join(", ")}`}>
        {parts.map((p) => <span key={p.key} style={{ width: `${p.share}%`, background: p.color }} className="h-full first:rounded-l-full last:rounded-r-full" />)}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        {parts.map((p) => (
          <li key={p.key} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
            <span className="flex-1">{p.key}</span>
            <span className="tabular-nums text-ink-mute">{Math.round(p.share)}%</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink-mute">Share of this perfume&rsquo;s listed notes in each category — our own classification.</p>
    </div>
  );
}
