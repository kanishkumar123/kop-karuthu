"use client";

import { formations } from "@/lib/formations";
import { KITS, type Side } from "@/components/tactics/types";
import type { TeamChoice } from "@/components/tactics/TacticsBoard";
import { cn } from "@/lib/utils";

/** Club, shape and spotlight controls for one side of the board. */
export function TeamPanel({
  side,
  team,
  teams,
  formation,
  dimmed,
  shirt,
  onTeam,
  onFormation,
  onDim,
  onShirt,
  compact = false,
  className = "",
}: {
  side: Side;
  team: TeamChoice;
  teams: TeamChoice[];
  formation: string;
  dimmed: Side | null;
  /** Kit-colour override for the whole team, or null for the club's own colour */
  shirt: string | null;
  onTeam: (t: TeamChoice) => void;
  onFormation: (key: string) => void;
  onDim: (s: Side | null) => void;
  onShirt: (c: string | null) => void;
  compact?: boolean;
  className?: string;
}) {
  const other: Side = side === "a" ? "b" : "a";
  const focused = dimmed === other;

  return (
    <div className={cn("rounded-[16px] bg-night-2/90 p-3.5 ring-1 ring-paper/12 backdrop-blur", className)}>
      <div className="flex items-center gap-2">
        <span aria-hidden className="size-3 shrink-0 rounded-full ring-1 ring-paper/40" style={{ background: shirt ?? team.color }} />
        <p className="truncate text-sm font-semibold">{side === "a" ? "Bottom" : "Top"} team</p>
      </div>

      <label className="mt-3 block text-xs text-paper/55">
        Club
        <select
          value={team.key}
          onChange={(e) => {
            const next = teams.find((t) => t.key === e.target.value);
            if (next) onTeam(next);
          }}
          className="mt-1 w-full rounded-lg bg-night px-2.5 py-2 text-sm text-paper ring-1 ring-paper/15 outline-none focus:ring-kop"
        >
          {teams.map((t) => (
            <option key={t.key} value={t.key}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-3 block text-xs text-paper/55">
        Formation
        <select
          value={formation}
          onChange={(e) => onFormation(e.target.value)}
          className="mt-1 w-full rounded-lg bg-night px-2.5 py-2 text-sm text-paper ring-1 ring-paper/15 outline-none focus:ring-kop"
        >
          {formations.map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-3">
        <p className="text-xs text-paper/55">Team colour</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            aria-pressed={shirt === null}
            title="The club's own colour"
            onClick={() => onShirt(null)}
            className={cn("size-6 rounded-full ring-2", shirt === null ? "ring-paper" : "ring-paper/25")}
            style={{ background: team.color }}
          />
          {KITS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Use ${c}`}
              aria-pressed={shirt === c}
              onClick={() => onShirt(c)}
              className={cn("size-6 rounded-full ring-2 transition-transform", shirt === c ? "scale-110 ring-paper" : "ring-paper/25")}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-pressed={focused}
        onClick={() => onDim(focused ? null : other)}
        className={cn(
          "mt-3 w-full rounded-lg px-2.5 py-2 text-xs font-semibold ring-1 transition-colors",
          focused ? "bg-kop text-paper ring-kop" : "bg-night text-paper/75 ring-paper/15 hover:text-paper",
        )}
      >
        {focused ? "Showing this team" : "Focus this team"}
      </button>

    </div>
  );
}
