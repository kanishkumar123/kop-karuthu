"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Player, PlayerStats, Position } from "@/lib/fpl";
import { initials, posLabel, radarFor } from "@/lib/squadMath";
import { lockScroll } from "@/lib/lenis";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { RadarChart } from "@/components/squad/RadarChart";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";

type Props = {
  player: Player | null;
  /** id of the card that opened the modal — it morphs back into that card on close */
  originId: number | null;
  season: string;
  squad: Player[];
  onClose: () => void;
  onStep: (dir: 1 | -1) => void;
};

type Tab = "season" | "career";
type Tile = { label: string; v: number; decimals?: number };

const posTone: Record<Position, "flood" | "teal" | "paper" | "kop"> = { GK: "flood", DEF: "teal", MID: "paper", FWD: "kop" };

function tilesFor(s: PlayerStats, gk: boolean, extra: Tile[] = []): Tile[] {
  return [
    ...extra,
    ...(s.apps != null ? [{ label: "Appearances", v: s.apps }] : []),
    { label: "Starts", v: s.starts },
    { label: "Minutes", v: s.minutes },
    ...(gk
      ? [
          { label: "Clean sheets", v: s.cleanSheets },
          { label: "Saves", v: s.saves },
          { label: "Goals conceded", v: s.conceded },
        ]
      : [
          { label: "Goals", v: s.goals },
          { label: "Assists", v: s.assists },
          { label: "Expected goals (xG)", v: s.xg, decimals: 2 },
          { label: "Expected assists (xA)", v: s.xa, decimals: 2 },
          { label: "Tackles", v: s.tackles },
          { label: "Clearances, blocks, interceptions", v: s.cbi },
        ]),
    { label: "Yellow cards", v: s.yellow },
  ];
}

function sumCareer(p: Player): PlayerStats {
  const keys: (keyof PlayerStats)[] = [
    "starts", "minutes", "goals", "assists", "xg", "xa", "cleanSheets", "saves", "conceded",
    "tackles", "cbi", "recoveries", "defensive", "yellow", "red", "bonus", "influence", "creativity", "threat",
  ];
  const total = Object.fromEntries(keys.map((k) => [k, 0])) as unknown as PlayerStats;
  for (const { stats } of p.career) for (const k of keys) (total[k] as number) += Number(stats[k] ?? 0);
  total.apps = null; // past seasons don't record appearances
  return total;
}

