"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Video } from "@/lib/youtube";
import { EpisodeCard } from "@/components/media/EpisodeCard";

type Item = { v: Video; no: number };
type Page = { items: Item[]; next: number | null; matches: number; total: number };

const suggestions = ["Review", "Watchalong", "Preview", "Salah", "World Cup", "Women", "Transfer"];

export function EpisodesBrowser({ initial, total, initialNext }: { initial: Item[]; total: number; initialNext: number | null }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>(initial);
  const [next, setNext] = useState<number | null>(initialNext);
  const [matches, setMatches] = useState(total);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const sentinel = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);

  const load = useCallback(async (query: string, cursor: number, append: boolean) => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/episodes?q=${encodeURIComponent(query)}&cursor=${cursor}`);
      if (!res.ok) throw new Error(String(res.status));
      const data: Page = await res.json();
      if (id !== reqId.current) return;
      startTransition(() => {
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
        setNext(data.next);
        setMatches(data.matches);
      });
    } catch {
      if (id === reqId.current) setError("Episodes didn't load. Check your connection and try again.");
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);

  // Debounced search
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => load(q, 0, false), 280);
    return () => clearTimeout(t);
  }, [q, load]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinel.current;
    if (!el || next == null) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !loading && next != null) load(q, next, true);
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [next, loading, q, load]);

  return (
    <div>
      {/* Sticky search */}
      <div className="sticky top-[5.5rem] z-30">
        <label className="group relative block">
          <span className="sr-only">Search episodes</span>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-6 top-1/2 size-6 -translate-y-1/2 text-ink/50" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by player, opponent, scoreline…"
            className="h-16 w-full rounded-full border-2 border-ink bg-[#f6eedd] pl-16 pr-36 text-lg font-medium text-ink shadow-[0_12px_30px_-18px_rgb(28_20_22/0.5)] outline-none placeholder:text-ink/40 focus:border-kop"
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm tabular-nums text-ink/60" aria-live="polite">
            {loading ? "Searching…" : `${matches} ${matches === 1 ? "episode" : "episodes"}`}
          </span>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setQ((cur) => (cur.toLowerCase() === s.toLowerCase() ? "" : s))}
            aria-pressed={q.toLowerCase() === s.toLowerCase()}
            className="rounded-full border border-ink/25 px-4 py-1.5 text-sm font-medium transition-colors hover:border-ink aria-pressed:border-kop aria-pressed:bg-kop aria-pressed:text-paper"
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-10 flex items-center gap-4 rounded-xl bg-kop/10 p-5 text-ink">
          <p>{error}</p>
          <button type="button" onClick={() => load(q, 0, false)} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper">
            Try again
          </button>
        </div>
      )}

      {!loading && items.length === 0 && !error ? (
        <div className="py-24 text-center">
          <p className="display text-5xl text-kop">Nothing yet</p>
          <p className="mt-3 text-xl">No episodes match &ldquo;{q}&rdquo;.</p>
          <button type="button" onClick={() => setQ("")} className="mt-6 rounded-full border-2 border-ink px-5 py-2.5 font-semibold hover:bg-ink hover:text-paper">
            Clear search
          </button>
        </div>
      ) : (
        <motion.ul layout className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map(({ v, no }, i) => (
              <motion.li
                key={v.id}
                layout
                initial={{ opacity: 0, y: 40, rotate: (i % 3) - 1 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: Math.min(i % 24, 8) * 0.03 }}
              >
                <EpisodeCard video={v} no={no} className="h-full" />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <div ref={sentinel} className="h-px" />
      {next != null && (
        <div className="mt-14 text-center">
          <button
            type="button"
            disabled={loading}
            onClick={() => load(q, next, true)}
            className="rounded-full bg-ink px-8 py-4 font-semibold text-paper transition-colors hover:bg-kop disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load more episodes"}
          </button>
        </div>
      )}
    </div>
  );
}
