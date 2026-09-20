"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Pt, Shape, Tool } from "@/components/tactics/types";
import { drawShape, drawShapes } from "@/components/tactics/canvas";

/**
 * Two stacked canvases over the pitch: committed shapes on one, the shape
 * currently being drawn on the other, so a long pen stroke never forces a
 * redraw of everything. Coordinates are stored as percentages of the pitch,
 * which keeps drawings correct when the board is resized.
 */

const hit = 1.6; // eraser tolerance, in pitch percent

function fit(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(canvas.clientWidth * dpr);
  const h = Math.round(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  return ctx;
}

/** Distance from a point to a segment, in percent units. */
function distToSeg(p: Pt, a: Pt, b: Pt) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len)) : 0;
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function shapeHit(s: Shape, p: Pt) {
  if (s.t === "pen") return s.pts.some((q, i) => i > 0 && distToSeg(p, s.pts[i - 1], q) < hit);
  if (s.t === "line" || s.t === "arrow") return distToSeg(p, s.a, s.b) < hit;
  const x0 = Math.min(s.a[0], s.b[0]);
  const x1 = Math.max(s.a[0], s.b[0]);
  const y0 = Math.min(s.a[1], s.b[1]);
  const y1 = Math.max(s.a[1], s.b[1]);
  return p[0] > x0 - hit && p[0] < x1 + hit && p[1] > y0 - hit && p[1] < y1 + hit;
}

export function DrawLayer({
  shapes,
  tool,
  color,
  width,
  onAdd,
  onErase,
}: {
  shapes: Shape[];
  tool: Tool;
  color: string;
  width: number;
  onAdd: (s: Shape) => void;
  onErase: (index: number) => void;
}) {
  const base = useRef<HTMLCanvasElement>(null);
  const live = useRef<HTMLCanvasElement>(null);
  const draft = useRef<Shape | null>(null);

  const paintBase = useCallback(() => {
    const c = base.current;
    if (!c) return;
    const ctx = fit(c);
    drawShapes(ctx, c.clientWidth, c.clientHeight, shapes);
  }, [shapes]);

  useEffect(() => {
    paintBase();
    const ro = new ResizeObserver(() => paintBase());
    if (base.current) ro.observe(base.current);
    return () => ro.disconnect();
  }, [paintBase]);

  const at = (e: React.PointerEvent): Pt => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100];
  };

  const paintLive = () => {
    const c = live.current;
    if (!c) return;
    const ctx = fit(c);
    if (draft.current) drawShape(ctx, c.clientWidth, c.clientHeight, draft.current);
  };

  const down = (e: React.PointerEvent) => {
    if (tool === "move") return;
    const p = at(e);
    if (tool === "erase") {
      const i = [...shapes].reverse().findIndex((s) => shapeHit(s, p));
      if (i >= 0) onErase(shapes.length - 1 - i);
      return;
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    draft.current =
      tool === "pen"
        ? { t: "pen", pts: [p], color, w: width }
        : tool === "line" || tool === "arrow"
          ? { t: tool, a: p, b: p, color, w: width }
          : tool === "spot"
            ? { t: "spot", a: p, b: p }
            : { t: tool === "zone" ? "rect" : tool, a: p, b: p, color, w: width, fill: tool === "zone" };
    paintLive();
  };

  const move = (e: React.PointerEvent) => {
    const d = draft.current;
    if (!d) return;
    const p = at(e);
    if (d.t === "pen") d.pts.push(p);
    else d.b = p;
    paintLive();
  };

  const up = () => {
    const d = draft.current;
    draft.current = null;
    const c = live.current;
    if (c) fit(c);
    if (!d) return;
    // Ignore accidental taps
    if (d.t !== "pen" && Math.hypot(d.b[0] - d.a[0], d.b[1] - d.a[1]) < 1) return;
    if (d.t === "pen" && d.pts.length < 2) return;
    onAdd(d);
  };

  return (
    <>
      <canvas ref={base} className="pointer-events-none absolute inset-0 size-full" />
      <canvas
        ref={live}
        className="absolute inset-0 size-full touch-none"
        style={{ pointerEvents: tool === "move" ? "none" : "auto", cursor: tool === "erase" ? "cell" : "crosshair" }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      />
    </>
  );
}
