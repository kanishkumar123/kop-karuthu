import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheFailure } from "@/lib/cacheFail";
import { getTable, type Table } from "@/lib/football";
import { normName } from "@/lib/utils";
import { fetchRetry } from "@/lib/retry";

/**
 * ESPN public site API (no key). Liverpool = team 364.
 * - "all" schedule covers every competition (PL, UCL, Carabao Cup, FA Cup…)
 * - eng.1 match summaries give the starting XI with formation positions.
 */
const SITE = "https://site.api.espn.com/apis/site/v2/sports/soccer";
const LFC = "364";

export type Side = { name: string; short: string; tla: string; isLfc: boolean };
export type Match = {
  id: string;
  utcDate: string;
  competition: string;
  home: Side;
  away: Side;
  score?: { home: number | null; away: number | null };
  /** From Liverpool's perspective */
  result?: "W" | "D" | "L";
};
export type Fixtures = { next: Match | null; recent: Match[]; table: Table | null };

export type LineupPlayer = { name: string; jersey: string | null; position: string; formationPlace: number };
export type LastXI = { opponent: string; date: string; formation: string | null; venue: "H" | "A"; players: LineupPlayer[] };

/* eslint-disable @typescript-eslint/no-explicit-any */
async function espn<T>(path: string): Promise<T> {
  const res = await fetchRetry(`${SITE}${path}`, { headers: { "User-Agent": "Mozilla/5.0 (KopKaruthu site)" } });
  if (!res.ok) throw new Error(`espn ${path} ${res.status}`);
  return res.json() as Promise<T>;
}

function side(c: any): Side {
  const t = c.team ?? {};
  return {
    name: t.displayName ?? "",
    short: t.shortDisplayName ?? t.displayName ?? "",
    tla: t.abbreviation ?? (t.displayName ?? "").slice(0, 3).toUpperCase(),
    isLfc: String(t.id) === LFC,
  };
}

const num = (s: any): number | null => {
  const v = typeof s === "object" && s ? s.value : s;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function toMatch(e: any): Match | null {
  const c = e.competitions?.[0];
  if (!c) return null;
  const h = c.competitors?.find((x: any) => x.homeAway === "home");
  const a = c.competitors?.find((x: any) => x.homeAway === "away");
  if (!h || !a) return null;
  const home = side(h);
  const away = side(a);
  const done = !!c.status?.type?.completed;
  let result: Match["result"];
  let score: Match["score"];
  if (done) {
    score = { home: num(h.score), away: num(a.score) };
    const lfc = home.isLfc ? h : a;
    const opp = home.isLfc ? a : h;
    result = lfc.winner ? "W" : opp.winner ? "L" : "D";
  }
  return {
    id: String(e.id),
    utcDate: e.date,
    competition: e.league?.shortName ?? e.league?.name ?? c.type?.abbreviation ?? "",
    home,
    away,
    score,
    result,
  };
}

async function fetchSchedule(): Promise<{ next: Match | null; recent: Match[] } | null> {
  "use cache";
  cacheTag("espn-schedule");
  try {
    const [played, upcoming] = await Promise.all([
      espn<any>(`/all/teams/${LFC}/schedule`),
      espn<any>(`/all/teams/${LFC}/schedule?fixture=true`),
    ]);
    const recent = (played.events ?? [])
      .map(toMatch)
      .filter((m: Match | null): m is Match => !!m && !!m.result)
      .sort((x: Match, y: Match) => y.utcDate.localeCompare(x.utcDate))
      .slice(0, 5);
    const now = Date.now();
    const next =
      (upcoming.events ?? [])
        .map(toMatch)
        .filter((m: Match | null): m is Match => !!m && !m.result && new Date(m.utcDate).getTime() > now - 2 * 3600_000)
        .sort((x: Match, y: Match) => x.utcDate.localeCompare(y.utcDate))[0] ?? null;
    cacheLife({ stale: 300, revalidate: 900, expire: 86400 });
    return { next, recent };
  } catch (e) {
    cacheFailure("espn schedule", e);
    return null;
  }
}

/** Next match + last 5 results (all competitions) + PL table position. */
export async function getFixtures(): Promise<Fixtures | null> {
  const [sched, table] = await Promise.all([fetchSchedule(), getTable()]);
  if (!sched) return null;
  return { ...sched, table };
}

/** Starting XI from Liverpool's most recent completed Premier League match. */
export async function getLastLeagueXI(): Promise<LastXI | null> {
  "use cache";
  cacheTag("espn-xi");
  try {
    const sched = await espn<any>(`/eng.1/teams/${LFC}/schedule`);
    const last = (sched.events ?? [])
      .filter((e: any) => e.competitions?.[0]?.status?.type?.completed)
      .sort((a: any, b: any) => b.date.localeCompare(a.date))[0];
    if (!last) throw new Error("no completed league match");
    const summary = await espn<any>(`/eng.1/summary?event=${last.id}`);
    const roster = (summary.rosters ?? []).find((r: any) => String(r.team?.id) === LFC);
    if (!roster) throw new Error("no lineup yet");
    const players: LineupPlayer[] = (roster.roster ?? [])
      .filter((p: any) => p.starter)
      .map((p: any) => ({
        name: p.athlete?.displayName ?? "",
        jersey: p.jersey ?? null,
        position: p.position?.abbreviation ?? "",
        formationPlace: Number(p.formationPlace ?? 0),
      }));
    const m = toMatch(last);
    const lfcHome = m?.home.isLfc ?? true;
    cacheLife("hours");
    return {
      opponent: (lfcHome ? m?.away.name : m?.home.name) ?? "",
      date: last.date,
      formation: roster.formation ?? null,
      venue: lfcHome ? "H" : "A",
      players,
    };
  } catch (e) {
    cacheFailure("espn last XI", e);
    return null;
  }
}

/** Jersey numbers keyed by normalised full name (ESPN roster). */
export async function getJerseyNumbers(): Promise<Record<string, number>> {
  "use cache";
  cacheTag("espn-roster");
  try {
    const r = await espn<any>(`/eng.1/teams/${LFC}/roster`);
    const out: Record<string, number> = {};
    for (const a of r.athletes ?? []) {
      const n = Number(a.jersey);
      if (Number.isFinite(n)) out[normName(a.displayName ?? a.fullName ?? "")] = n;
    }
    cacheLife("days");
    return out;
  } catch (e) {
    cacheFailure("espn roster", e);
    return {};
  }
}
