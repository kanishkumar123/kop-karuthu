"use client";

import type { RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Parallax for every [data-speed] element inside `scope`.
 * Positive speed drifts up faster than scroll, negative lags behind.
 * Runs inside the owning component so it never touches un-hydrated DOM.
 */
export function useParallax(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        scope.current?.querySelectorAll<HTMLElement>("[data-speed]").forEach((el) => {
          const speed = parseFloat(el.dataset.speed || "0");
          gsap.fromTo(
            el,
            { yPercent: 0 },
            {
              yPercent: speed * -60,
              ease: "none",
              scrollTrigger: {
                trigger: el.closest("[data-parallax-root]") ?? el,
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope },
  );
}
