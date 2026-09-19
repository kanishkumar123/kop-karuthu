import type { Metadata } from "next";
import { Suspense } from "react";
import { getSquad } from "@/lib/fpl";
import { getLastLeagueXI } from "@/lib/espn";
import { PageHeader } from "@/components/ui/PageHeader";
import { SquadRoster } from "@/components/squad/SquadRoster";
import { Legends } from "@/components/squad/Legends";
import { VelocityMarquee } from "@/components/motion/VelocityMarquee";

export const metadata: Metadata = {
  title: "Squad & legends",
  description: "The current Liverpool squad with season stats, plus the legends who made the club: Shankly, Paisley, Dalglish, Gerrard, Klopp and more.",
};

export default function SquadPage() {
  return (
    <>
      <PageHeader
        title={<>The <span className="text-kop">squad</span></>}
        intro="This season's Liverpool squad with official photos and Premier League stats. Tap any player for the full picture."
      />

      <section data-theme="studio" className="relative pb-28" aria-label="Current squad">
        <div aria-hidden className="pointer-events-none -mt-6 mb-6 opacity-[0.08]">
          <VelocityMarquee baseSpeed={30} rows={[{ words: ["The squad", "Reds", "YNWA"], direction: 1, outline: true }]} />
        </div>
        <Suspense fallback={<RosterSkeleton />}>
          <Roster />
        </Suspense>
      </section>

      <Legends />
    </>
  );
}

async function Roster() {
  const [squad, xi] = await Promise.all([getSquad(), getLastLeagueXI()]);
  if (!squad) {
    return (
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <div className="rounded-[18px] bg-night-2 p-8 ring-1 ring-paper/10 md:p-12">
          <p className="max-w-xl text-2xl font-semibold leading-snug">The squad list isn&rsquo;t loading right now. It usually comes back within a few minutes. Try again shortly.</p>
        </div>
      </div>
    );
  }
  return <SquadRoster squad={squad} xi={xi} />;
}

function RosterSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1500px] grid-cols-2 gap-4 px-4 sm:grid-cols-3 md:gap-6 md:px-8 lg:grid-cols-4 xl:grid-cols-5" aria-hidden>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="aspect-[3/4.3] animate-pulse rounded-[18px] bg-night-2" />
      ))}
    </div>
  );
}
