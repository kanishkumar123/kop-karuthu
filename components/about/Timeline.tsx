"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { timeline } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Vertical timeline; the red line draws itself and each date stamps in as the line reaches it. */
export function Timeline() {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".tl-line",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 60%", end: "bottom 60%", scrub: true } },
        );
        root.current!.querySelectorAll<HTMLElement>(".tl-item").forEach((item) => {
          gsap.from(item.querySelector(".tl-dot"), {
            scale: 0,
            duration: 0.5,
            ease: "back.out(3)",
            scrollTrigger: { trigger: item, start: "top 60%", toggleActions: "play none none reverse" },
          });
          gsap.from(item.querySelector(".tl-date"), {
            y: 12,
            opacity: 0,
            duration: 0.5,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 60%", toggleActions: "play none none reverse" },
          });
          gsap.from(item.querySelector(".tl-body"), {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 60%", toggleActions: "play none none reverse" },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <ol ref={root} className="relative mx-auto max-w-4xl">
      <span aria-hidden className="absolute bottom-0 left-[7px] top-0 w-px bg-ink/15 md:left-[183px]" />
      <span aria-hidden className="tl-line absolute bottom-0 left-[6px] top-0 w-[3px] origin-top bg-kop md:left-[182px]" />
      {timeline.map((t) => (
        <li key={t.title} className="tl-item relative grid gap-3 pb-16 pl-10 last:pb-0 md:grid-cols-[160px_1fr] md:gap-16 md:pl-0">
          <span aria-hidden className="tl-dot absolute left-0 top-1.5 size-[17px] rounded-full border-[3px] border-kop bg-paper md:left-[175px]" />
          <p className="md:text-right">
            <span className="tl-date inline-flex rounded-full bg-ink px-3 py-1.5 text-sm font-bold text-paper">{t.date}</span>
          </p>
          <div className="tl-body">
            <h3 className="text-2xl font-extrabold leading-tight md:text-3xl">{t.title}</h3>
            <p className="mt-2 max-w-xl text-lg leading-relaxed text-[var(--s-muted)]">{t.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
