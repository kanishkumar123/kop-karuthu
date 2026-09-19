"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Fixtures, Match } from "@/lib/espn";
import { SplitFlap } from "@/components/data/SplitFlap";
import { useCountdown, useLocalDateTime, pad } from "@/lib/useCountdown";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export function NextMatchBoard({ data }: { data: Fixtures }) {
  const root = useRef<HTMLDivElement>(null);
  const { next, recent, table } = data;
  const cd = useCountdown(next?.utcDate);
  const kickoff = useLocalDateTime(next?.utcDate);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".form-chip", {
          rotateY: 180,
          opacity: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: ".form-strip", start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
      {/* Scoreboard */}
      <div className="rounded-[18px] bg-night-2 p-5 ring-1 ring-paper/10 md:p-9">
        {next ? (
          <>
            <p className="text-sm text-paper/60">{next.competition}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-[clamp(2.4rem,7vw,5.5rem)]">
              <Team side={next.home} />
              <span className="text-[0.4em] font-light text-paper/50">vs</span>
              <Team side={next.away} />
            </div>
            <p className="mt-5 text-paper/80">{kickoff || " "}</p>

            <div className="mt-8 border-t border-paper/10 pt-6">
              <p className="mb-3 text-sm text-paper/60">Kick-off in</p>
              <div className="flex flex-wrap items-end gap-4 text-[clamp(2rem,5vw,3.8rem)]">
                <Unit label="days" value={cd ? pad(cd.d) : "--"} />
                <Unit label="hours" value={cd ? pad(cd.h) : "--"} />
                <Unit label="mins" value={cd ? pad(cd.m) : "--"} />
                <Unit label="secs" value={cd ? pad(cd.s) : "--"} />
              </div>
            </div>
            <Link
              href="/live"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-kop px-6 py-3 font-semibold text-paper transition-transform hover:scale-[1.03] active:scale-95"
            >
              <span className="size-2 rounded-full bg-paper animate-pulse-dot" aria-hidden />
              Watch it with us live
            </Link>
          </>
        ) : (
          <p className="text-xl">No fixture scheduled yet. We&rsquo;ll post the next one as soon as it&rsquo;s confirmed.</p>
        )}
      </div>

      {/* Form + table */}
      <div className="flex flex-col justify-between gap-10">
        {table && (
          <div>
            <p className="text-sm text-[var(--s-muted)]">Premier League position</p>
            <p className="display mt-2 text-[clamp(5rem,14vw,11rem)] text-kop">{ordinal(table.position)}</p>
            <p className="mt-2 text-[var(--s-muted)]">
              {table.points} pts from {table.played} games, goal difference {table.goalDifference > 0 ? "+" : ""}
              {table.goalDifference}
            </p>
          </div>
        )}
        {recent.length > 0 && (
          <div>
            <p className="mb-4 text-sm text-[var(--s-muted)]">Last {recent.length} results, most recent first</p>
            <ol className="form-strip flex flex-wrap gap-3" style={{ perspective: 600 }}>
              {recent.map((m) => (
                <FormChip key={m.id} m={m} />
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

function Team({ side }: { side: Match["home"] }) {
  return (
    <span className="inline-flex flex-col items-start">
      <SplitFlap value={side.tla} tileClassName={side.isLfc ? "bg-kop" : undefined} />
      <span className="mt-2 text-[0.2em] font-medium text-paper/70">{side.short}</span>
    </span>
  );
}

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex flex-col items-center">
      <SplitFlap value={value} />
      <span className="mt-1.5 text-[0.26em] text-paper/55">{label}</span>
    </span>
  );
}

function FormChip({ m }: { m: Match }) {
  const opp = m.home.isLfc ? m.away : m.home;
  const venue = m.home.isLfc ? "H" : "A";
  const lfcScore = m.home.isLfc ? m.score?.home : m.score?.away;
  const oppScore = m.home.isLfc ? m.score?.away : m.score?.home;
  const tone = m.result === "W" ? "bg-teal text-night" : m.result === "D" ? "bg-flood text-night" : "bg-kop-deep text-paper";
  const word = m.result === "W" ? "Won" : m.result === "D" ? "Drew" : "Lost";
  return (
    <li
      className={cn("form-chip flex w-[92px] flex-col items-center rounded-xl px-3 py-3 text-center", tone)}
      aria-label={`${word} ${lfcScore}-${oppScore} ${venue === "H" ? "at home to" : "away at"} ${opp.short}`}
    >
      <span className="text-3xl font-black leading-none">{m.result}</span>
      <span className="mt-1.5 text-sm font-bold tabular-nums">
        {lfcScore}–{oppScore}
      </span>
      <span className="mt-0.5 text-xs opacity-80">
        {opp.tla} ({venue})
      </span>
    </li>
  );
}
