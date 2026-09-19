"use client";

import dynamic from "next/dynamic";

const KopGlobe = dynamic(() => import("@/components/webgl/KopGlobe").then((m) => m.KopGlobe), {
  ssr: false,
  loading: () => <div className="aspect-square w-full" />,
});

export function ClientGlobe() {
  return <KopGlobe className="mx-auto aspect-square w-full max-w-[680px]" />;
}
