"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="flex min-h-[70svh] items-center bg-ivory">
      <div className="mx-auto max-w-page px-5 pt-24 md:px-10">
        <p className="eyebrow text-rose-clay">Something went wrong</p>
        <h1 className="display mt-5 text-[clamp(2.6rem,6vw,5rem)] text-cave">A lamp flickered in the cave.</h1>
        <p className="mt-5 max-w-lg text-ink-soft">This section failed to load. Try again — your saved perfumes are safe.</p>
        <div className="mt-8 flex gap-3">
          <button type="button" onClick={reset} className="btn-gold">Try again</button>
          <Link href="/" className="btn-ghost text-cave">Go home</Link>
        </div>
      </div>
    </section>
  );
}
