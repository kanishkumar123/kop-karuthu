"use client";

import { useRef, useState } from "react";
import type { RefObject } from "react";
import type { Token } from "@/components/tactics/types";
import { useSlideDrag } from "@/components/tactics/useSlideDrag";

/**
 * A draggable disc. Dragging writes straight to the element's transform — no
 * React state per pixel — and the position is committed once the slide stops.
 */
export function PlayerToken({
  token,
  color,
  ink,
  photos,
  dim,
  locked,
  animate,
  pitch,
  onCommit,
  onPick,
}: {
  token: Token;
  color: string;
  ink: "light" | "dark";
  photos: boolean;
  dim: boolean;
  locked: boolean;
  /** Only true for formation changes and steps, so a drag never animates twice */
  animate: boolean;
  pitch: RefObject<HTMLDivElement | null>;
  onCommit: (id: string, x: number, y: number) => void;
  onPick: (id: string) => void;
}) {
  const el = useRef<HTMLButtonElement>(null);
  const [imgOk, setImgOk] = useState(true);

  const { dragging, handlers } = useSlideDrag({
    elRef: el,
    pitchRef: pitch,
    x: token.x,
    y: token.y,
    enabled: !locked,
    onCommit: (x, y) => onCommit(token.id, x, y),
    onTap: () => onPick(token.id),
  });

  const label = token.number != null ? String(token.number) : token.last.slice(0, 2).toUpperCase();

  return (
    <button
      ref={el}
      type="button"
      {...handlers}
      aria-label={`${token.name}${token.number != null ? `, number ${token.number}` : ""}. Drag to move, tap to swap.`}
      className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center touch-none select-none ${
        animate && !dragging ? "tk-glide" : ""
      }`}
      style={{
        left: `${token.x}%`,
        top: `${token.y}%`,
        opacity: dim ? 0.3 : 1,
        zIndex: dragging ? 30 : 20,
        // With a drawing tool active the discs must not swallow the stroke
        pointerEvents: locked ? "none" : "auto",
        cursor: dragging ? "grabbing" : "grab",
      }}
    >
      <span
        className="relative flex items-center justify-center overflow-hidden rounded-full font-bold ring-2 ring-paper/85 transition-[box-shadow,scale] duration-150"
        style={{
          width: "var(--disc)",
          height: "var(--disc)",
          background: color,
          color: ink === "dark" ? "#150a0c" : "#f4efe4",
          fontSize: "calc(var(--disc) * 0.42)",
          scale: dragging ? "1.08" : "1",
          boxShadow: dragging ? "0 14px 26px rgb(0 0 0 / 0.55)" : "0 6px 16px rgb(0 0 0 / 0.45)",
        }}
      >
        {photos && token.photo && imgOk ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={token.photo}
            alt=""
            draggable={false}
            onError={() => setImgOk(false)}
            className="size-full scale-105 object-cover object-top"
          />
        ) : (
          label
        )}
      </span>
      <span
        className="mt-1 block max-w-[11ch] truncate rounded-full bg-night/85 px-1.5 py-0.5 text-center font-semibold text-paper"
        style={{ fontSize: "calc(var(--disc) * 0.3)" }}
      >
        {token.last}
      </span>
    </button>
  );
}
