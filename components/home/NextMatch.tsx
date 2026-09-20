import Link from "next/link";
import { Suspense } from "react";
import { getFixtures } from "@/lib/espn";
import { NextMatchBoard } from "@/components/data/NextMatchBoard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Refreshing } from "@/components/ui/Refreshing";

export function NextMatch() {
  return (
    <section data-theme="studio" className="relative py-24 md:py-36" aria-labelledby="next-title">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <SectionHeading id="next-title" title={<>Next up for <span className="text-kop">the Reds</span></>} className="mb-14">
          Kick-off time in your time zone. When it starts, we&rsquo;ll be live on YouTube for the watchalong.
        </SectionHeading>
        <Suspense fallback={<div className="h-[420px] animate-pulse rounded-[18px] bg-night-2" aria-hidden />}>
          <Board />
        </Suspense>
      </div>
    </section>
  );
}

async function Board() {
  const data = await getFixtures();
  if (!data) {
    return (
      <div className="rounded-[18px] bg-night-2 p-8 ring-1 ring-paper/10 md:p-12">
        <p className="max-w-xl text-2xl font-semibold leading-snug">
          Fixtures aren&rsquo;t loading right now. Check the Live page for the next watchalong.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link href="/live" className="inline-block rounded-full bg-kop px-6 py-3 font-semibold text-paper">
            Go to Live
          </Link>
          <Refreshing what="the fixtures" />
        </div>
      </div>
    );
  }
  return <NextMatchBoard data={data} />;
}
