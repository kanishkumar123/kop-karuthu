"use client";

import { useSyncExternalStore } from "react";

export type Countdown = { d: number; h: number; m: number; s: number; past: boolean };

/* One shared 1s clock for every countdown on the page */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
function subscribeClock(cb: () => void) {
  listeners.add(cb);
  if (!timer) timer = setInterval(() => listeners.forEach((l) => l()), 1000);
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}
const nowSecond = () => Math.floor(Date.now() / 1000);

/** Seconds since epoch, ticking once a second on the client; null during SSR. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribeClock, nowSecond, () => null);
}

export function useCountdown(target?: string | null): Countdown | null {
  const now = useNow();
  if (!target || now == null) return null;
  const diff = Math.max(0, new Date(target).getTime() - now * 1000);
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor(diff / 3_600_000) % 24,
    m: Math.floor(diff / 60_000) % 60,
    s: Math.floor(diff / 1000) % 60,
    past: diff === 0,
  };
}

export const pad = (n: number) => String(n).padStart(2, "0");

const noop = () => () => {};
const kickoffFormat: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZoneName: "short",
};

/** Formats a date in the visitor's own locale + time zone. Empty on the server to avoid hydration mismatches. */
export function useLocalDateTime(iso?: string | null, opts: Intl.DateTimeFormatOptions = kickoffFormat) {
  return useSyncExternalStore(
    noop,
    () => (iso ? new Intl.DateTimeFormat(undefined, opts).format(new Date(iso)) : ""),
    () => "",
  );
}
