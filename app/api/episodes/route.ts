import type { NextRequest } from "next/server";
import { getAllUploads } from "@/lib/youtube";

const PAGE = 24;

/** GET /api/episodes?q=gakpo&cursor=24 — searches the cached full catalogue */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  const cursor = Math.max(0, Number(req.nextUrl.searchParams.get("cursor") ?? 0) || 0);

  const all = await getAllUploads();
  const total = all.length;
  const withNo = all.map((v, i) => ({ v, no: total - i }));
  const terms = q.split(/\s+/).filter(Boolean);
  const filtered = terms.length ? withNo.filter(({ v }) => terms.every((t) => v.title.toLowerCase().includes(t))) : withNo;

  const items = filtered.slice(cursor, cursor + PAGE);
  const next = cursor + PAGE < filtered.length ? cursor + PAGE : null;

  return Response.json(
    { items, next, matches: filtered.length, total },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
  );
}
