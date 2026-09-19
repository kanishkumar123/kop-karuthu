"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Pinned manifesto: words light up one by one as you scroll (Magic UI TextReveal idea, GSAP-driven).
 * Words wrapped in *asterisks* are set in Kop red.
 */
export function TextReveal({ text, className }: { text: string; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const words = text.split(/\s+/);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".tr-word",
          { opacity: 0.12 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: "+=180%", scrub: true, pin: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex min-h-[100svh] items-center">
      <p className={cn("mx-auto max-w-[1300px] px-4 text-[clamp(2rem,5.2vw,4.8rem)] font-bold leading-[1.08] tracking-[-0.025em] md:px-8", className)}>
        {words.map((w, i) => {
          const accent = /^\*.*\*[.,]?$/.test(w);
          const clean = w.replace(/\*/g, "");
          return (
            <span key={i} className={cn("tr-word inline-block", accent && "text-kop")}>
              {clean}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </p>
    </div>
  );
}
