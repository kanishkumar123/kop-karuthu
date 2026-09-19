import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Compact number: 4320 → "4.3K", 669694 → "670K" */
export function compact(n: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** ISO 8601 duration (PT1H2M3S) → "1:02:03" */
export function formatDuration(iso?: string) {
  if (!iso) return "";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "";
  const [h, min, s] = [Number(m[1] ?? 0), Number(m[2] ?? 0), Number(m[3] ?? 0)];
  const ss = String(s).padStart(2, "0");
  return h ? `${h}:${String(min).padStart(2, "0")}:${ss}` : `${min}:${ss}`;
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-GB", opts).format(new Date(iso));
}

/**
 * Channel titles look like "Gakpo Supremacy 👑 | IPSWICH 0-2 LIVERPOOL REVIEW | KOP KARUTHU".
 * Split into a hook (often Tamil) and the fixture line, dropping the channel suffix.
 */
export function splitTitle(raw: string) {
  const parts = raw
    .split("|")
    .map((p) => p.trim())
    .filter((p) => p && !/^kop karuthu( podcast)?$/i.test(p));
  if (parts.length <= 1) return { hook: parts[0] ?? raw, rest: "" };
  return { hook: parts[0], rest: parts.slice(1).join(" / ") };
}


export type EpisodeKind = "watchalong" | "review" | "preview" | "episode";
export function episodeKind(title: string): EpisodeKind {
  const t = title.toLowerCase();
  if (t.includes("watchalong") || t.includes("watch along")) return "watchalong";
  if (t.includes("review")) return "review";
  if (t.includes("preview")) return "preview";
  return "episode";
}

/** Lower-case, accent-free, letters only: for matching names across data providers. */
export function normName(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
