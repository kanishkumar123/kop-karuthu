import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheFailure } from "@/lib/cacheFail";

const API = "https://www.googleapis.com/youtube/v3";

export type Channel = {
  id: string;
  title: string;
  avatar: string;
  uploadsPlaylist: string;
  subscribers: number;
  videos: number;
  views: number;
};

export type Video = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  duration?: string;
  views?: number;
  live: "none" | "live" | "upcoming";
  scheduledStart?: string;
  actualStart?: string;
};

export type LiveStatus = { state: "live" | "upcoming"; video: Video } | { state: "idle" };

function key() {
  const k = process.env.YOUTUBE_API_KEY;
  if (!k) throw new Error("YOUTUBE_API_KEY is not set");
  return k;
}

async function yt<T>(path: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams({ ...params, key: key() });
  const res = await fetch(`${API}/${path}?${qs}`);
  if (!res.ok) throw new Error(`YouTube ${path} ${res.status}`);
  return res.json() as Promise<T>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function bestThumb(t: any): string {
  return (t?.maxres ?? t?.standard ?? t?.high ?? t?.medium ?? t?.default)?.url ?? "";
}

/* ───────────── cached primitives (failures are cached briefly and return a fallback) ───────────── */

async function fetchChannel(): Promise<Channel | null> {
  "use cache";
  cacheTag("yt-channel");
  try {
    const handle = process.env.YOUTUBE_HANDLE ?? "kopkaruthu";
    const data = await yt<any>("channels", {
      part: "snippet,statistics,contentDetails",
      forHandle: handle,
    });
    const c = data.items?.[0];
    if (!c) throw new Error("Channel not found");
    cacheLife("hours");
    return toChannel(c);
  } catch (e) {
    cacheFailure("youtube channel", e);
    return null;
  }
}

function toChannel(c: any): Channel {
  return {
    id: c.id,
    title: c.snippet.title,
    avatar: bestThumb(c.snippet.thumbnails),
    uploadsPlaylist: c.contentDetails.relatedPlaylists.uploads,
    subscribers: Number(c.statistics.subscriberCount),
    videos: Number(c.statistics.videoCount),
    views: Number(c.statistics.viewCount),
  };
}

async function hydrate(ids: string[]): Promise<Map<string, Partial<Video>>> {
  const out = new Map<string, Partial<Video>>();
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const data = await yt<any>("videos", {
      part: "contentDetails,statistics,snippet,liveStreamingDetails",
      id: chunk.join(","),
      maxResults: "50",
    });
    for (const v of data.items ?? []) {
      out.set(v.id, {
        duration: v.contentDetails?.duration,
        views: v.statistics?.viewCount ? Number(v.statistics.viewCount) : undefined,
        live: v.snippet?.liveBroadcastContent ?? "none",
        scheduledStart: v.liveStreamingDetails?.scheduledStartTime,
        actualStart: v.liveStreamingDetails?.actualStartTime,
      });
    }
  }
  return out;
}

async function fetchPlaylistPage(playlistId: string, pageToken?: string) {
  const data = await yt<any>("playlistItems", {
    part: "snippet,contentDetails",
    playlistId,
    maxResults: "50",
    ...(pageToken ? { pageToken } : {}),
  });
  const items: Video[] = (data.items ?? [])
    .filter((it: any) => it.snippet?.title !== "Private video" && it.snippet?.title !== "Deleted video")
    .map((it: any) => ({
      id: it.contentDetails.videoId,
      title: it.snippet.title,
      publishedAt: it.contentDetails.videoPublishedAt ?? it.snippet.publishedAt,
      thumbnail: bestThumb(it.snippet.thumbnails),
      live: "none" as const,
    }));
  return { items, next: data.nextPageToken as string | undefined };
}

async function fetchLatest(n: number): Promise<Video[]> {
  "use cache";
  cacheTag("yt-latest");
  try {
    const ch = await fetchChannel();
    if (!ch) throw new Error("no channel");
    const { items } = await fetchPlaylistPage(ch.uploadsPlaylist);
    const list = items.slice(0, n);
    const extra = await hydrate(list.map((v) => v.id));
    cacheLife("minutes");
    return list.map((v) => ({ ...v, ...extra.get(v.id) }));
  } catch (e) {
    cacheFailure("youtube latest", e);
    return [];
  }
}

async function fetchAll(): Promise<Video[]> {
  "use cache";
  cacheTag("yt-all");
  try {
    const ch = await fetchChannel();
    if (!ch) throw new Error("no channel");
    const all: Video[] = [];
    let token: string | undefined;
    let guard = 0;
    do {
      const page = await fetchPlaylistPage(ch.uploadsPlaylist, token);
      all.push(...page.items);
      token = page.next;
    } while (token && ++guard < 30);
    const extra = await hydrate(all.map((v) => v.id));
    cacheLife("hours");
    return all.map((v) => ({ ...v, ...extra.get(v.id) }));
  } catch (e) {
    cacheFailure("youtube all", e);
    return [];
  }
}

async function fetchLive(): Promise<LiveStatus> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 120, expire: 600 });
  cacheTag("yt-live");
  try {
    return await liveFrom(await fetchChannel());
  } catch (e) {
    console.warn("[youtube live]", (e as Error).message);
    return { state: "idle" };
  }
}

async function liveFrom(ch: Channel | null): Promise<LiveStatus> {
  if (!ch) return { state: "idle" };
  const { items } = await fetchPlaylistPage(ch.uploadsPlaylist);
  const recent = items.slice(0, 15);
  const extra = await hydrate(recent.map((v) => v.id));
  const vids = recent.map((v) => ({ ...v, ...extra.get(v.id) }) as Video);
  const live = vids.find((v) => v.live === "live");
  if (live) return { state: "live", video: live };
  const upcoming = vids
    .filter((v) => v.live === "upcoming" && v.scheduledStart)
    .sort((a, b) => a.scheduledStart!.localeCompare(b.scheduledStart!))[0];
  if (upcoming) return { state: "upcoming", video: upcoming };
  return { state: "idle" };
}

/* ───────────── safe public API (never throws) ───────────── */

async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.warn(`[youtube] ${label} failed:`, (e as Error).message);
    return fallback;
  }
}

export const getChannel = () => safe<Channel | null>(fetchChannel, null, "channel");
export const getLatestUploads = (n = 9) => safe<Video[]>(() => fetchLatest(n), [], "latest");
export const getAllUploads = () => safe<Video[]>(fetchAll, [], "all");
export const getLiveStatus = () => safe<LiveStatus>(fetchLive, { state: "idle" }, "live");

export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** Issue number for each upload (oldest = 1), consistent across every page. */
export async function getEpisodeNumbers(): Promise<Map<string, number>> {
  const all = await getAllUploads();
  return new Map(all.map((v, i) => [v.id, all.length - i]));
}
