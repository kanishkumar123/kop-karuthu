"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { eras } from "@/content/legends";
import { LegendCard } from "@/components/squad/LegendCard";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const START = 1938;
const END = 2026; // right edge of the timeline ruler — bump each season

/** "This Is Anfield" sign assembles, then a pinned horizontal reel walks through the eras. */
export function Legends() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Sign letters
        gsap.from(".tia-letter", {
          yPercent: () => gsap.utils.random(-160, 160),
          xPercent: () => gsap.utils.random(-60, 60),
          rotate: () => gsap.utils.random(-50, 50),
          opacity: 0,
          stagger: { each: 0.03, from: "random" },
          ease: "power3.out",
          scrollTrigger: { trigger: ".tia-sign", start: "top 85%", end: "center 55%", scrub: 0.8 },
        });
        gsap.from(".tia-sign", {
          scale: 0.85,
          rotate: -3,
          scrollTrigger: { trigger: ".tia-sign", start: "top 90%", end: "center 55%", scrub: 0.8 },
        });
      });

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        el.style.overflow = "visible";
        const distance = () => el.scrollWidth - window.innerWidth;
        const marker = root.current!.querySelector<HTMLElement>("[data-year-marker]")!;
        const yearLabel = root.current!.querySelector<HTMLElement>("[data-year]")!;
        const chapters = Array.from(root.current!.querySelectorAll<HTMLElement>("[data-era-start]"));

        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: ".legends-pin",
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Year follows the era whose chapter card has passed the left third of the screen
              let year = START;
              const third = window.innerWidth / 3;
              chapters.forEach((c) => {
                if (c.getBoundingClientRect().left < third) year = Number(c.dataset.eraStart);
              });
              const pct = (year - START) / (END - START);
              gsap.to(marker, { left: `${pct * 100}%`, duration: 0.5, ease: "power2.out", overwrite: true });
              yearLabel.textContent = String(year);
              gsap.set("[data-legend-progress]", { scaleX: self.progress });
            },
          },
        });
        return () => {
          el.style.overflow = "";
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const sign = "This Is Anfield";

  return (
    <section ref={root} data-theme="fanzine" className="relative" aria-labelledby="legends-title">
      {/* Intro */}
      <div className="mx-auto max-w-[1500px] px-4 pb-10 pt-28 md:px-8 md:pt-40">
        <div className="grid items-end gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-lg font-semibold text-kop">Hall of fame</p>
            <h2 id="legends-title" className="display mt-2 text-[clamp(3.4rem,10vw,9rem)]">
              The <span className="text-kop">legends</span>
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--s-muted)] md:text-xl">
              Managers who built dynasties and players the Kop still sings about. Hover or tap a card for the moment that made them.
            </p>
          </div>
          <div className="tia-sign relative mx-auto w-full max-w-[560px] rounded-[10px] bg-kop px-6 py-8 text-center text-paper shadow-[0_30px_60px_-30px_rgb(142_11_31/0.8)] ring-[6px] ring-paper ring-offset-0 md:py-12">
            <span className="absolute inset-3 rounded-[6px] border-2 border-paper/60" aria-hidden />
            {/* Two lines like the real sign; letters grouped per word so a line never breaks mid-word */}
            <p className="display relative text-[clamp(1.8rem,5.2vw,4rem)] leading-[0.92]" aria-label={sign}>
              {["This Is", "Anfield"].map((line) => (
                <span key={line} aria-hidden className="block">
                  {line.split(" ").map((word, w) => (
                    <span key={word} className="inline-block whitespace-nowrap">
                      {w > 0 && <span className="inline-block w-[0.28em]" />}
                      {word.split("").map((ch, i) => (
                        <span key={i} className="tia-letter inline-block">
                          {ch}
                        </span>
                      ))}
                    </span>
                  ))}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      {/* Pinned eras reel */}
      <div className="legends-pin relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-12">
        <div ref={track} className="no-scrollbar flex snap-x snap-mandatory items-start gap-10 overflow-x-auto px-4 md:gap-14 md:px-8">
          {eras.map((era, e) => (
            <div key={era.key} className="flex shrink-0 items-start gap-8 md:gap-10">
              <div data-era-start={era.span.slice(0, 4)} className="flex h-[600px] w-[260px] shrink-0 snap-start flex-col justify-between border-l-4 border-kop pl-6 md:w-[300px]">
                <div>
                  <p className="text-sm text-[var(--s-muted)]">Chapter {e + 1} of {eras.length}</p>
                  <h3 className="display mt-3 text-[clamp(2.4rem,3.4vw,3.3rem)] leading-[0.9] [overflow-wrap:anywhere]">{era.title}</h3>
                </div>
                <p className="display outline-text stroke-kop text-[4.5rem] leading-none">{era.span.replace(" – ", "–").replace("today", "now")}</p>
              </div>
              {era.legends.map((l, i) => (
                <div key={l.key} className="snap-start">
                  <LegendCard legend={l} seed={e * 17 + i * 5 + 3} />
                </div>
              ))}
            </div>
          ))}
          <div className="w-[10vw] shrink-0" aria-hidden />
        </div>

        {/* Timeline ruler */}
        <div className="mx-auto mt-10 hidden w-full max-w-[1500px] px-8 md:block" aria-hidden>
          <div className="relative h-10">
            <div className="absolute inset-x-0 top-5 h-px bg-ink/25" />
            <div data-legend-progress className="absolute inset-x-0 top-[19px] h-[3px] origin-left scale-x-0 bg-kop" />
            {Array.from({ length: Math.floor((END - START) / 10) + 1 }).map((_, i) => {
              const y = Math.ceil(START / 10) * 10 + i * 10;
              if (y > END) return null;
              return (
                <span key={y} className="absolute top-0 -translate-x-1/2 text-center text-xs text-ink/50" style={{ left: `${((y - START) / (END - START)) * 100}%` }}>
                  <span className="mx-auto mb-1 block h-2.5 w-px bg-ink/40" style={{ marginTop: 14 }} />
                  {y}
                </span>
              );
            })}
            <span data-year-marker className="absolute top-0 -translate-x-1/2" style={{ left: "0%" }}>
              <span className="block rounded-full bg-kop px-3 py-1 text-sm font-black tabular-nums text-paper shadow-lg">
                <span data-year>{START}</span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
