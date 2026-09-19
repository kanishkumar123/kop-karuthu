"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { type Legend, type TrophyKey, trophyNames } from "@/content/legends";
import { legends as legendImages } from "@/lib/images";
import { TornPhoto } from "@/components/brand/TornPhoto";
import { TrophyIcon } from "@/components/squad/TrophyIcons";
import { initials } from "@/lib/squadMath";

const order: TrophyKey[] = ["league", "euro", "fa", "leaguecup", "uefa", "super", "cwc"];

/** Torn-paper legend card; flips (hover, focus or tap) to reveal the defining moment. */
export function LegendCard({ legend, seed }: { legend: Legend; seed: number }) {
  const [flipped, setFlipped] = useState(false);
  const img = legendImages[legend.key];
  const trophies = order.filter((k) => legend.trophies[k]);

  return (
    <div
      className="group relative h-[600px] w-[300px] shrink-0 sm:w-[330px] [perspective:1400px]"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <motion.div
        className="relative size-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 170, damping: 22 }}
      >
        {/* Front */}
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-pressed={flipped}
          aria-label={`${legend.name}: show defining moment`}
          className="absolute inset-0 flex flex-col text-left [backface-visibility:hidden]"
        >
          <div className={seed % 2 ? "rotate-[1.5deg]" : "rotate-[-1.5deg]"}>
            {img ? (
              <TornPhoto img={img} seed={seed} className="aspect-[4/5] w-full" sizes="330px" fallback={initials(legend.name)} />
            ) : (
              <div className="relative grid aspect-[4/5] w-full place-items-center bg-ink text-paper">
                <span className="display text-[8rem] leading-none text-kop">{initials(legend.name)}</span>
                <span className="halftone absolute inset-0 bg-kop/40" />
                <span aria-hidden className="tape absolute -top-3 left-[12%] h-7 w-24 -rotate-[8deg]" />
              </div>
            )}
          </div>
          <div className="mt-5 px-1">
            {legend.nickname && <p className="text-sm font-bold text-kop">&ldquo;{legend.nickname}&rdquo;</p>}
            <p className="display text-[2.1rem] leading-[0.92]">{legend.name}</p>
            <p className="mt-1 text-sm text-[var(--s-muted)]">
              {legend.role}, {legend.years}
            </p>
            <p className="mt-3 flex gap-5 text-sm">
              {legend.matches != null ? (
                <span>
                  <b className="text-xl font-black">{legend.matches}</b> matches
                </span>
              ) : (
                <>
                  <span>
                    <b className="text-xl font-black">{legend.apps}</b> apps
                  </span>
                  <span>
                    <b className="text-xl font-black">{legend.goals}</b> goals
                  </span>
                </>
              )}
            </p>
            {legend.statsNote && <p className="text-xs text-[var(--s-muted)]">Stats {legend.statsNote}</p>}
            {trophies.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5" aria-label="Major trophies">
                {trophies.map((k) => (
                  <li key={k} className="flex items-center gap-1 text-kop" title={trophyNames[k]}>
                    <TrophyIcon k={k} className="size-5 [--trophy-bg:var(--color-paper)]" />
                    <span className="text-xs font-bold text-[var(--s-fg)]">×{legend.trophies[k]}</span>
                    <span className="sr-only">{trophyNames[k]}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </button>

        {/* Back */}
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-hidden={!flipped}
          tabIndex={flipped ? 0 : -1}
          className="absolute inset-0 flex flex-col justify-between rounded-[6px] bg-kop p-7 text-left text-paper [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <span className="display text-[5.5rem] leading-[0.8] text-night/25">&ldquo;</span>
          <span className="-mt-10 text-[1.45rem] font-light leading-snug">{legend.moment}</span>
          <span>
            <span className="inline-flex rounded-full bg-paper px-3 py-1.5 text-sm font-bold text-kop">{legend.momentDate}</span>
            <span className="display mt-4 block text-3xl">{legend.name}</span>
          </span>
        </button>
      </motion.div>
    </div>
  );
}
