"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Giant outlined wordmark whose red fill wipes up as the footer scrolls in. */
export function FillOnScroll({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set(".fill-layer", { clipPath: "inset(0% 0 0 0)" });
        return;
      }
      gsap.fromTo(
        ".fill-layer",
        { clipPath: "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0 0)",
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 95%", end: "bottom bottom", scrub: 0.6 },
        },
      );
    },
    { scope: root },
  );

  const word = "Kop Karuthu";
  return (
    <div ref={root} aria-hidden className={cn("relative", className)}>
      <p className="display outline-text stroke-kop whitespace-nowrap text-center text-[15.5vw] leading-[0.78]">{word}</p>
      <p className="fill-layer display absolute inset-0 whitespace-nowrap text-center text-[15.5vw] leading-[0.78] text-kop">
        {word}
      </p>
    </div>
  );
}
