"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { globeMarkers } from "@/content/site";

/** Kop-red dotted globe. Drag to spin; idles slowly otherwise. */
export function KopGlobe({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointer = useRef<number | null>(null);
  const drag = useRef(0);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let phi = 4.2; // start facing the Indian Ocean
    let width = el.offsetWidth;
    let visible = true;
    const onResize = () => (width = el.offsetWidth);
    window.addEventListener("resize", onResize);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const globe = createGlobe(el, {
      devicePixelRatio: Math.min(2, window.devicePixelRatio),
      width: width * 2,
      height: width * 2,
      phi,
      theta: 0.25,
      dark: 1,
      diffuse: 1.4,
      mapSamples: 18000,
      mapBrightness: 5,
      baseColor: [0.22, 0.09, 0.11],
      markerColor: [0.97, 0.91, 0.69],
      glowColor: [0.55, 0.06, 0.12],
      markers: globeMarkers.map((m) => ({ location: m.location, size: m.size })),
      // Every line leads back to Anfield
      arcs: globeMarkers
        .filter((m) => m.label !== "Liverpool")
        .map((m) => ({ from: m.location, to: [53.43, -2.96] as [number, number] })),
      arcColor: [0.88, 0.06, 0.18],
      arcWidth: 0.6,
      arcHeight: 0.3,
    });

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      if (pointer.current === null && !reduce) phi += 0.0025;
      globe.update({ phi: phi + drag.current, width: width * 2, height: width * 2 });
    };
    raf = requestAnimationFrame(loop);
    requestAnimationFrame(() => (el.style.opacity = "1"));

    return () => {
      cancelAnimationFrame(raf);
      globe.destroy();
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className={className}>
      <canvas
        ref={canvas}
        aria-label="Globe showing where Tamil-speaking Liverpool fans tune in from"
        role="img"
        className="aspect-square size-full cursor-grab opacity-0 transition-opacity duration-1000 active:cursor-grabbing"
        onPointerDown={(e) => {
          pointer.current = e.clientX - drag.current * 200;
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerUp={() => (pointer.current = null)}
        onPointerCancel={() => (pointer.current = null)}
        onPointerMove={(e) => {
          if (pointer.current !== null) drag.current = (e.clientX - pointer.current) / 200;
        }}
        style={{ touchAction: "pan-y" }}
      />
    </div>
  );
}
