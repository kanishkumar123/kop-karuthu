"use client";

import { useCallback, useMemo, useState } from "react";
import { LayoutGroup, motion, AnimatePresence } from "motion/react";
import type { Player, Position, Squad } from "@/lib/fpl";
import type { LastXI } from "@/lib/espn";
import { maxOf } from "@/lib/squadMath";
import { PlayerCard } from "@/components/squad/PlayerCard";
import { PlayerModal } from "@/components/squad/PlayerModal";
import { FormationBoard } from "@/components/squad/FormationBoard";
import { StatLeaders } from "@/components/squad/StatLeaders";
import { cn } from "@/lib/utils";

const filters: (Position | "ALL")[] = ["ALL", "GK", "DEF", "MID", "FWD"];
const filterLabel = { ALL: "Everyone", GK: "Keepers", DEF: "Defenders", MID: "Midfielders", FWD: "Forwards" } as const;

export function SquadRoster({ squad, xi }: { squad: Squad; xi: LastXI | null }) {
  const [season, setSeason] = useState(squad.seasons[0]);
  const [filter, setFilter] = useState<Position | "ALL">("ALL");
  const [open, setOpen] = useState<{ id: number; origin: number } | null>(null);

  const players = squad.players;
  const visible = useMemo(() => (filter === "ALL" ? players : players.filter((p) => p.position === filter)), [players, filter]);
  const max = useMemo(
    () => ({
      apps: Math.max(1, ...players.map((p) => p.stats[season]?.apps ?? p.stats[season]?.starts ?? 0)),
      goals: maxOf(players, season, "goals"), assists: maxOf(players, season, "assists"),
    }),
    [players, season],
  );
  const hasStats = players.some((p) => p.stats[season]);

  const openPlayer = useCallback((p: Player) => setOpen({ id: p.id, origin: p.id }), []);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setOpen((cur) => {
        if (!cur) return cur;
        const list = visible.some((p) => p.id === cur.id) ? visible : players;
        const i = list.findIndex((p) => p.id === cur.id);
        const next = list[(i + dir + list.length) % list.length];
        return { id: next.id, origin: cur.origin };
      }),
    [visible, players],
  );
  const current = open ? players.find((p) => p.id === open.id) ?? null : null;

  return (
    <LayoutGroup>
      {/* Season toggle */}
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 md:px-8">
        <p className="text-paper/60">
          {players.length} players. Stats are Premier League only{hasStats ? "" : `, none recorded for ${season} yet`}.
        </p>
        <div role="radiogroup" aria-label="Season" className="relative flex rounded-full bg-night-2 p-1 ring-1 ring-paper/10">
          {squad.seasons.map((s) => (
            <button
              key={s}
              role="radio"
              aria-checked={season === s}
              onClick={() => setSeason(s)}
              className="relative rounded-full px-5 py-2 text-sm font-semibold"
            >
              {season === s && <motion.span layoutId="season-pill" className="absolute inset-0 rounded-full bg-kop" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="relative">{s} season</span>
            </button>
          ))}
        </div>
      </div>

      {xi && <FormationBoard squad={players} xi={xi} onOpen={openPlayer} />}

      {/* Roster */}
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        {/* sticky filter is scoped to the grid so it lets go before "Leading the way" */}
        <div>
        <div className="sticky top-[5.5rem] z-30 -mx-2 flex overflow-x-auto px-2 py-2 no-scrollbar">
          <div role="tablist" aria-label="Filter by position" className="relative flex gap-1 rounded-full bg-night/85 p-1 ring-1 ring-paper/10 backdrop-blur">
            {filters.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={cn("relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors", filter === f ? "text-night" : "text-paper/75 hover:text-paper")}
              >
                {filter === f && <motion.span layoutId="pos-pill" className="absolute inset-0 rounded-full bg-flood" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <span className="relative">{filterLabel[f]}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.ul layout className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence mode="popLayout">
            {visible.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
              >
                <PlayerCard player={p} season={season} max={max} onOpen={openPlayer} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
        </div>

        {hasStats && (
          <div className="mt-24">
            <h2 className="display mb-8 text-[clamp(2.4rem,5vw,4.5rem)]">
              Leading <span className="text-kop">the way</span>
            </h2>
            <StatLeaders squad={players} season={season} onOpen={openPlayer} />
          </div>
        )}
        <p className="mt-10 text-sm text-paper/45">Squad and Premier League stats from the official Fantasy Premier League data, photos from premierleague.com, line-up from ESPN. Updated through the day.</p>
      </div>

      <PlayerModal player={current} originId={open?.origin ?? null} season={season} squad={players} onClose={close} onStep={step} />
    </LayoutGroup>
  );
}
