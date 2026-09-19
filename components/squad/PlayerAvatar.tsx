import Image from "next/image";
import type { Player } from "@/lib/fpl";
import { initials } from "@/lib/squadMath";
import { cn } from "@/lib/utils";

/**
 * Circular head-and-shoulders avatar.
 * The PL cutouts put the head right at the top edge, so the image is enlarged
 * and pushed down inside the circle, leaving headroom instead of chopping the head.
 */
export function PlayerAvatar({ player, fallback, size = 56, className }: { player: Player | null; fallback?: string; size?: number; className?: string }) {
  const photo = player?.photo;
  return (
    <span
      className={cn("relative block shrink-0 overflow-hidden rounded-full bg-kop", className)}
      style={{ width: size, height: size }}
    >
      {photo ? (
        photo.kind === "cutout" ? (
          <span className="absolute -inset-x-[22%] top-[10%] h-[150%]">
            <Image src={photo.src} alt="" fill sizes={`${Math.round(size * 1.5)}px`} className="object-contain object-top" />
          </span>
        ) : (
          <Image
            src={photo.src}
            alt=""
            fill
            unoptimized
            sizes={`${size}px`}
            className="object-cover grayscale"
            style={{ objectPosition: "50% 15%" }}
          />
        )
      ) : (
        <span className="grid size-full place-items-center text-sm font-black text-paper">{fallback ?? (player ? initials(player.name) : "")}</span>
      )}
    </span>
  );
}
