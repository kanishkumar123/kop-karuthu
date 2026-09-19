import type { Player, PlayerStats, Position } from "@/lib/fpl";
import type { LastXI } from "@/lib/espn";
import { normName as norm } from "@/lib/utils";

export const posLabel: Record<Position, string> = { GK: "Goalkeeper", DEF: "Defender", MID: "Midfielder", FWD: "Forward" };

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .replace(/[^A-Za-zÀ-ž]/g, "")
    .slice(0, 2)
    .toUpperCase();

const per90 = (v: number, mins: number) => (mins > 0 ? (v / mins) * 90 : 0);

export type RadarAxis = { key: string; label: string; value: number; raw: string };

/** Per-90 profile for outfield players, built from FPL data */
function profile(s: PlayerStats) {
  return {
    threat: per90(s.xg, s.minutes),
    creation: per90(s.xa, s.minutes),
    creativity: per90(s.creativity, s.minutes),
    defending: per90(s.defensive, s.minutes),
    involvement: per90(s.influence, s.minutes),
  };
}

/** Normalise each axis against the squad's best (min 90 minutes) so shapes compare fairly. */
export function radarFor(player: Player, season: string, squad: Player[]): RadarAxis[] | null {
  const s = player.stats[season];
  if (!s || s.minutes < 90 || player.position === "GK") return null;
  const pool = squad
    .map((p) => p.stats[season])
    .filter((x): x is PlayerStats => !!x && x.minutes >= 90)
    .map(profile);
  const me = profile(s);
  const max = (k: keyof typeof me) => Math.max(...pool.map((p) => p[k]), 0.0001);
  const axes: [keyof typeof me, string, string][] = [
    ["threat", "Goal threat", `${me.threat.toFixed(2)} xG / 90`],
    ["creation", "Chance creation", `${me.creation.toFixed(2)} xA / 90`],
    ["creativity", "Creativity", `${me.creativity.toFixed(1)} creativity / 90`],
    ["defending", "Defending", `${me.defending.toFixed(1)} def. actions / 90`],
    ["involvement", "Involvement", `${me.involvement.toFixed(1)} influence / 90`],
  ];
  return axes.map(([k, label, raw]) => ({ key: k, label, raw, value: Math.min(1, me[k] / max(k)) }));
}

export type Leader = { label: string; player: Player; value: string };

export function leaders(squad: Player[], season: string): Leader[] {
  const withStats = squad.filter((p) => p.stats[season]);
  const top = (fn: (s: PlayerStats) => number) => withStats.sort((a, b) => fn(b.stats[season]!) - fn(a.stats[season]!))[0];
  const out: Leader[] = [];
  const g = top((s) => s.goals + s.xg / 100);
  if (g && g.stats[season]!.goals > 0) out.push({ label: "Top scorer", player: g, value: `${g.stats[season]!.goals} goals` });
  const a = top((s) => s.assists + s.xa / 100);
  if (a && a.stats[season]!.assists > 0) out.push({ label: "Most assists", player: a, value: `${a.stats[season]!.assists} assists` });
  const m = top((s) => s.minutes);
  if (m && m.stats[season]!.minutes > 0) out.push({ label: "Most minutes", player: m, value: `${m.stats[season]!.minutes.toLocaleString("en")} mins` });
  const d = top((s) => s.defensive);
  if (d && d.stats[season]!.defensive > 0) out.push({ label: "Defensive actions", player: d, value: `${d.stats[season]!.defensive}` });
  return out;
}

export function maxOf(squad: Player[], season: string, key: keyof PlayerStats) {
  return Math.max(1, ...squad.map((p) => Number(p.stats[season]?.[key] ?? 0)));
}

/* ───────────── Last XI on the pitch ───────────── */

/**
 * ESPN position abbreviations → pitch coordinates [x%, y%], attacking upward.
 * Covers back fours/threes/fives, single or double pivots and one/two strikers,
 * so any formation ESPN reports lays out sensibly.
 */
const COORDS: Record<string, [number, number]> = {
  G: [50, 90], GK: [50, 90],
  RB: [84, 72], LB: [16, 72], RWB: [88, 58], LWB: [12, 58],
  "CD-R": [66, 76], "CD-L": [34, 76], CD: [50, 77], CB: [50, 77],
  SW: [50, 82],
  DM: [50, 62], "DM-R": [62, 62], "DM-L": [38, 62],
  "CM-R": [68, 52], "CM-L": [32, 52], CM: [50, 52],
  RM: [84, 44], LM: [16, 44],
  "AM-R": [80, 30], "AM-L": [20, 30], AM: [50, 34],
  RW: [82, 24], LW: [18, 24],
  F: [50, 16], CF: [50, 16], ST: [50, 16], "CF-R": [62, 17], "CF-L": [38, 17], RF: [66, 18], LF: [34, 18],
};

/** ESPN's LM/RM in a 4-2-3-1 are really the double pivot; nudge them when the shape says so. */
function coordsFor(pos: string, formation: string | null): [number, number] {
  const f = formation ?? "";
  if (/^4-2-3-1/.test(f) && (pos === "LM" || pos === "RM")) return pos === "LM" ? [36, 58] : [64, 58];
  return COORDS[pos] ?? [50, 50];
}

export type PitchSpot = { player: Player | null; name: string; jersey: string | null; x: number; y: number };

export function placeXI(xi: LastXI, squad: Player[]): PitchSpot[] {
  const byName = new Map(squad.map((p) => [norm(p.name), p]));
  const byLast = new Map(squad.map((p) => [norm(p.lastName), p]));
  const used = new Map<string, number>();
  return xi.players.map((lp) => {
    const key = norm(lp.name);
    const last = key.split(" ").slice(1).join(" ");
    const player = byName.get(key) ?? byLast.get(last) ?? byLast.get(key.split(" ").pop() ?? "") ?? null;
    const [x0, y] = coordsFor(lp.position, xi.formation);
    let x = x0;
    // Avoid exact overlaps if two players share an abbreviation
    const k = `${x},${y}`;
    const n = used.get(k) ?? 0;
    used.set(k, n + 1);
    if (n) x += n % 2 ? 14 : -14;
    return { player, name: player?.lastName ?? lp.name.split(" ").slice(-1)[0], jersey: lp.jersey, x, y };
  });
}
