"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { heroSlides } from "@/lib/images";
import { useIntroDone } from "@/lib/useIntro";
import { useParallax } from "@/lib/useParallax";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

const HeroInk = dynamic(() => import("@/components/webgl/HeroInk").then((m) => m.HeroInk), { ssr: false });

export function Hero({ card }: { card: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const intro = useIntroDone();
  const motionOk = useMediaQuery("(prefers-reduced-motion: no-preference)");
  const [noGl, setNoGl] = useState(false);
  const onUnsupported = useCallback(() => setNoGl(true), []);
  const webgl = motionOk && !noGl;
  useParallax(root);

  useGSAP(
    () => {
      if (!intro) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set("[data-hero-in]", { opacity: 1 });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo("[data-hero-in]", { opacity: 0 }, { opacity: 1, duration: 0.01 })
        .from(".hero-kop .ch", { yPercent: 110, rotate: 8, duration: 1.2, stagger: 0.07 }, 0)
        .from(".hero-karuthu .ch", { yPercent: -110, duration: 1.2, stagger: 0.045 }, 0.15)
        .from(".hero-sub", { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.6)
        .from(".hero-card", { y: 60, opacity: 0, rotate: 6, duration: 1.3 }, 0.7);
    },
    { scope: root, dependencies: [intro] },
  );

  return (
    <section
      ref={root}
      data-theme="studio"
      data-solid
      data-parallax-root
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden pb-8 pt-28 md:pb-12"
      aria-labelledby="hero-title"
    >
      {/* Background: B&W photos (always) + fluid-ink colour reveal (WebGL) */}
      <div className="absolute inset-0 -z-10" data-speed="-0.25">
        <div className="absolute inset-0 scale-110">
          {heroSlides.map((s, i) => (
            <Image
              key={s.src}
              src={s.src}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className={cn(
                "object-cover grayscale contrast-125 brightness-75",
                // without WebGL (motion still allowed) the slides simply crossfade
                i > 0 && (noGl && motionOk ? "animate-[heroFade_16s_ease-in-out_infinite]" : "opacity-0"),
              )}
              style={{ objectPosition: s.focal }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-night/50" />
          {webgl && <HeroInk active={intro} slides={heroSlides} onUnsupported={onUnsupported} />}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_88%,rgb(21_10_12/0.8),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-night/75 to-transparent" />
        </div>
      </div>

      <div data-hero-in className="mx-auto w-full max-w-[1500px] px-4 opacity-0 md:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_380px]">
          <div data-speed="0.12">
            <p className="hero-sub mb-5 flex items-center gap-3 text-[15px] text-paper/80">
              <span className="inline-block size-2 rounded-full bg-kop animate-pulse-dot" aria-hidden />
              A Tamil Liverpool FC fan podcast
            </p>
            <h1 id="hero-title" className="display text-paper">
              <span className="sr-only">Kop Karuthu</span>
              <span aria-hidden className="hero-kop block overflow-hidden pb-[0.04em] text-[clamp(6rem,27vw,26rem)] leading-[0.78] text-kop">
                {"Kop".split("").map((c, i) => (
                  <span key={i} className="ch inline-block">
                    {c}
                  </span>
                ))}
              </span>
              <span aria-hidden className="hero-karuthu mt-[-0.04em] block overflow-hidden text-[clamp(3.2rem,13.2vw,12.6rem)] leading-[0.86]">
                {"Karuthu".split("").map((c, i) => (
                  <span key={i} className="ch outline-text inline-block">
                    {c}
                  </span>
                ))}
              </span>
            </h1>
            <p className="hero-sub mt-7 max-w-md text-lg leading-snug text-paper/85 md:text-xl">
              The Kop&rsquo;s opinion. Match previews, reviews and live watchalongs with Gowtham &amp; Seshadhri.
            </p>
          </div>

          <div className="hero-card lg:mb-4" data-speed="0.3">
            {card}
          </div>
        </div>

        <div className="hero-sub mt-12 flex items-center justify-between border-t border-paper/15 pt-5 text-sm text-paper/60">
          <span>On YouTube since 28 Feb 2022</span>
          {webgl && <span className="hidden text-paper/50 md:inline">Move across the photo to stir the colour back in</span>}
          <span className="flex items-center gap-2">
            Scroll
            <span className="relative block h-8 w-px overflow-hidden bg-paper/20">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-kop" />
            </span>
          </span>
        </div>
      </div>
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}@keyframes heroFade{0%,40%{opacity:0}50%,90%{opacity:1}100%{opacity:0}}`}</style>
    </section>
  );
}
