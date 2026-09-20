import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheFailure } from "@/lib/cacheFail";
import { getJerseyNumbers, type LastXI, type LineupPlayer } from "@/lib/espn";
import { normName } from "@/lib/utils";
import { squadOverrides } from "@/lib/images";
import { fetchRetry } from "@/lib/retry";

/**
 * Official Fantasy Premier League API (no key). Premier League stats only.
 * Squad + current-season totals from bootstrap-static; per-gameweek history
 * (for appearances) and last-season totals from element-summary.
 */
const FPL = "https://fantasy.premierleague.com/api";
const UA = { "User-Agent": "Mozilla/5.0 (KopKaruthu site)" };
const PL_PHOTO = (code: number) => `https://resources.premierleague.com/premierleague25/photos/players/500x500/${code}.png`;

export type Position = "GK" | "DEF" | "MID" | "FWD";
export type Availability = "available" | "injured" | "doubtful" | "suspended";

export type PlayerStats = {
  /** null when the source doesn't record appearances (past seasons) */
  apps: number | null;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  xg: number;
  xa: number;
  cleanSheets: number;
  saves: number;
  conceded: number;
  tackles: number;
  cbi: number;
  recoveries: number;
  defensive: number;
  yellow: number;
  red: number;
  bonus: number;
  influence: number;
  creativity: number;
  threat: number;
};

export type PlayerPhoto = { src: string; alt: string; kind: "cutout" | "photo" };

export type Player = {
  id: number;
  code: number;
  firstName: string;
  lastName: string;
  name: string;
  number: number | null;
  position: Position;
  age: number | null;
  availability: Availability;
  news: string;
  photo: PlayerPhoto | null;
  stats: Record<string, PlayerStats | null>;
  /** Every Premier League season this player has played (any club), oldest first, including the current one */
  career: { season: string; stats: PlayerStats }[];
};

export type Squad = { players: Player[]; seasons: string[] };

/* eslint-disable @typescript-eslint/no-explicit-any */
async function fpl<T>(path: string): Promise<T> {
  const res = await fetchRetry(`${FPL}${path}`, { headers: UA });
  if (!res.ok) throw new Error(`fpl ${path} ${res.status}`);
  return res.json() as Promise<T>;
}

const POS: Record<number, Position> = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };
const f = (v: any) => Number(v) || 0;

function statsFrom(src: any, apps: number | null): PlayerStats {
  return {
    apps,
    starts: f(src.starts),
    minutes: f(src.minutes),
    goals: f(src.goals_scored),
    assists: f(src.assists),
    xg: f(src.expected_goals),
    xa: f(src.expected_assists),
    cleanSheets: f(src.clean_sheets),
    saves: f(src.saves),
    conceded: f(src.goals_conceded),
    tackles: f(src.tackles),
    cbi: f(src.clearances_blocks_interceptions),
    recoveries: f(src.recoveries),
    defensive: f(src.defensive_contribution),
    yellow: f(src.yellow_cards),
    red: f(src.red_cards),
    bonus: f(src.bonus),
    influence: f(src.influence),
    creativity: f(src.creativity),
    threat: f(src.threat),
  };
}

function availability(status: string): Availability {
  if (status === "i") return "injured";
  if (status === "d") return "doubtful";
  if (status === "s") return "suspended";
  return "available";
}

function ageFrom(birth: string | null, now: number) {
  if (!birth) return null;
  return Math.floor((now - new Date(birth).getTime()) / (365.25 * 86_400_000));
}

const seasonLabel = (y: number) => `${y}/${String((y + 1) % 100).padStart(2, "0")}`;

/** Run async jobs with limited concurrency (be polite to the FPL servers). */
async function pool<T, R>(items: T[], size: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (i < items.length) {
        const k = i++;
        out[k] = await fn(items[k]);
      }
    }),
  );
  return out;
}

/* ───────────── photos: official PL cutout → Wikipedia photo → none ───────────── */

