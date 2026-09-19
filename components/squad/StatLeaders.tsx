"use client";

import { motion } from "motion/react";
import type { Player } from "@/lib/fpl";
import { leaders } from "@/lib/squadMath";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";

/** Podium-style leader cards that rise to staggered heights. */
export function StatLeaders({ squad, season, onOpen }: { squad: Player[]; season: string; onOpen: (p: Player) => void }) {
  const list = leaders(squad, season);
  if (!list.length) return null;
  const heights = ["md:mt-0", "md:mt-10", "md:mt-5", "md:mt-14"];
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      {list.map((l, i) => (
        <motion.button
          key={l.label}
          type="button"
          onClick={() => onOpen(l.player)}
          initial={{ y: 80, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ type: "spring", stiffness: 140, damping: 18, delay: i * 0.08 }}
          whileHover={{ y: -6 }}
          className={`${heights[i]} group relative overflow-hidden rounded-[16px] bg-kop p-5 text-left text-paper`}
        >
          <p className="text-sm font-semibold text-paper/80">{l.label}</p>
          <p className="display mt-2 text-4xl leading-none">{l.value}</p>
          <div className="mt-6 flex items-center gap-3">
            <PlayerAvatar player={l.player} size={52} className="bg-night/30 ring-2 ring-paper/40" />
            <span className="leading-tight">
              <span className="block text-xs text-paper/75">{l.player.firstName}</span>
              <span className="block font-bold">{l.player.lastName}</span>
            </span>
          </div>
          <span aria-hidden className="display pointer-events-none absolute -bottom-6 -right-2 text-[7rem] leading-none text-night/15 transition-transform duration-500 group-hover:-translate-y-2">
            {l.player.number ?? ""}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
