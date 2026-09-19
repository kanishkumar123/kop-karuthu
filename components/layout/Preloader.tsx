"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { lockScroll } from "@/lib/lenis";

const KEY = "kk-intro-seen";

/**
 * Branded intro, once per browser session:
 * KOP drops in letter by letter → KARUTHU draws as an outline then fills → counter + chant waveform → curtain splits.
 * The inline script hides it before paint on repeat visits.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      setDone(true);
      return;
    }

    lockScroll(true);
    const counter = { v: 0 };
    const num = el.querySelector<HTMLElement>("[data-count]")!;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {}
        lockScroll(false);
        document.documentElement.classList.add("kk-seen");
        setDone(true);
        window.dispatchEvent(new Event("kk:intro-done"));
      },
    });

    tl.from(el.querySelectorAll("[data-letter]"), {
      scale: 2.6,
      opacity: 0,
      rotate: () => gsap.utils.random(-14, 14),
      duration: 0.5,
      stagger: 0.14,
      ease: "back.out(2.2)",
    })
      .fromTo("[data-karuthu]", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power2.inOut" }, "-=0.1")
      .to("[data-karuthu-fill]", { opacity: 1, duration: 0.35 }, "-=0.1")
      .to(counter, {
        v: 100,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          num.textContent = String(Math.round(counter.v)).padStart(3, "0");
        },
      }, 0.2)
      .to("[data-stage]", { scale: 0.92, opacity: 0, duration: 0.45, ease: "power2.in" }, "+=0.15")
      .to("[data-curtain-top]", { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, "-=0.1")
      .to("[data-curtain-bottom]", { yPercent: 100, duration: 0.8, ease: "expo.inOut" }, "<");

    return () => {
      tl.kill();
      lockScroll(false);
    };
  }, []);

  if (done) return null;

  return (
    <div ref={root} id="kk-preloader" className="fixed inset-0 z-[200] [--outline:var(--color-paper)]" role="presentation" aria-hidden>
      <div data-curtain-top className="absolute inset-x-0 top-0 h-1/2 bg-night" />
      <div data-curtain-bottom className="absolute inset-x-0 bottom-0 h-1/2 bg-night" />

      <div data-stage className="absolute inset-0 grid place-items-center text-paper">
        <div className="text-center">
          <p className="display flex justify-center text-[28vw] leading-[0.8] text-kop md:text-[18vw]">
            {"KOP".split("").map((l, i) => (
              <span key={i} data-letter className="inline-block">
                {l}
              </span>
            ))}
          </p>
          <div data-karuthu className="relative mt-1">
            <p className="display outline-text text-[15vw] leading-[0.85] md:text-[9.5vw]">Karuthu</p>
            <p data-karuthu-fill className="display absolute inset-0 text-[15vw] leading-[0.85] text-flood opacity-0 md:text-[9.5vw]">
              Karuthu
            </p>
          </div>
        </div>

        <div className="absolute inset-x-5 bottom-6 flex items-end justify-between md:inset-x-10 md:bottom-10">
          <div className="flex h-10 items-end gap-[3px]" aria-hidden>
            {Array.from({ length: 22 }).map((_, i) => (
              <span
                key={i}
                className="w-[3px] origin-bottom rounded-full bg-kop"
                style={{
                  height: "100%",
                  animation: `chant ${0.6 + (i % 5) * 0.12}s ${i * 0.04}s ease-in-out infinite alternate`,
                }}
              />
            ))}
          </div>
          <p className="text-right">
            <span data-count className="block text-5xl font-extralight tabular-nums md:text-7xl">
              000
            </span>
            <span className="text-sm text-paper/60">Warming up the Kop</span>
          </p>
        </div>
      </div>
      <style>{`@keyframes chant{from{transform:scaleY(.15)}to{transform:scaleY(1)}}`}</style>
    </div>
  );
}

/** Runs before hydration so returning visitors never see a flash of the intro. */
export const preloaderScript = `try{if(sessionStorage.getItem("${KEY}")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("kk-seen")}}catch(e){}`;
