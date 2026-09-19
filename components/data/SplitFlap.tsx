"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

/** One split-flap tile per character; each flips when its character changes. */
export function SplitFlap({ value, className, tileClassName }: { value: string; className?: string; tileClassName?: string }) {
  return (
    <span className={cn("inline-flex gap-[0.08em]", className)} aria-label={value} role="img">
      {value.split("").map((ch, i) => (
        <Tile key={i} ch={ch} className={tileClassName} />
      ))}
    </span>
  );
}

function Tile({ ch, className }: { ch: string; className?: string }) {
  if (ch === " " || ch === ":") {
    return (
      <span aria-hidden className="inline-grid w-[0.35em] place-items-center opacity-60">
        {ch === ":" ? ":" : ""}
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-grid h-[1.25em] w-[0.82em] place-items-center overflow-hidden rounded-[0.08em] bg-night-3 font-bold tabular-nums leading-none text-paper shadow-[inset_0_-0.05em_0_rgb(0_0_0/0.35)]",
        className,
      )}
      style={{ perspective: "4em" }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={ch}
          initial={{ rotateX: -90, opacity: 0.4 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0.4 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          className="block origin-center"
        >
          {ch}
        </motion.span>
      </AnimatePresence>
      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-night/70" />
    </span>
  );
}
