"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { kopFromStand } from "@/lib/images";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Pinned, scrubbed explainer of the name:
 * KOP (the stand) → KARUTHU (Tamil for opinion) → they collide into THE KOP'S OPINION, underlined.
 */
export function NameMeaning() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".nm-static", { display: "none" });
        gsap.set(".nm-stage", { display: "block" });
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=260%",
            scrub: 0.8,
            pin: ".nm-pin",
          },
        });
        tl.from(".nm-kop-photo", { clipPath: "inset(50% 50% 50% 50%)", duration: 1 })
          .to({}, { duration: 0.4 })
          .from(".nm-kar", { xPercent: 60, opacity: 0, duration: 1 })
          .from(".nm-kar-cap", { y: 40, opacity: 0, duration: 0.6 }, "<0.4")
          .to({}, { duration: 0.4 })
          .to([".nm-kop-cap", ".nm-kar-cap", ".nm-kop-photo"], { opacity: 0, duration: 0.5 })
          .to(".nm-kop", { xPercent: 40, yPercent: -30, scale: 0.55, opacity: 0, duration: 1 }, "<")
          .to(".nm-kar", { xPercent: -30, yPercent: -40, scale: 0.55, opacity: 0, duration: 1 }, "<")
          .from(".nm-final .w", { yPercent: 120, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out" }, "-=0.4")
          .fromTo(".nm-underline", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.inOut" })
          .to({}, { duration: 0.6 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} data-theme="fanzine" className="relative" aria-labelledby="nm-title">
      <h2 id="nm-title" className="sr-only">
        What does Kop Karuthu mean?
      </h2>

      {/* Animated stage */}
      <div className="nm-pin nm-stage hidden h-[100svh] overflow-hidden">
        <div className="relative mx-auto grid h-full max-w-[1500px] place-items-center px-4 md:px-8">
          {/* KOP */}
          <div className="nm-kop absolute left-4 top-[14%] md:left-8 md:top-[12%]">
            <div className="relative">
              <p className="display text-[34vw] leading-[0.78] text-ink md:text-[24vw]">Kop</p>
              <p
                aria-hidden
                className="nm-kop-photo display absolute inset-0 bg-cover bg-center text-[34vw] leading-[0.78] text-transparent md:text-[24vw]"
                style={{
                  backgroundImage: `url("${kopFromStand.src}")`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  filter: "grayscale(1) contrast(1.35) brightness(0.8)",
                  clipPath: "inset(0 0 0 0)",
                }}
              >
                Kop
              </p>
            </div>
            <p className="nm-kop-cap mt-4 max-w-sm text-lg leading-snug md:text-xl">
              <strong className="font-extrabold">The Spion Kop.</strong> The terrace behind the goal at Anfield, where Liverpool&rsquo;s loudest supporters stand.
            </p>
          </div>

          {/* KARUTHU */}
          <div className="nm-kar absolute bottom-[10%] right-4 text-right md:right-8">
            <p className="display outline-text stroke-kop text-[20vw] leading-[0.85] md:text-[13vw]">Karuthu</p>
            <p className="nm-kar-cap ml-auto mt-3 max-w-sm text-lg leading-snug md:text-xl">
              <strong className="font-extrabold">Karuthu</strong> is Tamil for an opinion, a view, a take. We have a lot of them.
            </p>
          </div>

          {/* THE KOP'S OPINION */}
          <div className="nm-final relative text-center">
            <p className="display overflow-hidden text-[16vw] leading-[0.82] md:text-[11vw]">
              <span className="w inline-block">The</span>{" "}
              <span className="w inline-block text-kop">Kop&rsquo;s</span>
            </p>
            <div className="relative inline-block">
              <p className="display overflow-hidden text-[16vw] leading-[0.82] md:text-[11vw]">
                <span className="w inline-block">Opinion</span>
              </p>
              <span
                aria-hidden
                className="nm-underline absolute inset-x-0 top-full mt-[0.12em] block h-[0.07em] origin-left rounded-full bg-kop text-[16vw] md:text-[11vw]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Static version (reduced motion / no JS) */}
      <div className="nm-static mx-auto max-w-[1500px] px-4 py-24 md:px-8 md:py-36">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="display text-[26vw] text-ink md:text-[13vw]">Kop</p>
            <p className="mt-4 max-w-sm text-lg">
              <strong>The Spion Kop.</strong> The terrace behind the goal at Anfield, where Liverpool&rsquo;s loudest supporters stand.
            </p>
          </div>
          <div className="md:text-right">
            <p className="display text-[20vw] text-kop md:text-[11vw]">Karuthu</p>
            <p className="mt-4 max-w-sm text-lg md:ml-auto">
              <strong>Karuthu</strong> is Tamil for an opinion, a view, a take. We have a lot of them.
            </p>
          </div>
        </div>
        <p className="display mt-16 text-center text-[13vw] md:text-[8vw]">
          The <span className="text-kop">Kop&rsquo;s</span> opinion
        </p>
      </div>
    </section>
  );
}
