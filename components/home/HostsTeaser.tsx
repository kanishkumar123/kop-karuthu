"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { hosts } from "@/content/site";
import { hostGowtham, hostSeshadhri } from "@/lib/images";
import { TornPhoto } from "@/components/brand/TornPhoto";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const photos = { gowtham: hostGowtham, seshadhri: hostSeshadhri };

export function HostsTeaser() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 70%", end: "center 55%", scrub: 0.8 } });
        tl.from(".host-left", { xPercent: -40, rotate: -14, opacity: 0 })
          .from(".host-right", { xPercent: 40, rotate: 14, opacity: 0 }, "<")
          .from(".host-vs", { scale: 0, rotate: -90 }, "<0.3");
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} data-theme="fanzine" className="relative overflow-hidden py-24 md:py-36" aria-labelledby="hosts-title">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <div className="text-center">
          <h2 id="hosts-title" className="display text-[clamp(3rem,8vw,7.5rem)]">
            Two fans, <span className="text-kop">one</span> Kop
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[var(--s-muted)] md:text-xl">
            Gowtham and Seshadhri host every episode: the previews, the reviews, the watchalongs and the debates in between.
          </p>
        </div>

        <div className="relative mt-16 grid items-center gap-16 md:grid-cols-[1fr_auto_1fr] md:gap-6">
          <HostCard host={hosts[0]} side="left" />
          <div className="host-vs relative z-10 mx-auto grid size-28 place-items-center rounded-full bg-kop text-paper shadow-[0_0_0_10px_var(--color-paper)] md:size-36">
            <span className="display text-5xl md:text-6xl">vs</span>
          </div>
          <HostCard host={hosts[1]} side="right" />
        </div>

        <div className="mt-16 text-center">
          <Link href="/about" className="inline-flex rounded-full border-2 border-ink px-6 py-3 font-semibold transition-colors hover:bg-ink hover:text-paper">
            Meet the hosts
          </Link>
        </div>
      </div>
    </section>
  );
}

function HostCard({ host, side }: { host: (typeof hosts)[number]; side: "left" | "right" }) {
  const [flipped, setFlipped] = useState(false);
  const left = side === "left";
  return (
    <div className={left ? "host-left" : "host-right"}>
      <div className={`relative mx-auto max-w-[420px] ${left ? "rotate-[-3deg]" : "rotate-[3deg]"}`}>
        <TornPhoto img={photos[host.key]} seed={left ? 11 : 29} className="aspect-[4/5]" sizes="(min-width:768px) 35vw, 90vw" />
        <p className="display absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-4 py-2 text-3xl text-paper md:text-4xl">
          {host.name}
        </p>

        {/* Flip sticker */}
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          onMouseEnter={() => setFlipped(true)}
          onMouseLeave={() => setFlipped(false)}
          aria-pressed={flipped}
          aria-label={`${host.name}'s hottest take`}
          className={`absolute ${left ? "-right-4 top-8" : "-left-4 top-8"} size-32 md:size-36`}
          style={{ perspective: 800 }}
        >
          <motion.span
            className="relative block size-full"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <span
              className="absolute inset-0 grid place-items-center rounded-full bg-flood p-3 text-center text-sm font-extrabold leading-tight text-ink shadow-lg"
              style={{ backfaceVisibility: "hidden", rotate: left ? "12deg" : "-12deg" }}
            >
              Hottest
              <br />
              take
            </span>
            <span
              className="absolute inset-0 grid place-items-center rounded-full bg-ink p-4 text-center text-[12px] font-semibold leading-snug text-paper shadow-lg"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              {host.take}
            </span>
          </motion.span>
        </button>
      </div>
    </div>
  );
}
