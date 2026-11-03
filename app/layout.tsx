import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/manrope";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import CompareTray from "@/components/CompareTray";
import { SearchProvider } from "@/components/SearchPalette";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://perfume-intelligence.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Caverne d’Ali Beauté — Discover the Extraordinary", template: "%s · Caverne d’Ali Beauté" },
  description:
    "A luxury fragrance discovery platform for hidden gems: explore perfumes by note, compare side by side, and see transparent ScentLens ratings out of 100.",
  openGraph: { type: "website", siteName: "Caverne d’Ali Beauté", locale: "en_GB" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0c231b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="grain">
        <SearchProvider>
          <SmoothScroll />
          <Nav />
          <main id="main" className="pb-20 sm:pb-0">{children}</main>
          <Footer />
          <CompareTray />
        </SearchProvider>
      </body>
    </html>
  );
}
