"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useParallax } from "@/lib/useParallax";
import { useIntroDone } from "@/lib/useIntro";

gsap.registerPlugin(useGSAP);

/** Studio-style header for inner pages: giant title, short intro, optional right slot. */
export function PageHeader({
  title,
  intro,
  aside,
  children,
}: {
  title: ReactNode;
  intro?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  const intro_ = useIntroDone();
  useParallax(root);

  useGSAP(
    () => {
      if (!intro_) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".ph-line", { yPercent: 105, duration: 1.1, ease: "expo.out", stagger: 0.08 });
        gsap.from(".ph-fade", { y: 20, opacity: 0, duration: 0.9, delay: 0.3, ease: "power3.out", stagger: 0.08 });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [intro_] },
  );

  return (
    <section
      ref={root}
      data-theme="studio"
      data-solid
      data-parallax-root
      className="relative overflow-hidden pb-14 pt-36 md:pb-20 md:pt-44"
    >
      {/* Oversized red glow, drifting */}
      <div
        aria-hidden
        data-speed="-0.4"
        className="pointer-events-none absolute -right-[20vw] -top-[30vw] size-[70vw] rounded-full bg-[radial-gradient(circle,rgb(224_16_47/0.35),transparent_65%)]"
      />
      <div className="relative mx-auto max-w-[1500px] px-4 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="display text-[clamp(3.6rem,12vw,11rem)]">
              <span className="block overflow-hidden pb-[0.05em]">
                <span className="ph-line block">{title}</span>
              </span>
            </h1>
            {intro && <p className="ph-fade mt-6 max-w-xl text-lg leading-relaxed text-paper/75 md:text-xl">{intro}</p>}
          </div>
          {aside && <div className="ph-fade">{aside}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
