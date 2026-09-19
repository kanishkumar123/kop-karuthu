"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion } from "motion/react";
import type { Player, Position } from "@/lib/fpl";
import { initials, posLabel } from "@/lib/squadMath";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";

type Props = {
  player: Player;
  season: string;
  max: { apps: number; goals: number; assists: number };
  onOpen: (p: Player) => void;
};

const posTone: Record<Position, "flood" | "teal" | "paper" | "kop"> = { GK: "flood", DEF: "teal", MID: "paper", FWD: "kop" };
const availabilityLabel = { injured: "Injured", doubtful: "Doubtful", suspended: "Suspended" } as const;

/** Matchday-programme collectible: outlined shirt number, big cut-out photo, holo foil + tilt that follow the pointer. */
export function PlayerCard({ player, season, max, onOpen }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const s = player.stats[season];

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.setProperty("--rx", `${(0.5 - y) * 12}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 14}deg`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const bars = [
    { label: s && s.apps == null ? "Starts" : "Apps", v: s?.apps ?? s?.starts ?? 0, m: max.apps },
    { label: "Goals", v: s?.goals ?? 0, m: max.goals },
    { label: "Assists", v: s?.assists ?? 0, m: max.assists },
  ];
  const cutout = player.photo?.kind === "cutout";

  return (
    <motion.button
      ref={ref}
      layoutId={`player-${player.id}`}
      type="button"
      onClick={() => onOpen(player)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="group relative block w-full text-left [perspective:900px]"
      aria-label={`${player.name}, ${posLabel[player.position]}${player.number ? `, number ${player.number}` : ""}. Open stats`}
    >
      <div
        className="relative aspect-[3/4.3] overflow-hidden rounded-[18px] bg-[linear-gradient(165deg,#3a1b21_0%,#150a0c_58%,#8e0b1f_150%)] ring-1 ring-paper/10 transition-[transform,box-shadow] duration-300 ease-out will-change-transform group-hover:shadow-[0_30px_60px_-25px_rgb(224_16_47/0.55)]"
        style={{ transform: "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))" }}
      >
        {/* Shirt number */}
        <span
          aria-hidden
          className="display outline-text absolute -right-2 top-1 text-[8.5rem] leading-none opacity-50 transition-opacity group-hover:opacity-80"
          style={{ ["--outline" as string]: "rgb(247 233 176 / 0.6)" }}
        >
          {player.number ?? ""}
        </span>

        {/* Photo */}
        {player.photo ? (
          cutout ? (
            <div className="absolute inset-x-[-6%] bottom-[27%] top-[6%]">
              <Image
                src={player.photo.src}
                alt={player.photo.alt}
                fill
                sizes="(min-width:1280px) 22vw, (min-width:1024px) 26vw, (min-width:640px) 36vw, 55vw"
                className="object-contain object-bottom drop-shadow-[0_20px_24px_rgb(0_0_0/0.55)] transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
          ) : (
            <div className="absolute inset-0">
              <Image
                src={player.photo.src}
                alt={player.photo.alt}
                fill
                unoptimized
                sizes="(min-width:1024px) 22vw, 50vw"
                className="object-cover object-top grayscale contrast-125 transition-transform duration-500 group-hover:scale-[1.04]"
              />
              {/* Non-cutout fallback photos get a club-red duotone so they sit with the rest */}
              <div className="absolute inset-0 bg-kop/45 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-b from-night/30 via-transparent to-night" />
            </div>
          )
        ) : (
          <span className="absolute inset-x-0 top-[18%] grid place-items-center">
            <span className="display grid size-28 place-items-center rounded-full bg-kop/20 text-5xl text-paper/80 ring-2 ring-kop/40">
              {initials(player.name)}
            </span>
          </span>
        )}

        {/* Pills */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <Pill tone={posTone[player.position]} dot size="xs">
            {posLabel[player.position]}
          </Pill>
          {player.availability !== "available" && (
            <Pill tone="glass" size="xs" className="text-flood">
              {availabilityLabel[player.availability]}
            </Pill>
          )}
        </div>

        {/* Name + bars */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night via-night/95 to-transparent px-4 pb-4 pt-12">
          <p className="truncate text-[13px] font-medium leading-tight text-paper/70">{player.firstName}</p>
          <p
            className={cn(
              "display truncate leading-[0.95] text-paper",
              // shrink long surnames (Mamardashvili, Szoboszlai…) so they fit without clipping
              player.lastName.length > 11
                ? "text-[1.05rem] sm:text-[1.3rem]"
                : player.lastName.length > 8
                  ? "text-[1.3rem] sm:text-[1.55rem]"
                  : "text-[1.55rem] sm:text-[1.75rem]",
            )}
          >
            {player.lastName}
          </p>
          <div className="mt-3 space-y-1.5">
            {bars.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-[11px] text-paper/70">
                <span className="w-12 shrink-0">{b.label}</span>
                <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-paper/10">
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full bg-kop"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min(100, (b.v / b.m) * 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                  />
                </span>
                <span className="w-6 shrink-0 text-right font-semibold tabular-nums text-paper">{s ? b.v : "–"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Holo foil */}
        <span aria-hidden className="holo pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </motion.button>
  );
}
