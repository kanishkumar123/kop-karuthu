"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const KopGlobe = dynamic(() => import("@/components/webgl/KopGlobe").then((m) => m.KopGlobe), {
  ssr: false,
  loading: () => <div className="aspect-square w-full" />,
});

/**
 * The globe is expensive to spin up, so it only mounts once it's nearly on
 * screen — the home page's first paint shouldn't be competing with it.
 */
export function ClientGlobe() {
  const holder = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={holder} className="mx-auto aspect-square w-full max-w-[680px]">
      {near && <KopGlobe className="size-full" />}
    </div>
  );
}
