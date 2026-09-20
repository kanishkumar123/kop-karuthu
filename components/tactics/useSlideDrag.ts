"use client";

import { useRef, useState } from "react";
import type { RefObject } from "react";

/**
 * Carrom-style dragging for a disc on the pitch.
 *
 * The piece tracks the pointer exactly (one rAF-batched transform write per
 * frame, never React state), and on release it keeps going for a moment in the
 * direction you flicked it before settling — so it slides rather than being
 * picked up and put down. The new position is only committed to React once the
 * slide has finished, and it's written to the element first, so the hand-off
 * can't show a jump.
 */

type Sample = { t: number; x: number; y: number };

const clamp = (v: number) => Math.min(97, Math.max(3, v));

export function useSlideDrag({
  elRef,
  pitchRef,
  x,
  y,
  enabled,
  onCommit,
  onTap,
}: {
  elRef: RefObject<HTMLElement | null>;
  pitchRef: RefObject<HTMLElement | null>;
  x: number;
  y: number;
  enabled: boolean;
  onCommit: (x: number, y: number) => void;
  onTap?: () => void;
}) {
  const drag = useRef<{
    sx: number;
    sy: number;
    dx: number;
    dy: number;
    prev: Sample;
    last: Sample;
    moved: boolean;
    raf: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const paint = () => {
    const d = drag.current;
    if (!d || !elRef.current) return;
    d.raf = 0;
    elRef.current.style.transform = `translate(-50%, -50%) translate(${d.dx}px, ${d.dy}px)`;
  };

  const down = (e: React.PointerEvent) => {
    if (!enabled) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const s = { t: e.timeStamp, x: e.clientX, y: e.clientY };
    drag.current = { sx: e.clientX, sy: e.clientY, dx: 0, dy: 0, prev: s, last: s, moved: false, raf: 0 };
    if (elRef.current) elRef.current.style.transition = "none";
    setDragging(true);
  };

  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    d.dx = e.clientX - d.sx;
    d.dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(d.dx, d.dy) > 3) d.moved = true;
    d.prev = d.last;
    d.last = { t: e.timeStamp, x: e.clientX, y: e.clientY };
    if (!d.raf) d.raf = requestAnimationFrame(paint);
  };

  const up = () => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    const el = elRef.current;
    if (!d || !el) return;
    if (d.raf) cancelAnimationFrame(d.raf);
    const box = pitchRef.current?.getBoundingClientRect();

    if (!d.moved || !box) {
      el.style.transition = "";
      el.style.transform = "";
      if (!d.moved) onTap?.();
      return;
    }

    // Flick speed over the last couple of moves decides how far it carries on
    const dt = Math.max(8, d.last.t - d.prev.t);
    const vx = (d.last.x - d.prev.x) / dt;
    const vy = (d.last.y - d.prev.y) / dt;
    const speed = Math.hypot(vx, vy);
    const carry = speed > 0.12 ? Math.min(170, speed * 95) : 0;
    const gx = carry ? (vx / speed) * carry : 0;
    const gy = carry ? (vy / speed) * carry : 0;

    const restX = clamp(x + ((d.dx + gx) / box.width) * 100);
    const restY = clamp(y + ((d.dy + gy) / box.height) * 100);
    const endDx = ((restX - x) / 100) * box.width;
    const endDy = ((restY - y) / 100) * box.height;

    const settle = () => {
      // Write the resting place to the element before React hears about it
      el.style.left = `${restX}%`;
      el.style.top = `${restY}%`;
      el.style.transform = "";
      el.style.transition = "";
      onCommit(restX, restY);
    };

    const slide = Math.hypot(endDx - d.dx, endDy - d.dy);
    if (slide < 2) {
      settle();
      return;
    }
    const ms = Math.round(200 + slide * 1.5);
    el.style.transition = `transform ${ms}ms cubic-bezier(0.16, 0.84, 0.36, 1)`;
    el.style.transform = `translate(-50%, -50%) translate(${endDx}px, ${endDy}px)`;
    window.setTimeout(settle, ms + 16);
  };

  return {
    dragging,
    handlers: { onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: up },
  };
}
