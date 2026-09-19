"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { formats } from "@/content/site";
import { formats as formatImages } from "@/lib/images";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Pinned horizontal reel of the show's formats, styled as matchday-programme covers.
 * A match clock (0'→90') tracks progress. Touch/small screens get native swipe instead.
 */
export function FormatsReel() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;
        const clock = root.current!.querySelector<HTMLElement>("[data-clock]")!;
        el.style.overflow = "visible";

        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              clock.textContent = `${Math.round(self.progress * 90)}'`;
              gsap.set("[data-clock-bar]", { scaleX: self.progress });
            },
          },
        });

        // Per-cover parallax on the image inside, driven by the horizontal tween
        root.current!.querySelectorAll<HTMLElement>(".fr-img").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -12 },
            {
              xPercent: 12,
              ease: "none",
              scrollTrigger: {
                trigger: img.closest(".fr-card"),
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });
        return () => {
          el.style.overflow = "";
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} data-theme="studio" className="relative overflow-hidden" aria-labelledby="formats-title">
      <div className="flex min-h-[100svh] flex-col justify-center py-20 md:py-0">
        <div className="mx-auto mb-10 flex w-full max-w-[1500px] items-end justify-between gap-6 px-4 md:px-8">
          <h2 id="formats-title" className="display text-[clamp(2.8rem,7vw,6.5rem)]">
            What&rsquo;s on <span className="outline-text">the</span> <span className="text-kop">teamsheet</span>
          </h2>
          <div className="hidden shrink-0 text-right md:block" aria-hidden>
            <p data-clock className="text-6xl font-extralight tabular-nums">0&apos;</p>
            <p className="text-sm text-paper/60">Match clock</p>
          </div>
        </div>

        <div
          ref={track}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 md:gap-8 md:px-8"
        >
          {formats.map((f) => {
            const img = formatImages[f.key];
            return (
              <article
                key={f.key}
                className="fr-card relative flex h-[68svh] min-h-[460px] w-[82vw] shrink-0 snap-center flex-col overflow-hidden rounded-[14px] bg-night-2 sm:w-[60vw] md:h-[62vh] md:w-[34vw] lg:w-[30vw]"
              >
                <div className="relative h-[55%] overflow-hidden">
                  <div className="fr-img absolute inset-y-0 -inset-x-[15%]">
                    <Image src={img.src} alt={img.alt} fill sizes="(min-width:768px) 40vw, 90vw" className="object-cover grayscale contrast-125" />
                  </div>
                  <div className="absolute inset-0 bg-kop mix-blend-multiply" />
                  <div className="absolute inset-0 bg-gradient-to-t from-night-2 via-transparent to-transparent" />
                  <p className="absolute left-4 top-4 text-xs font-semibold text-paper/80">Kop Karuthu matchday programme</p>
                  <p className="absolute right-4 top-4 text-xs text-paper/70">Price: your opinion</p>
                </div>
                <div className="flex flex-1 flex-col p-6 md:p-7">
                  <h3 className="display mt-1 text-[clamp(2.4rem,4.2vw,4rem)]">{f.title}</h3>
                  <p className="mt-auto max-w-sm text-[17px] leading-relaxed text-paper/75">{f.body}</p>
                </div>
              </article>
            );
          })}
          <div className="w-[8vw] shrink-0 md:w-[20vw]" aria-hidden />
        </div>

        <div className="mx-auto mt-10 hidden w-full max-w-[1500px] px-8 md:block" aria-hidden>
          <div className="relative h-[3px] overflow-hidden rounded-full bg-paper/15">
            <div data-clock-bar className="absolute inset-0 origin-left scale-x-0 bg-kop" />
          </div>
          <div className="mt-2 flex justify-between text-xs text-paper/50">
            <span>Kick-off</span>
            <span>45&apos;</span>
            <span>Full time</span>
          </div>
        </div>
      </div>
    </section>
  );
}
