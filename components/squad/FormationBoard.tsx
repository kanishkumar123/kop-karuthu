"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Player } from "@/lib/fpl";
import type { LastXI } from "@/lib/espn";
import { placeXI, initials } from "@/lib/squadMath";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import { formatDate } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Pinned, scrubbed tactics board showing the starting XI from the last Premier League match,
 * laid out from ESPN's formation positions. The board tilts back as the roster takes over.
 */
export function FormationBoard({ squad, xi, onOpen }: { squad: Player[]; xi: LastXI; onOpen: (p: Player) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const spots = placeXI(xi, squad);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=140%", scrub: 0.7, pin: true, anticipatePin: 1, fastScrollEnd: true },
        });
        tl.from(".fb-line", { strokeDashoffset: 1000, duration: 1, ease: "none" })
          .from(".fb-dot", { y: -140, scale: 0, opacity: 0, stagger: 0.06, duration: 0.6, ease: "back.out(2)" }, "-=0.4")
          .to({}, { duration: 0.5 })
          .to(".fb-board", { rotateX: 58, scale: 0.8, yPercent: -10, opacity: 0.25, duration: 1, ease: "power2.in" });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex min-h-[100svh] items-center py-10" style={{ perspective: 1400 }}>
      <div className="mx-auto grid w-full max-w-[1500px] items-center gap-10 px-4 md:px-8 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-lg font-semibold text-flood">
            vs {xi.opponent} ({xi.venue === "H" ? "home" : "away"}), {formatDate(xi.date, { day: "numeric", month: "long" })}
          </p>
          <h2 className="display mt-3 text-[clamp(2.8rem,6vw,5.5rem)]">
            Last <span className="text-kop">league</span> XI
          </h2>
          <p className="mt-5 max-w-md text-lg text-paper/70">
            The side that started Liverpool&rsquo;s most recent Premier League match{xi.formation ? `, lined up in a ${xi.formation}` : ""}. Tap a player for their stats.
          </p>
        </div>

        <div className="fb-board relative mx-auto aspect-[68/90] w-full max-w-[560px] [transform-style:preserve-3d]">
          <svg viewBox="0 0 68 90" className="absolute inset-0 size-full" aria-hidden>
            <rect x="0.5" y="0.5" width="67" height="89" rx="1.5" fill="#1b3a24" />
            {Array.from({ length: 9 }).map((_, i) => (
              <rect key={i} x="0.5" y={0.5 + i * 10} width="67" height="5" fill="#1f4229" />
            ))}
            <g fill="none" stroke="#eae0cc" strokeOpacity="0.55" strokeWidth="0.35">
              <rect className="fb-line" x="2" y="2" width="64" height="86" strokeDasharray="1000" />
              <line className="fb-line" x1="2" y1="45" x2="66" y2="45" strokeDasharray="1000" />
              <circle className="fb-line" cx="34" cy="45" r="8" strokeDasharray="1000" />
              <rect className="fb-line" x="17" y="2" width="34" height="13" strokeDasharray="1000" />
              <rect className="fb-line" x="17" y="75" width="34" height="13" strokeDasharray="1000" />
              <rect className="fb-line" x="26" y="2" width="16" height="5" strokeDasharray="1000" />
              <rect className="fb-line" x="26" y="83" width="16" height="5" strokeDasharray="1000" />
            </g>
          </svg>

          {spots.map((s, i) => (
            <button
              key={i}
              type="button"
              disabled={!s.player}
              onClick={() => s.player && onOpen(s.player)}
              className="fb-dot group absolute -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              aria-label={`${s.player?.name ?? s.name}, open stats`}
            >
              <PlayerAvatar
                player={s.player}
                fallback={s.jersey ?? initials(s.name)}
                size={56}
                className="mx-auto shadow-[0_6px_14px_rgb(0_0_0/0.45)] ring-2 ring-paper/85 transition-transform group-hover:scale-110"
              />
              <span className="mt-1 block max-w-[96px] truncate rounded-full bg-night/85 px-2 py-0.5 text-[11px] font-semibold text-paper">
                {s.jersey ? `${s.jersey} ` : ""}
                {s.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
