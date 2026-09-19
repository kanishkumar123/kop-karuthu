"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Children marked [data-deal] get dealt onto the table like tickets when scrolled into view. */
export function DealIn({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = Array.from(root.current!.querySelectorAll<HTMLElement>("[data-deal]"));
        gsap.set(items, { opacity: 0 });
        ScrollTrigger.batch(items, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { y: 120, rotate: () => gsap.utils.random(-7, 7), opacity: 0 },
              { y: 0, rotate: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.09, overwrite: true },
            ),
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );
  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
