import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheFailure } from "@/lib/cacheFail";

/** football-data.org v4 — only used for Liverpool's Premier League table position. */
const API = "https://api.football-data.org/v4";
const LFC = 64;

export type Table = { position: number; played: number; points: number; goalDifference: number };

/* eslint-disable @typescript-eslint/no-explicit-any */
async function fetchTable(): Promise<Table | null> {
  "use cache";
  cacheTag("pl-table");
  try {
    const res = await fetch(`${API}/competitions/PL/standings`, {
      headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY ?? "" },
    });
    if (!res.ok) throw new Error(`football-data standings ${res.status}`);
    const st: any = await res.json();
    const row = st.standings?.find((s: any) => s.type === "TOTAL")?.table?.find((r: any) => r.team?.id === LFC);
    cacheLife({ stale: 300, revalidate: 1800, expire: 86400 }); // free tier: 10 req/min
    return row ? { position: row.position, played: row.playedGames, points: row.points, goalDifference: row.goalDifference } : null;
  } catch (e) {
    cacheFailure("football-data", e);
    return null;
  }
}

export async function getTable(): Promise<Table | null> {
  if (!process.env.FOOTBALL_DATA_API_KEY) return null; // not configured
  return fetchTable();
}
