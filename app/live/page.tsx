import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllUploads, getLiveStatus } from "@/lib/youtube";
import { getFixtures } from "@/lib/espn";
import { PageHeader } from "@/components/ui/PageHeader";
import { LiveStage } from "@/components/data/LiveStage";
import { EpisodeCard } from "@/components/media/EpisodeCard";
import { DealIn } from "@/components/motion/DealIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Live watchalongs",
  description: "Kop Karuthu goes live on YouTube for Liverpool watchalongs: Tamil + English fan reactions, tactics and live chat.",
};

export default function LivePage() {
  return (
    <>
      <PageHeader
        title={<>On <span className="text-kop">air</span></>}
        intro="Watchalongs go live on YouTube while Liverpool play: our reactions in Tamil and English, and your comments in the live chat."
      />

      <section data-theme="studio" className="relative pb-24" aria-label="Live now">
        <div className="mx-auto max-w-[1500px] px-4 md:px-8">
          <Suspense fallback={<div className="aspect-video w-full animate-pulse rounded-[18px] bg-night-2" />}>
            <Stage />
          </Suspense>

          <aside className="mt-10 grid gap-6 rounded-[18px] border border-paper/15 p-6 md:grid-cols-[auto_1fr] md:items-center md:p-8">
            <p className="display text-4xl text-kop md:text-5xl">Heads up</p>
            <p className="max-w-3xl text-lg leading-relaxed text-paper/80">
              Our streams don&rsquo;t show match footage or play broadcast audio. It&rsquo;s a fan watchalong: you watch the match on your own
              legal broadcast, and we react along with you in the chat.
            </p>
          </aside>
        </div>
      </section>

      <section data-theme="fanzine" className="relative py-24 md:py-32" aria-labelledby="past-title">
        <div className="mx-auto max-w-[1500px] px-4 md:px-8">
          <SectionHeading id="past-title" title={<>Missed <span className="text-kop">one?</span></>}>
            Every watchalong is saved on the channel. Here are the most recent ones.
          </SectionHeading>
          <Suspense fallback={<div className="mt-12 h-96 animate-pulse rounded-[10px] bg-ink/10" />}>
            <PastWatchalongs />
          </Suspense>
        </div>
      </section>
    </>
  );
}

async function Stage() {
  const [status, fixtures] = await Promise.all([getLiveStatus(), getFixtures()]);
  return <LiveStage status={status} next={fixtures?.next ?? null} />;
}

async function PastWatchalongs() {
  const all = await getAllUploads();
  const total = all.length;
  const past = all
    .map((v, i) => ({ v, no: total - i }))
    .filter(({ v }) => /watch ?along/i.test(v.title) && v.live === "none")
    .slice(0, 6);
  if (!past.length) {
    return (
      <p className="mt-12 text-lg">
        No past watchalongs found.{" "}
        <a href="https://www.youtube.com/@kopkaruthu/streams" className="font-semibold text-kop underline underline-offset-4">
          Browse streams on YouTube
        </a>
        .
      </p>
    );
  }
  return (
    <DealIn className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {past.map(({ v, no }) => (
        <div key={v.id} data-deal>
          <EpisodeCard video={v} no={no} className="h-full" />
        </div>
      ))}
    </DealIn>
  );
}
