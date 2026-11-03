import Link from "next/link";

export default function NotFound() {
  return (
    <section className="cave-bg flex min-h-[80svh] items-center text-ivory">
      <div className="mx-auto max-w-page px-5 pt-24 md:px-10">
        <p className="eyebrow text-champagne-400">404</p>
        <h1 className="display mt-5 text-[clamp(3rem,8vw,7rem)]">This chamber <em className="gold-text italic">is empty.</em></h1>
        <p className="mt-6 max-w-lg text-lg text-ivory/70">The page you were looking for isn&rsquo;t here. The treasures are this way.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/perfumes" className="btn-gold">Explore perfumes</Link>
          <Link href="/" className="btn-ghost text-ivory">Back to the entrance</Link>
        </div>
      </div>
    </section>
  );
}
