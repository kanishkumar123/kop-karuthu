"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  window.addEventListener("kk:intro-done", cb);
  return () => window.removeEventListener("kk:intro-done", cb);
}

const snapshot = () =>
  document.documentElement.classList.contains("kk-seen") || !document.getElementById("kk-preloader");

/** True once the preloader has finished (or immediately if it was skipped). */
export function useIntroDone() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
