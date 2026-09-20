"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { Video } from "@/lib/youtube";
import { openEpisode } from "@/lib/episodeStore";
import { cn, episodeKind, formatDate, formatDuration, splitTitle, compact } from "@/lib/utils";
import { Pill } from "@/components/ui/Pill";

const kindLabel = { watchalong: "Watchalong", review: "Review", preview: "Preview", episode: "Episode" } as const;

/** Matchday ticket stub. Duotone thumb goes full colour on hover. */
export function EpisodeCard({ video, no, className, size = "md" }: { video: Video; no?: number; className?: string; size?: "md" | "lg" }) {
  const { hook, rest } = splitTitle(video.title);
  const kind = episodeKind(video.title);

  return (
    <motion.button
      type="button"
      onClick={() => openEpisode(video, no)}
      whileHover={{ y: -6, rotate: -0.6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn(
        "group relative flex w-full flex-col text-left text-ink",
        className,
      )}
      aria-label={`Play: ${video.title}`}
    >
      {/* thumb */}
      <motion.div
        layoutId={`ep-media-${video.id}`}
        className={cn("relative aspect-video w-full overflow-hidden rounded-t-[10px] bg-night", size === "lg" && "lg:aspect-auto lg:min-h-[340px] lg:flex-1")}
      >
        {video.thumbnail && (
          <Image
            src={video.thumbnail}
            alt=""
            fill
            sizes={size === "lg" ? "(min-width:1024px) 60vw, 100vw" : "(min-width:1024px) 30vw, (min-width:640px) 50vw, 100vw"}
            className="object-cover grayscale transition duration-700 ease-[var(--ease-kop)] group-hover:scale-[1.04] group-hover:grayscale-0"
          />
        )}
        <div className="absolute inset-0 bg-kop mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0" />
        <Pill tone={kind === "watchalong" ? "kop" : "glass"} dot={kind === "watchalong"} className="absolute left-3 top-3">
          {kindLabel[kind]}
        </Pill>
        {video.duration && (
          <span className="absolute bottom-3 right-3 rounded-full bg-night/85 px-2.5 py-1 text-xs font-semibold tabular-nums text-paper">
            {formatDuration(video.duration)}
          </span>
        )}
        <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="grid size-16 scale-75 place-items-center rounded-full bg-paper text-kop shadow-xl transition-transform duration-500 group-hover:scale-100">
            <svg viewBox="0 0 24 24" className="ml-1 size-7" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </motion.div>

      {/* stub body */}
      <div
        className={cn(
          "relative rounded-b-[10px] bg-[#f6eedd] px-5 pb-5 pt-4 shadow-[0_1px_0_rgb(28_20_22/0.08),0_18px_40px_-24px_rgb(28_20_22/0.45)]",
          size !== "lg" && "flex-1",
        )}
      >
        <div className="flex items-baseline justify-between gap-4 text-[13px] text-ink/60">
          {no ? <span className="font-bold text-kop">No. {no}</span> : <span />}
          <time dateTime={video.publishedAt}>{formatDate(video.publishedAt)}</time>
        </div>
        <p
          className={cn(
            "mt-2 font-extrabold leading-[1.08] tracking-[-0.01em]",
            "text-[1.3rem]",
            size === "lg" && "md:text-[2.2rem]",
          )}
        >
          {hook}
        </p>
        {rest && <p className="mt-2 line-clamp-2 text-sm font-medium uppercase tracking-wide text-ink/65">{rest}</p>}

        {/* perforation */}
        <div className="relative -mx-5 mt-4 border-t-2 border-dashed border-ink/15">
          <span className="absolute -left-2 -top-2 size-4 rounded-full bg-[var(--s-bg)]" />
          <span className="absolute -right-2 -top-2 size-4 rounded-full bg-[var(--s-bg)]" />
        </div>
        <div className="mt-3 flex items-center justify-between text-[13px] text-ink/60">
          <span>{video.views != null ? `${compact(video.views)} views` : "Kop Karuthu"}</span>
          <span className="font-semibold text-ink transition-colors group-hover:text-kop">Watch</span>
        </div>
      </div>
    </motion.button>
  );
}
