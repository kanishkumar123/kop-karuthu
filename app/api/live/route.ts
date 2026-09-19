import { getLiveStatus } from "@/lib/youtube";

export async function GET() {
  const status = await getLiveStatus();
  return Response.json(status, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
