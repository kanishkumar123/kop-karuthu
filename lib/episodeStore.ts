"use client";

import { useSyncExternalStore } from "react";
import type { Video } from "@/lib/youtube";

type State = { video: Video | null; no?: number };
let state: State = { video: null };
const subs = new Set<() => void>();

export function openEpisode(video: Video, no?: number) {
  state = { video, no };
  subs.forEach((f) => f());
}
export function closeEpisode() {
  state = { video: null };
  subs.forEach((f) => f());
}
export function useEpisode() {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => state,
    () => state,
  );
}
