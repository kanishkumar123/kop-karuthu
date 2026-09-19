"use client";

import { motion } from "motion/react";
import type { RadarAxis } from "@/lib/squadMath";

/** Five-axis radar, hand-built SVG. The shape draws itself in. */
export function RadarChart({ axes, size = 300 }: { axes: RadarAxis[]; size?: number }) {
  const c = size / 2;
  const r = size / 2 - 44;
  const angle = (i: number) => (Math.PI * 2 * i) / axes.length - Math.PI / 2;
  const pt = (i: number, v: number) => [c + Math.cos(angle(i)) * r * v, c + Math.sin(angle(i)) * r * v] as const;
  const poly = (v: (i: number) => number) => axes.map((_, i) => pt(i, v(i)).join(",")).join(" ");
  const shape = poly((i) => Math.max(0.06, axes[i].value));

  return (
    <figure>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[340px]" role="img" aria-label={axes.map((a) => `${a.label} ${Math.round(a.value * 100)} of 100`).join(", ")}>
        {[0.25, 0.5, 0.75, 1].map((k) => (
          <polygon key={k} points={poly(() => k)} fill="none" stroke="currentColor" strokeOpacity={k === 1 ? 0.25 : 0.1} />
        ))}
        {axes.map((_, i) => {
          const [x, y] = pt(i, 1);
          return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="currentColor" strokeOpacity={0.1} />;
        })}
        <motion.polygon
          points={shape}
          fill="rgb(224 16 47 / 0.35)"
          stroke="#e0102f"
          strokeWidth={2}
          strokeLinejoin="round"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.25 }}
          style={{ transformOrigin: `${c}px ${c}px` }}
        />
        {axes.map((a, i) => {
          const [x, y] = pt(i, Math.max(0.06, a.value));
          return (
            <motion.circle
              key={a.key}
              cx={x}
              cy={y}
              r={3.5}
              fill="#f7e9b0"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            />
          );
        })}
        {axes.map((a, i) => {
          const [x, y] = pt(i, 1.2);
          return (
            <text key={a.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-current text-[11px] font-semibold">
              {a.label}
            </text>
          );
        })}
      </svg>
      <figcaption className="sr-only">Per-90 profile compared with the rest of the squad</figcaption>
    </figure>
  );
}
