import { Suspense } from "react";
import { getChannel } from "@/lib/youtube";
import { NumberTicker } from "@/components/ui/NumberTicker";

export function Numbers() {
  return (
    <section data-theme="fanzine" className="relative py-24 md:py-32" aria-labelledby="numbers-title">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <h2 id="numbers-title" className="max-w-3xl text-[clamp(1.8rem,3.4vw,3rem)] font-bold leading-[1.1] tracking-[-0.02em]">
          Two fans with microphones, since <span className="text-kop">28 February 2022</span>. It kind of got out of hand.
        </h2>
        <Suspense fallback={<StatsRow />}>
          <LiveStats />
        </Suspense>
      </div>
    </section>
  );
}

async function LiveStats() {
  const ch = await getChannel();
  return <StatsRow subs={ch?.subscribers} videos={ch?.videos} views={ch?.views} />;
}

function StatsRow({ subs, videos, views }: { subs?: number; videos?: number; views?: number }) {
  const items = [
    { value: subs, label: "people in the Kop Karuthu family", format: "full" as const },
    { value: videos, label: "episodes, reviews and watchalongs", format: "full" as const },
    { value: views, label: "views and counting", format: "compact" as const },
  ];
  return (
    <dl className="mt-14 grid border-t-2 border-ink md:grid-cols-3">
      {items.map((it, i) => (
        <div key={i} className="border-b-2 border-ink py-8 md:border-b-0 md:border-r-2 md:px-8 md:py-10 md:first:pl-0 md:last:border-r-0">
          <dt className="sr-only">{it.label}</dt>
          <dd>
            <span className="display block text-[clamp(4.5rem,11vw,10rem)] leading-[0.85]">
              {it.value != null ? <NumberTicker value={it.value} format={it.format} /> : "—"}
            </span>
            <span className="mt-3 block text-lg text-[var(--s-muted)]">{it.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