async function resolvePhoto(code: number, name: string): Promise<PlayerPhoto | null> {
  "use cache";
  cacheTag("player-photos");
  try {
    const head = await fetch(PL_PHOTO(code), { method: "HEAD", headers: UA });
    cacheLife("days");
    if (head.ok) return { src: PL_PHOTO(code), alt: name, kind: "cutout" };
    const u =
      "https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrlimit=1&prop=pageimages|description&piprop=thumbnail&pithumbsize=800&gsrsearch=" +
      encodeURIComponent(`${name} footballer`);
    const j: any = await (await fetch(u, { headers: { "User-Agent": "KopKaruthuSite/1.0 (fan site)" } })).json();
    const page: any = Object.values(j.query?.pages ?? {})[0];
    const src: string | undefined = page?.thumbnail?.source;
    if (src && /footballer/i.test(page?.description ?? "")) return { src: src.split("?")[0], alt: name, kind: "photo" };
    return null;
  } catch (e) {
    cacheFailure("player photo", e);
    return null;
  }
}

/* ───────────── squad ───────────── */

async function buildSquad(): Promise<Squad | null> {
  "use cache";
  cacheTag("fpl-squad");
  try {
    const boot = await fpl<any>("/bootstrap-static/");
    const team = boot.teams.find((t: any) => t.name === "Liverpool");
    if (!team) throw new Error("Liverpool not found in FPL teams");
    const firstDeadline = boot.events?.[0]?.deadline_time;
    const startYear = firstDeadline ? new Date(firstDeadline).getUTCFullYear() : new Date().getUTCFullYear();
    const seasons = [seasonLabel(startYear), seasonLabel(startYear - 1)];
    const now = Date.now();

    const elements = boot.elements.filter((e: any) => e.team === team.id && e.status !== "u");
    const [numbers, summaries, photos] = await Promise.all([
      getJerseyNumbers(),
      pool(elements, 6, (e: any) => fpl<any>(`/element-summary/${e.id}/`).catch(() => null)),
      pool(elements, 6, (e: any) => resolvePhoto(e.code, `${e.first_name} ${e.second_name}`)),
    ]);

    let partial = false;
    const players: Player[] = elements.map((e: any, i: number) => {
      const sum = summaries[i];
      if (!sum) partial = true;
      const apps = sum ? sum.history.filter((h: any) => f(h.minutes) > 0).length : f(e.starts);
      const past = sum?.history_past?.find((h: any) => h.season_name === seasons[1]);
      const name = `${e.first_name} ${e.second_name}`;
      const override = squadOverrides[e.code];
      return {
        id: e.id,
        code: e.code,
        firstName: e.first_name,
        lastName: e.second_name,
        name,
        number: numbers[normName(name)] ?? e.squad_number ?? null,
        position: POS[e.element_type] ?? "MID",
        age: ageFrom(e.birth_date, now),
        availability: availability(e.status),
        news: e.news ?? "",
        photo: override ? { src: override.src, alt: override.alt, kind: "cutout" } : photos[i],
        stats: {
          [seasons[0]]: statsFrom(e, apps),
          // FPL doesn't record past-season appearances, only starts + minutes
          [seasons[1]]: past ? statsFrom(past, null) : null,
        },
        career: [
          ...(sum?.history_past ?? []).map((h: any) => ({ season: h.season_name as string, stats: statsFrom(h, null) })),
          ...(f(e.minutes) > 0 ? [{ season: seasons[0], stats: statsFrom(e, apps) }] : []),
        ],
      };
    });

    const order: Position[] = ["GK", "DEF", "MID", "FWD"];
    players.sort((a, b) => order.indexOf(a.position) - order.indexOf(b.position) || (a.number ?? 99) - (b.number ?? 99));
    if (partial) cacheLife({ stale: 60, revalidate: 120, expire: 600 });
    else cacheLife("hours");
    return { players, seasons };
  } catch (e) {
    cacheFailure("fpl squad", e);
    return null;
  }
}

