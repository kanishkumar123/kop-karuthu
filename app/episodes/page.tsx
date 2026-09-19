import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllUploads } from "@/lib/youtube";
import { EpisodesBrowser } from "@/components/media/EpisodesBrowser";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Episodes",
  description: "Every Kop Karuthu episode: Liverpool match previews, reviews, watchalongs and more, in Tamil.",
};

export default function EpisodesPage() {
  return (
    <>
      <PageHeader
        title={<>Every <span className="text-kop">episode</span></>}
        intro="Every episode since February 2022, newest first. Search for a player, an opponent or a scoreline."
      />
      <section data-theme="fanzine" className="relative min-h-[80vh] pb-32 pt-10" aria-label="Episode library">
        <div className="mx-auto max-w-[1500px] px-4 md:px-8">
          <Suspense fallback={<BrowserSkeleton />}>
            <Library />
          </Suspense>
        </div>
      </section>
    </>
  );
}

async function Library() {
  const all = await getAllUploads();
  const total = all.length;
  const first = all.slice(0, 24).map((v, i) => ({ v, no: total - i }));
  return <EpisodesBrowser initial={first} total={total} initialNext={total > 24 ? 24 : null} />;
}

function BrowserSkeleton() {
  return (
    <div aria-hidden>
      <div className="h-16 animate-pulse rounded-full bg-ink/10" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[380px] animate-pulse rounded-[10px] bg-ink/10" />
        ))}
      </div>
    </div>
  );
}
