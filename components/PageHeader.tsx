import type { ReactNode } from "react";
import { SplitHeadline } from "./Reveal";

export default function PageHeader({ kicker, lines, intro, dark = false, children }: {
  kicker: string; lines: ReactNode[]; intro?: ReactNode; dark?: boolean; children?: ReactNode;
}) {
  return (
    <header className={`${dark ? "cave-bg text-ivory" : "bg-ivory text-cave"} relative overflow-hidden pb-14 pt-36 md:pb-20 md:pt-44`}>
      <div className="mx-auto max-w-page px-5 md:px-10">
        <p className={`eyebrow ${dark ? "text-champagne-400" : "text-champagne-700"}`}>{kicker}</p>
        <SplitHeadline as="h1" immediate className="display mt-5 text-[clamp(3rem,7.5vw,7rem)]" lines={lines} />
        {intro && <div className={`mt-6 max-w-2xl text-lg leading-relaxed ${dark ? "text-ivory/70" : "text-ink-soft"}`}>{intro}</div>}
        {children}
      </div>
    </header>
  );
}
