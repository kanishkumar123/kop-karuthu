"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

type Row = { words: string[]; direction: 1 | -1; outline?: boolean };

/** Rows drift constantly, then speed up and skew with scroll velocity. */
export function VelocityMarquee({ rows, className, baseSpeed = 60 }: { rows: Row[]; className?: string; baseSpeed?: number }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tracks = Array.from(el.querySelectorAll<HTMLElement>("[data-track]"));
    const offsets = tracks.map(() => 0);
    let velocity = 0;
    let skew = 0;
    let visible = true;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => (velocity = self.getVelocity()),
      onToggle: (self) => (visible = self.isActive),
    });

    const tick = (_t: number, dt: number) => {
      if (!visible) return;
      velocity *= 0.92;
      const boost = reduce ? 0 : gsap.utils.clamp(-1500, 1500, velocity) / 1500;
      const targetSkew = reduce ? 0 : boost * -8;
      skew += (targetSkew - skew) * 0.12;
      tracks.forEach((track, i) => {
        const dir = Number(track.dataset.dir);
        const w = track.scrollWidth / 2;
        const speed = (reduce ? baseSpeed * 0.3 : baseSpeed) * (1 + Math.abs(boost) * 6);
        offsets[i] -= dir * speed * (dt / 1000) * (boost < 0 ? -1 : 1);
        offsets[i] = gsap.utils.wrap(-w, 0, offsets[i]);
        track.style.transform = `translate3d(${offsets[i]}px,0,0) skewX(${skew}deg)`;
      });
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, [baseSpeed]);

  return (
    <div ref={root} className={cn("overflow-hidden py-6", className)} aria-hidden>
      {rows.map((row, r) => (
        <div key={r} className="whitespace-nowrap">
          <div data-track data-dir={row.direction} className="inline-flex will-change-transform">
            {[0, 1].map((copy) => (
              <span key={copy} className="inline-flex items-center">
                {row.words.map((w, i) => (
                  <span key={`${copy}-${i}`} className="inline-flex items-center">
                    <span
                      className={cn(
                        "display px-[0.25em] text-[clamp(3rem,9vw,8rem)]",
                        row.outline && "outline-text",
                      )}
                    >
                      {w}
                    </span>
                    <svg viewBox="0 0 24 24" className="mx-[0.3em] size-[clamp(1.5rem,4vw,3.5rem)] shrink-0 text-kop" fill="currentColor">
                      <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
                    </svg>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
