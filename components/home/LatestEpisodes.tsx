import Link from "next/link";
import { Suspense } from "react";
import { getEpisodeNumbers, getLatestUploads } from "@/lib/youtube";
import { EpisodeCard } from "@/components/media/EpisodeCard";
import { DealIn } from "@/components/motion/DealIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function LatestEpisodes() {
  return (
    <section data-theme="fanzine" className="relative py-24 md:py-36" aria-labelledby="latest-title">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <SectionHeading
          id="latest-title"
          title={<>Fresh from <span className="text-kop">the pod</span></>}
          aside={
            <Link href="/episodes" className="group inline-flex items-center gap-3 rounded-full border-2 border-ink px-6 py-3 font-semibold transition-colors hover:bg-ink hover:text-paper">
              Browse every episode
            </Link>
          }
        >
          Reviews the morning after, watchalongs while the match is on, and everything in between.
        </SectionHeading>

        <Suspense fallback={<GridSkeleton />}>
          <Grid />
        </Suspense>
      </div>
    </section>
  );
}

async function Grid() {
  const [videos, numbers] = await Promise.all([getLatestUploads(7), getEpisodeNumbers()]);
  // index 0 lives in the hero card; start from the one before it
  const list = videos.slice(1, 7);
  if (!list.length) {
    return (
      <p className="mt-12 text-lg">
        Episodes are loading slowly right now.{" "}
        <a className="font-semibold text-kop underline underline-offset-4" href="https://www.youtube.com/@kopkaruthu/videos">
          Watch them on YouTube instead
        </a>
        .
      </p>
    );
  }

  return (
    <DealIn className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
      {list.map((v, i) => (
        <div
          key={v.id}
          data-deal
          className={
            i === 0
              ? "md:col-span-2 lg:col-span-7 lg:row-span-2"
              : i < 3
                ? "lg:col-span-5"
                : "lg:col-span-4"
          }
        >
          <EpisodeCard video={v} no={numbers.get(v.id)} size={i === 0 ? "lg" : "md"} className="h-full" />
        </div>
      ))}
    </DealIn>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-12 lg:gap-8" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`${i === 0 ? "md:col-span-2 lg:col-span-7 lg:row-span-2" : i < 3 ? "lg:col-span-5" : "lg:col-span-4"} animate-pulse rounded-[10px] bg-ink/10`}
          style={{ minHeight: i === 0 ? 520 : 300 }}
        />
      ))}
    </div>
  );
}