/** Centred player sheet. Arrow keys / swipe move between players; Esc closes. */
export function PlayerModal({ player, originId, season, squad, onClose, onStep }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [tab, setTab] = useState<Tab>("season");

  useEffect(() => {
    if (!player) return;
    lockScroll(true);
    const last = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
      if (e.key === "Tab" && dialog.current) {
        const f = dialog.current.querySelectorAll<HTMLElement>("button, a[href]");
        if (!f.length) return;
        const first = f[0];
        const lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
      last?.focus?.();
    };
    // only re-run when the modal opens/closes, not on every step
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!player, onClose, onStep]);

  const gk = player?.position === "GK";
  const s = player?.stats[season] ?? null;
  const radar = player ? radarFor(player, season, squad) : null;
  const career = player && player.career.length ? sumCareer(player) : null;
  const maxMins = player ? Math.max(1, ...player.career.map((c) => c.stats.minutes)) : 1;

  return (
    <AnimatePresence>
      {player && (
        <motion.div key="player-modal" className="fixed inset-0 z-[120] grid place-items-center p-3 md:p-8" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
          <motion.div
            className="absolute inset-0 bg-night/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={dialog}
            layoutId={`player-${originId ?? player.id}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-name"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.x < -90) onStep(1);
              else if (info.offset.x > 90) onStep(-1);
            }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="relative z-10 flex max-h-[88svh] w-full max-w-[920px] flex-col overflow-hidden rounded-[24px] bg-night text-paper shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)] ring-1 ring-paper/10"
          >
            {/* Header */}
            <div className="relative shrink-0 overflow-hidden bg-[linear-gradient(160deg,#3a1b21,#150a0c_60%,#8e0b1f_140%)] px-6 pt-5 md:px-10">
              <span
                aria-hidden
                className="display outline-text absolute right-[26%] top-0 text-[13rem] leading-none md:text-[17rem]"
                style={{ ["--outline" as string]: "rgb(247 233 176 / 0.3)" }}
              >
                {player.number ?? ""}
              </span>
              <div className="relative flex items-start justify-between">
                <div className="flex gap-2">
                  <button type="button" onClick={() => onStep(-1)} className="grid size-10 place-items-center rounded-full border border-paper/20 hover:border-kop hover:bg-kop" aria-label="Previous player">
                    ←
                  </button>
                  <button type="button" onClick={() => onStep(1)} className="grid size-10 place-items-center rounded-full border border-paper/20 hover:border-kop hover:bg-kop" aria-label="Next player">
                    →
                  </button>
                </div>
                <button ref={closeRef} type="button" onClick={onClose} className="rounded-full bg-paper px-5 py-2.5 text-sm font-semibold text-ink hover:bg-kop hover:text-paper">
                  Close
                </button>
              </div>

              <div className="relative grid grid-cols-[1fr_auto] items-end gap-2">
                <motion.div key={player.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="pb-7 pt-6">
                  <div className="flex flex-wrap gap-2">
                    <Pill tone={posTone[player.position]} dot>
                      {posLabel[player.position]}
                    </Pill>
                    {player.availability !== "available" && (
                      <Pill tone="glass" className="text-flood">
                        {player.availability[0].toUpperCase() + player.availability.slice(1)}
                      </Pill>
                    )}
                  </div>
                  <p className="mt-4 text-lg font-medium text-paper/75">{player.firstName}</p>
                  <h2 id="player-name" className="display text-[clamp(2.6rem,6.5vw,5rem)]">
                    {player.lastName}
                  </h2>
                  <p className="mt-2 text-paper/65">
                    {[player.number ? `No. ${player.number}` : "", player.age ? `${player.age} years old` : ""].filter(Boolean).join(", ")}
                  </p>
                  {player.news && <p className="mt-3 max-w-sm text-sm text-flood">{player.news}</p>}
                </motion.div>
                <motion.div
                  key={`photo-${player.id}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 24 }}
                  className="relative h-64 w-52 self-end sm:h-80 sm:w-64 md:h-[22rem] md:w-72"
                >
                  {player.photo ? (
                    <Image
                      src={player.photo.src}
                      alt={player.photo.alt}
                      fill
                      sizes="300px"
                      unoptimized={player.photo.kind === "photo"}
                      className={
                        player.photo.kind === "cutout"
                          ? "object-contain object-bottom drop-shadow-[0_24px_28px_rgb(0_0_0/0.6)]"
                          : "rounded-t-2xl object-cover object-top grayscale contrast-125"
                      }
                    />
                  ) : (
                    <span className="display absolute bottom-8 right-4 grid size-40 place-items-center rounded-full bg-kop/25 text-6xl ring-2 ring-kop/50">
                      {initials(player.name)}
                    </span>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-paper/10 px-6 py-3 md:px-10">
              <div role="tablist" aria-label="Stats view" className="relative flex rounded-full bg-night-2 p-1 ring-1 ring-paper/10">
                {(
                  [
                    ["season", "This season", ` (${season})`],
                    ["career", "PL career", ""],
                  ] as const
                ).map(([k, label, extra]) => (
                  <button
                    key={k}
                    role="tab"
                    aria-selected={tab === k}
                    onClick={() => setTab(k)}
                    className={cn("relative rounded-full px-4 py-2 text-sm font-semibold transition-colors", tab === k ? "text-paper" : "text-paper/65 hover:text-paper")}
                  >
                    {tab === k && <motion.span layoutId="stats-tab" className="absolute inset-0 rounded-full bg-kop" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                    <span className="relative whitespace-nowrap">
                      {label}
                      <span className="hidden sm:inline">{extra}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Body (scrolls) */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-7 md:px-10" data-lenis-prevent>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${tab}-${player.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  {tab === "season" ? (
                    s ? (
                      <>
                        <StatGrid tiles={tilesFor(s, gk)} />
                        {radar && (
                          <div className="mt-10 grid items-center gap-6 md:grid-cols-[1fr_1fr]">
                            <RadarChart axes={radar} />
                            <ul className="space-y-3 text-sm">
                              {radar.map((a) => (
                                <li key={a.key} className="flex items-baseline justify-between gap-3 border-b border-paper/10 pb-2">
                                  <span className="font-semibold">{a.label}</span>
                                  <span className="text-right text-paper/60">{a.raw}</span>
                                </li>
                              ))}
                              <li className="pt-1 text-xs text-paper/50">Shape compares per-90 output with the rest of the squad (min. 90 minutes).</li>
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="rounded-2xl bg-paper/5 p-6 text-lg">
                        No Premier League minutes for {player.firstName} {player.lastName} in {season}. Try the career tab.
                      </p>
                    )
                  ) : career ? (
                    <>
                      {/* Only stats FPL has recorded for every season (starts, xG and tackles only exist for recent ones) */}
                      <StatGrid
                        tiles={[
                          { label: "PL seasons", v: player.career.length },
                          { label: "Minutes", v: career.minutes },
                          ...(gk
                            ? [
                                { label: "Clean sheets", v: career.cleanSheets },
                                { label: "Saves", v: career.saves },
                                { label: "Goals conceded", v: career.conceded },
                              ]
                            : [
                                { label: "Goals", v: career.goals },
                                { label: "Assists", v: career.assists },
                                { label: "Clean sheets", v: career.cleanSheets },
                              ]),
                          { label: "Yellow cards", v: career.yellow },
                          { label: "Red cards", v: career.red },
                        ]}
                      />
                      <h3 className="mt-10 text-sm font-semibold text-paper/60">Season by season</h3>
                      <ul className="mt-3 divide-y divide-paper/10 rounded-2xl ring-1 ring-paper/10">
                        {[...player.career].reverse().map((c) => (
                          <li key={c.season} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-4 px-4 py-3 text-sm">
                            <span className="font-semibold tabular-nums">{c.season}</span>
                            <span className="relative h-1.5 overflow-hidden rounded-full bg-paper/10" aria-hidden>
                              <motion.span
                                className="absolute inset-y-0 left-0 rounded-full bg-kop"
                                initial={{ width: 0 }}
                                animate={{ width: `${(c.stats.minutes / maxMins) * 100}%` }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                              />
                            </span>
                            <span className="whitespace-nowrap text-right tabular-nums text-paper/75">
                              {c.stats.minutes.toLocaleString("en")} mins,{" "}
                              {gk ? `${c.stats.cleanSheets} clean sheets` : `${c.stats.goals} G, ${c.stats.assists} A`}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-xs text-paper/50">Premier League matches only, across all clubs.</p>
                    </>
                  ) : (
                    <p className="rounded-2xl bg-paper/5 p-6 text-lg">
                      {player.firstName} {player.lastName} hasn&rsquo;t played a Premier League minute yet.
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
              <p className="mt-8 text-xs text-paper/40">Use the arrow keys or swipe to move between players. Stats: official Fantasy Premier League data.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-paper/10 sm:grid-cols-3 lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="bg-night p-4">
          <dt className="text-xs leading-snug text-paper/60">{t.label}</dt>
          <dd className="mt-1 text-3xl font-black">
            <NumberTicker value={t.v} decimals={t.decimals ?? 0} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
