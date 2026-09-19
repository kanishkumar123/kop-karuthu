"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis } from "@/lib/lenis";

gsap.registerPlugin(ScrollTrigger);

/**
 * One client island that owns global scroll behaviour:
 *  - Lenis smooth scroll driven by GSAP's ticker (so ScrollTrigger stays in sync)
 *  - [data-theme] sections swap the page theme (studio ⇄ fanzine) as they cross centre
 * All of it is skipped under prefers-reduced-motion.
 */
export function ScrollEffects() {
  const pathname = usePathname();

  // Lenis — lives for the whole session
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: { offset: -80 } });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Content streams in (Suspense) → keep trigger positions honest
    let t: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    ro.observe(document.body);

    document.documentElement.classList.add("js-theme");

    return () => {
      ro.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
      document.documentElement.classList.remove("js-theme");
    };
  }, []);

  // Per-page: scroll to top + theme triggers (parallax lives in useParallax)
  useEffect(() => {
    window.scrollTo(0, 0);

    const setTheme = (theme: string) => {
      document.body.dataset.pageTheme = theme;
    };

    const ctx = gsap.context(() => {
      // Theme swapping
      const sections = gsap.utils.toArray<HTMLElement>("[data-theme]");
      if (sections[0]) setTheme(sections[0].dataset.theme!);
      sections.forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          // refresh after pinned sections have added their spacers
          refreshPriority: -10,
          onToggle: (self) => self.isActive && setTheme(el.dataset.theme!),
        });
      });

    });

    const id = requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
    return () => {
      cancelAnimationFrame(id);
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