export const getSquad = () => buildSquad();

/* ───────────── fallback XI (used when ESPN's lineup is unavailable) ───────────── */

/** Spread N outfield players of one line across sensible pitch slots. */
const LINE_SLOTS: Record<string, Record<number, string[]>> = {
  DEF: { 3: ["CD-L", "CD", "CD-R"], 4: ["LB", "CD-L", "CD-R", "RB"], 5: ["LWB", "CD-L", "CD", "CD-R", "RWB"] },
  MID: { 2: ["CM-L", "CM-R"], 3: ["CM-L", "CM", "CM-R"], 4: ["LM", "CM-L", "CM-R", "RM"], 5: ["LM", "CM-L", "CM", "CM-R", "RM"] },
  FWD: { 1: ["F"], 2: ["CF-L", "CF-R"], 3: ["LW", "F", "RW"], 4: ["LW", "CF-L", "CF-R", "RW"] },
};
const slotsFor = (line: "DEF" | "MID" | "FWD", n: number) =>
  LINE_SLOTS[line][n] ?? Array.from({ length: n }, (_, i) => (i === 0 ? line === "FWD" ? "F" : "CM" : `${line}-${i}`));

/**
 * Starting XI from the most recent finished Premier League gameweek, straight from
 * FPL. Less precise than ESPN's real formation (FPL positions are fantasy positions),
 * but it means the pitch is never empty just because one API had a bad minute.
 */
export async function getLastGwXI(): Promise<LastXI | null> {
  "use cache";
  cacheTag("fpl-xi");
  try {
    const boot = await fpl<any>("/bootstrap-static/");
    const team = boot.teams.find((t: any) => t.name === "Liverpool");
    const finished = (boot.events ?? []).filter((e: any) => e.finished);
    const gw = finished[finished.length - 1];
    if (!team || !gw) throw new Error("no finished gameweek");

    const [live, fixtures] = await Promise.all([
      fpl<any>(`/event/${gw.id}/live/`),
      fpl<any>(`/fixtures/?event=${gw.id}`),
    ]);
    const fixture = (fixtures ?? []).find((x: any) => x.team_h === team.id || x.team_a === team.id);
    if (!fixture) throw new Error("no fixture for Liverpool that week");
    const home = fixture.team_h === team.id;
    const oppId = home ? fixture.team_a : fixture.team_h;
    const opponent = boot.teams.find((t: any) => t.id === oppId)?.name ?? "";

    const byId = new Map<number, any>(boot.elements.map((e: any) => [e.id, e]));
    const starters = (live.elements ?? [])
      .filter((e: any) => e.stats?.starts === 1 && byId.get(e.id)?.team === team.id)
      .map((e: any) => byId.get(e.id));

    const lines: Record<Position, any[]> = { GK: [], DEF: [], MID: [], FWD: [] };
    for (const p of starters) lines[POS[p.element_type] ?? "MID"].push(p);
    if (!lines.GK.length && !lines.DEF.length) throw new Error("no starters recorded");

    const players: LineupPlayer[] = [];
    const push = (p: any, position: string) =>
      players.push({ name: `${p.first_name} ${p.second_name}`, jersey: p.squad_number ? String(p.squad_number) : null, position, formationPlace: players.length + 1 });
    lines.GK.slice(0, 1).forEach((p) => push(p, "G"));
    (["DEF", "MID", "FWD"] as const).forEach((line) => {
      const slots = slotsFor(line, lines[line].length);
      lines[line].forEach((p, i) => push(p, slots[i] ?? "CM"));
    });

    cacheLife("hours");
    return {
      opponent,
      date: fixture.kickoff_time,
      formation: `${lines.DEF.length}-${lines.MID.length}-${lines.FWD.length}`,
      venue: home ? "H" : "A",
      players,
    };
  } catch (e) {
    cacheFailure("fpl last XI", e);
    return null;
  }
}
