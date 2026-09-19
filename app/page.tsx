import { Suspense } from "react";
import { getEpisodeNumbers, getLatestUploads } from "@/lib/youtube";
import { marqueeWords } from "@/content/site";
import { Hero } from "@/components/home/Hero";
import { HeroLatestCard } from "@/components/home/HeroLatestCard";
import { NameMeaning } from "@/components/home/NameMeaning";
import { LatestEpisodes } from "@/components/home/LatestEpisodes";
import { FormatsReel } from "@/components/home/FormatsReel";
import { NextMatch } from "@/components/home/NextMatch";
import { Numbers } from "@/components/home/Numbers";
import { HostsTeaser } from "@/components/home/HostsTeaser";
import { WorldwideKop } from "@/components/home/WorldwideKop";
import { VelocityMarquee } from "@/components/motion/VelocityMarquee";

export default function Home() {
  return (
    <>
      <Hero
        card={
          <Suspense fallback={<div className="aspect-[4/4.2] w-full animate-pulse rounded-2xl bg-paper/10" />}>
            <LatestCard />
          </Suspense>
        }
      />
      <section data-theme="studio" aria-hidden className="border-y border-paper/10">
        <VelocityMarquee
          rows={[
            { words: marqueeWords, direction: 1 },
            { words: [...marqueeWords].reverse(), direction: -1, outline: true },
          ]}
        />
      </section>
      <NameMeaning />
      <LatestEpisodes />
      <FormatsReel />
      <Numbers />
      <NextMatch />
      <HostsTeaser />
      <WorldwideKop />
    </>
  );
}

async function LatestCard() {
  const [latest, numbers] = await Promise.all([getLatestUploads(7), getEpisodeNumbers()]);
  const v = latest[0] ?? null;
  return <HeroLatestCard video={v} no={v ? numbers.get(v.id) : undefined} />;
}
