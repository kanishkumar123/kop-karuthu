"use client";

import Image from "next/image";
import { useState } from "react";
import type { Img } from "@/lib/images";
import { cn } from "@/lib/utils";

/** Deterministic jagged polygon so server & client render the same torn edge. */
function tornPolygon(seed: number, teeth = 26, depth = 2.4) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const pts: string[] = [];
  for (let i = 0; i <= teeth; i++) pts.push(`${(i / teeth) * 100}% ${rnd() * depth}%`); // top
  for (let i = 0; i <= teeth; i++) pts.push(`${100 - rnd() * depth}% ${(i / teeth) * 100}%`); // right
  for (let i = teeth; i >= 0; i--) pts.push(`${(i / teeth) * 100}% ${100 - rnd() * depth}%`); // bottom
  for (let i = teeth; i >= 0; i--) pts.push(`${rnd() * depth}% ${(i / teeth) * 100}%`); // left
  return `polygon(${pts.join(",")})`;
}

export function TornPhoto({
  img,
  seed = 7,
  className,
  sizes = "40vw",
  tape = true,
  duotone = true,
  fallback,
}: {
  img?: Img;
  seed?: number;
  className?: string;
  sizes?: string;
  tape?: boolean;
  duotone?: boolean;
  /** Text (e.g. initials) shown if the photo is missing or fails to load */
  fallback?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImg = img && !failed;
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 bg-[#f6eedd] shadow-[0_24px_50px_-24px_rgb(28_20_22/0.55)]" style={{ clipPath: tornPolygon(seed, 30, 1.6) }} />
      <div className="absolute inset-[3.5%] overflow-hidden bg-ink" style={{ clipPath: tornPolygon(seed + 3, 22, 1.2) }}>
        {showImg ? (
          <Image
            onError={() => setFailed(true)}
            src={img.src}
            alt={img.alt}
            fill
            sizes={sizes}
            // Wikimedia rate-limits server-side fetches without a browser UA; let the browser load it directly
            unoptimized={img.src.includes("wikimedia.org")}
            loading="lazy"
            className={cn("object-cover", duotone && "grayscale contrast-125")}
            style={{ objectPosition: img.focal }}
          />
        ) : (
          <span className="grid size-full place-items-center">
            <span className="display text-[7rem] leading-none text-kop">{fallback}</span>
            <span className="halftone absolute inset-0 bg-kop/40" />
          </span>
        )}
        {duotone && showImg && <div className="absolute inset-0 bg-kop/35 mix-blend-multiply" />}
      </div>
      {tape && (
        <>
          <span aria-hidden className="tape absolute -top-3 left-[12%] h-7 w-24 -rotate-[8deg]" />
          <span aria-hidden className="tape absolute -bottom-2 right-[10%] h-7 w-20 rotate-[6deg]" />
        </>
      )}
    </div>
  );
}
