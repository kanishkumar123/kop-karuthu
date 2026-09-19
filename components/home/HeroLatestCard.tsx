"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { Video } from "@/lib/youtube";
import { openEpisode } from "@/lib/episodeStore";
import { formatDate, formatDuration, splitTitle } from "@/lib/utils";

/** The hero's floating "latest episode" card. Tilts toward the pointer. */
export function HeroLatestCard({ video, no }: { video: Video | null; no?: number }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 15 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 15 });

  if (!video) {
    return (
      <a
        href="https://www.youtube.com/@kopkaruthu"
        target="_blank"
        rel="noreferrer"
        className="block rounded-2xl border border-paper/20 bg-night/60 p-6 text-paper backdrop-blur"
      >
        <p className="text-sm text-paper/60">Latest episode</p>
        <p className="mt-2 text-2xl font-bold">Watch the newest episode on YouTube</p>
      </a>
    );
  }

  const { hook, rest } = splitTitle(video.title);

  return (
    <motion.button
      type="button"
      onClick={() => openEpisode(video, no)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className="group block w-full rotate-[2deg] rounded-2xl bg-paper p-2.5 text-left text-ink shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)]"
      aria-label={`Play latest episode: ${video.title}`}
    >
      <motion.div layoutId={`ep-media-${video.id}`} className="relative aspect-video overflow-hidden rounded-xl bg-night">
        {video.thumbnail && <Image src={video.thumbnail} alt="" fill sizes="380px" className="object-cover" />}
        <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-kop px-2.5 py-1 text-xs font-bold text-paper">
          <span className="size-1.5 rounded-full bg-paper" /> Latest
        </span>
        {video.duration && (
          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-night/85 px-2 py-0.5 text-xs font-semibold tabular-nums text-paper">
            {formatDuration(video.duration)}
          </span>
        )}
      </motion.div>
      <div className="px-2 pb-2 pt-3">
        <p className="flex justify-between text-xs text-ink/60">
          {no ? <span className="font-bold text-kop">No. {no}</span> : <span />}
          <span>{formatDate(video.publishedAt)}</span>
        </p>
        <p className="mt-1 text-lg font-extrabold leading-tight">{hook}</p>
        {rest && <p className="mt-1 line-clamp-1 text-xs font-medium uppercase tracking-wide text-ink/60">{rest}</p>}
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
          <span className="grid size-7 place-items-center rounded-full bg-ink text-paper transition-colors group-hover:bg-kop">
            <svg viewBox="0 0 24 24" className="ml-0.5 size-3.5" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          Play episode
        </p>
      </div>
    </motion.button>
  );
}
