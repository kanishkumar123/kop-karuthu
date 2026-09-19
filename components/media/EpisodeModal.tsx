"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { closeEpisode, useEpisode } from "@/lib/episodeStore";
import { lockScroll } from "@/lib/lenis";
import { compact, formatDate, formatDuration, splitTitle } from "@/lib/utils";

/** Global player sheet. Cards morph into it via a shared layoutId. */
export function EpisodeModal() {
  const { video, no } = useEpisode();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playing = !!video && playingId === video.id;
  const closeBtn = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!video) return;
    lastFocus.current = document.activeElement as HTMLElement;
    lockScroll(true);
    const t = setTimeout(() => closeBtn.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEpisode();
      if (e.key === "Tab" && dialog.current) {
        const f = dialog.current.querySelectorAll<HTMLElement>("button, a[href], iframe");
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
      lastFocus.current?.focus?.();
    };
  }, [video]);

  const t = video ? splitTitle(video.title) : null;

  return (
    <AnimatePresence>
      {video && t && (
        <motion.div
          key="ep-modal"
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-8"
          initial={{ opacity: 1 }}
          exit={{ opacity: 1 }}
        >
          <motion.div
            className="absolute inset-0 bg-night/85 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEpisode}
          />
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ep-modal-title"
            className="relative w-full max-w-5xl"
          >
            <motion.div layoutId={`ep-media-${video.id}`} className="relative aspect-video w-full overflow-hidden rounded-[14px] bg-night shadow-2xl">
              {playing ? (
                <iframe
                  className="absolute inset-0 size-full"
                  src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <button type="button" onClick={() => setPlayingId(video.id)} className="group absolute inset-0" aria-label="Play episode">
                  {video.thumbnail && <Image src={video.thumbnail} alt="" fill sizes="(min-width:1024px) 1024px, 100vw" className="object-cover" />}
                  <span className="absolute inset-0 bg-gradient-to-t from-night/70 to-transparent" />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-20 place-items-center rounded-full bg-kop text-paper shadow-[0_0_0_12px_rgb(224_16_47/0.25)] transition-transform duration-300 group-hover:scale-110 md:size-24">
                      <svg viewBox="0 0 24 24" className="ml-1 size-9" fill="currentColor" aria-hidden>
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                </button>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
              exit={{ opacity: 0, y: 10, transition: { duration: 0.15 } }}
              className="mt-4 flex flex-col gap-4 text-paper md:flex-row md:items-end md:justify-between"
            >
              <div>
                <p className="text-sm text-paper/60">
                  {no ? `No. ${no}, ` : ""}
                  {formatDate(video.publishedAt, { day: "numeric", month: "long", year: "numeric" })}
                  {video.duration ? `, ${formatDuration(video.duration)}` : ""}
                  {video.views != null ? `, ${compact(video.views)} views` : ""}
                </p>
                <h2 id="ep-modal-title" className="mt-1 text-2xl font-extrabold leading-tight md:text-3xl">
                  {t.hook}
                </h2>
                {t.rest && <p className="mt-1 text-sm uppercase tracking-wide text-paper/70">{t.rest}</p>}
              </div>
              <div className="flex shrink-0 gap-2">
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-paper/25 px-5 py-3 text-sm font-semibold hover:border-kop hover:text-kop"
                >
                  Open on YouTube
                </a>
                <button
                  ref={closeBtn}
                  type="button"
                  onClick={closeEpisode}
                  className="rounded-full bg-paper px-5 py-3 text-sm font-semibold text-ink hover:bg-kop hover:text-paper"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
