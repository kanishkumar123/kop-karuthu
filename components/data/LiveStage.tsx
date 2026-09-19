"use client";

import Image from "next/image";
import type { LiveStatus } from "@/lib/youtube";
import type { Match } from "@/lib/espn";
import { SplitFlap } from "@/components/data/SplitFlap";
import { useCountdown, useLocalDateTime, pad } from "@/lib/useCountdown";
import { site } from "@/content/site";
import { splitTitle } from "@/lib/utils";

/** Main stage on /live: embedded stream when live, a countdown when scheduled, otherwise the next fixture. */
export function LiveStage({ status, next }: { status: LiveStatus; next: Match | null }) {
  const target = status.state === "upcoming" ? status.video.scheduledStart : status.state === "idle" ? next?.utcDate : null;
  const cd = useCountdown(target);
  const when = useLocalDateTime(target);

  if (status.state === "live") {
    const t = splitTitle(status.video.title);
    return (
      <div>
        <div className="spin-border relative rounded-[20px] p-1.5" style={{ background: "conic-gradient(from var(--a,0deg), #e0102f, #150a0c 30%, #e0102f 60%, #150a0c 80%, #e0102f)" }}>
          <div className="relative aspect-video overflow-hidden rounded-[15px] bg-night">
            <iframe
              className="absolute inset-0 size-full"
              src={`https://www.youtube-nocookie.com/embed/${status.video.id}?autoplay=1&mute=1&rel=0`}
              title={status.video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <span className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full bg-kop px-3 py-1.5 text-sm font-bold text-paper">
            <span className="size-2 rounded-full bg-paper animate-pulse-dot" /> On air
          </span>
        </div>
        <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-3xl text-3xl font-extrabold leading-tight md:text-4xl">{t.hook}</h2>
          <a
            href={`https://www.youtube.com/live_chat?v=${status.video.id}`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full bg-kop px-7 py-4 text-lg font-semibold text-paper transition-transform hover:scale-[1.03]"
          >
            Join the live chat
          </a>
        </div>
      </div>
    );
  }

  if (status.state === "upcoming") {
    const v = status.video;
    const t = splitTitle(v.title);
    return (
      <div className="grid gap-8 overflow-hidden rounded-[20px] bg-night-2 ring-1 ring-paper/10 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative aspect-video lg:aspect-auto">
          {v.thumbnail && <Image src={v.thumbnail} alt="" fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />}
          <span className="absolute left-5 top-5 rounded-full bg-flood px-3 py-1.5 text-sm font-bold text-night">Scheduled</span>
        </div>
        <div className="p-6 md:p-10">
          <p className="text-paper/60">Next watchalong</p>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight">{t.hook}</h2>
          {t.rest && <p className="mt-2 text-sm uppercase tracking-wide text-paper/60">{t.rest}</p>}
          <p className="mt-5 text-paper/80">{when || " "}</p>
          <Countdown cd={cd} />
          <a
            href={`https://www.youtube.com/watch?v=${v.id}`}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex rounded-full bg-kop px-7 py-4 font-semibold text-paper transition-transform hover:scale-[1.03]"
          >
            Set a reminder on YouTube
          </a>
        </div>
      </div>
    );
  }

  // idle
  return (
    <div className="rounded-[20px] bg-night-2 p-6 ring-1 ring-paper/10 md:p-12">
      <p className="flex items-center gap-3 text-paper/60">
        <span className="size-2.5 rounded-full bg-paper/30" /> Not live right now
      </p>
      {next ? (
        <>
          <h2 className="display mt-5 text-[clamp(2.6rem,6vw,5rem)]">
            {next.home.short} <span className="text-paper/40">vs</span> {next.away.short}
          </h2>
          <p className="mt-3 text-paper/80">
            {next.competition}. {when}
          </p>
          <Countdown cd={cd} />
          <p className="mt-8 max-w-xl text-paper/70">
            We usually go live for the watchalong around kick-off. Subscribe with notifications on and YouTube will tell you when we start.
          </p>
        </>
      ) : (
        <p className="mt-5 max-w-2xl text-2xl font-semibold leading-snug">
          We go live on YouTube for Liverpool matches. Turn on notifications and YouTube will tell you when we start.
        </p>
      )}
      <a
        href={site.subscribeUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex rounded-full bg-kop px-7 py-4 font-semibold text-paper transition-transform hover:scale-[1.03]"
      >
        Subscribe with notifications
      </a>
    </div>
  );
}

function Countdown({ cd }: { cd: ReturnType<typeof useCountdown> }) {
  const units: [string, string][] = [
    ["days", cd ? pad(cd.d) : "--"],
    ["hours", cd ? pad(cd.h) : "--"],
    ["mins", cd ? pad(cd.m) : "--"],
    ["secs", cd ? pad(cd.s) : "--"],
  ];
  return (
    <div className="mt-8 flex flex-wrap gap-4 text-[clamp(2rem,5vw,3.6rem)]">
      {units.map(([label, v]) => (
        <span key={label} className="inline-flex flex-col items-center">
          <SplitFlap value={v} />
          <span className="mt-1.5 text-[0.26em] text-paper/55">{label}</span>
        </span>
      ))}
    </div>
  );
}
