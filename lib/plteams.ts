import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheFailure } from "@/lib/cacheFail";
import { fetchRetry } from "@/lib/retry";
import { normName } from "@/lib/utils";
import type { Position } from "@/lib/fpl";

/**
 * Every Premier League squad, for the tactics board.
 *
 * FPL's bootstrap gives the squads and positions in one call; ESPN's rosters
 * add the shirt numbers and club colours FPL doesn't carry. Both are cached
 * for a day — the board only needs names and numbers, not live form.
 */

const FPL = "https://fantasy.premierleague.com/api";
const ESPN = "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1";
const UA = { "User-Agent": "Mozilla/5.0 (KopKaruthu site)" };
const PL_PHOTO = (code: number) => `https://resources.premierleague.com/premierleague25/photos/players/110x140/${code}.png`;

export type TacticsPlayer = {
  id: number;
  name: string;
  last: string;
  number: number | null;
  position: Position;
  photo: string;
};

export type PlTeam = {
  id: number;
  name: string;
  short: string;
  /** Club colour for the token discs */
  color: string;
  /** Whether text on that colour should be light or dark */
  ink: "light" | "dark";
  players: TacticsPlayer[];
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const POS: Record<number, Position> = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };
const ORDER: Position[] = ["GK", "DEF", "MID", "FWD"];

/** FPL and ESPN disagree on two abbreviations. */
const ESPN_ABBR: Record<string, string> = { MCI: "MNC", MUN: "MAN" };

/** Dark text reads better on pale kits (Fulham, Leeds, Spurs…). */
function inkFor(hex: string): "light" | "dark" {
  const n = parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "dark" : "light";
}

async function json<T>(url: string): Promise<T> {
  const res = await fetchRetry(url, { headers: UA });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json() as Promise<T>;
}

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

type EspnTeam = { abbr: string; color: string; numbers: Record<string, number> };

/** Shirt numbers and club colours, keyed by ESPN abbreviation. */
async function espnTeams(): Promise<Record<string, EspnTeam>> {
  const list = await json<any>(`${ESPN}/teams`);
  const teams = (list.sports?.[0]?.leagues?.[0]?.teams ?? []).map((t: any) => t.team);
  const rosters = await pool(teams, 5, async (t: any) => {
    try {
      const r = await json<any>(`${ESPN}/teams/${t.id}/roster`);
      const numbers: Record<string, number> = {};
      for (const a of r.athletes ?? []) {
        const n = Number(a.jersey);
        if (Number.isFinite(n)) numbers[normName(a.displayName ?? a.fullName ?? "")] = n;
      }
      return numbers;
    } catch {
      return {};
    }
  });
  const out: Record<string, EspnTeam> = {};
  teams.forEach((t: any, i: number) => {
    const abbr = String(t.abbreviation ?? "").toUpperCase();
    out[abbr] = { abbr, color: `#${t.color ?? "6b7280"}`, numbers: rosters[i] };
  });
  return out;
}

async function buildTeams(): Promise<PlTeam[]> {
  "use cache";
  cacheTag("pl-teams");
  try {
    const [boot, espn] = await Promise.all([
      json<any>(`${FPL}/bootstrap-static/`),
      espnTeams().catch(() => ({}) as Record<string, EspnTeam>),
    ]);

    const byTeam = new Map<number, any[]>();
    for (const e of boot.elements ?? []) {
      if (e.status === "u") continue;
      const list = byTeam.get(e.team) ?? [];
      list.push(e);
      byTeam.set(e.team, list);
    }

    const teams: PlTeam[] = (boot.teams ?? []).map((t: any) => {
      const short = String(t.short_name ?? "").toUpperCase();
      const club = espn[ESPN_ABBR[short] ?? short];
      const numbers = club?.numbers ?? {};
      const color = club?.color ?? "#6b7280";
      const players: TacticsPlayer[] = (byTeam.get(t.id) ?? []).map((e: any) => {
        const name = `${e.first_name} ${e.second_name}`.trim();
        return {
          id: e.id,
          name,
          last: e.web_name ?? e.second_name,
          number: numbers[normName(name)] ?? null,
          position: POS[e.element_type] ?? "MID",
          photo: PL_PHOTO(e.code),
        };
      });
      players.sort(
        (a, b) =>
          ORDER.indexOf(a.position) - ORDER.indexOf(b.position) ||
          (a.number ?? 99) - (b.number ?? 99) ||
          a.last.localeCompare(b.last),
      );
      return { id: t.id, name: t.name, short, color, ink: inkFor(color), players };
    });

    teams.sort((a, b) => a.name.localeCompare(b.name));
    cacheLife("days");
    return teams;
  } catch (e) {
    cacheFailure("premier league teams", e);
    return [];
  }
}

export const getPlTeams = () => buildTeams();
