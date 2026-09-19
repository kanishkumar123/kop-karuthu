"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

/** Counts up to `value` when scrolled into view (Magic UI-style, restyled). */
export function NumberTicker({
  value,
  decimals = 0,
  className,
  format = "full",
}: {
  value: number;
  decimals?: number;
  className?: string;
  format?: "full" | "compact";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { damping: 40, stiffness: 90 });
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const fmt = (v: number) =>
    format === "compact"
      ? new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v)
      : new Intl.NumberFormat("en", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);

  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) spring.jump(value);
    mv.set(value);
  }, [inView, value, mv, spring]);

  useEffect(
    () =>
      spring.on("change", (v) => {
        if (ref.current) ref.current.textContent = fmt(Number(v.toFixed(decimals)));
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spring, decimals, format],
  );

  return (
    <span ref={ref} className={cn("tabular-nums", className)} aria-label={fmt(value)}>
      {fmt(0)}
    </span>
  );
}
