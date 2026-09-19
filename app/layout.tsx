import type { Metadata, Viewport } from "next";
import { Outfit, Anek_Tamil } from "next/font/google";
import localFont from "next/font/local";
import { site } from "@/content/site";
import { ScrollEffects } from "@/components/motion/ScrollEffects";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Preloader, preloaderScript } from "@/components/layout/Preloader";
import { EpisodeModal } from "@/components/media/EpisodeModal";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Static Outfit Black with merged contours: used for outline text so strokes
// don't show the variable font's internal overlaps.
const outfitOutline = localFont({
  src: "./fonts/Outfit-Black.woff",
  variable: "--font-outline",
  weight: "900",
  display: "swap",
});

// Only used as a glyph fallback for real YouTube titles that contain Tamil.
const anekTamil = Anek_Tamil({
  variable: "--font-anek-tamil",
  subsets: ["tamil"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: `${site.name}: ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    type: "website",
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image", site: "@KopKaruthu_lfc" },
};

export const viewport: Viewport = {
  themeColor: "#150a0c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${outfitOutline.variable} ${anekTamil.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preloaderScript }} />
      </head>
      <body className="grain min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-kop focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <Preloader />
        <Nav />
        <ScrollEffects />
        <main id="main">{children}</main>
        <Footer />
        <EpisodeModal />
      </body>
    </html>
  );
}
