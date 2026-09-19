import type { TrophyKey } from "@/content/legends";

/** Minimal silhouettes, drawn to be told apart at 24px. */
const paths: Record<TrophyKey, React.ReactNode> = {
  // League: crowned cup
  league: (
    <>
      <path d="M8 3l2 2 2-3 2 3 2-2v4H8z" />
      <path d="M7 8h10v3a5 5 0 0 1-10 0z" />
      <path d="M11 15h2v3h3v3H8v-3h3z" />
    </>
  ),
  // European Cup: big ears
  euro: (
    <>
      <path d="M8 4h8v6a4 4 0 0 1-8 0z" />
      <path d="M8 5C3 4 2 11 7.5 12M16 5c5-1 6 6 .5 7" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 14h2v4h3v3H8v-3h3z" />
    </>
  ),
  // FA Cup: lidded cup with side handles
  fa: (
    <>
      <path d="M10 2h4v2h-4z" />
      <path d="M8 5h8l-1 7a3 3 0 0 1-6 0z" />
      <path d="M8 6H5v3l3 2M16 6h3v3l-3 2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 15h2v3h3v3H8v-3h3z" />
    </>
  ),
  // League Cup: three-handled urn
  leaguecup: (
    <>
      <path d="M7 4h10l-1.5 8a3.5 3.5 0 0 1-7 0z" />
      <path d="M7 5H4v4l4 1M17 5h3v4l-4 1" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="8" r="1.2" fill="var(--trophy-bg, #150a0c)" />
      <path d="M10.5 15h3v3h2.5v3h-8v-3h2.5z" />
    </>
  ),
  // UEFA Cup: tall vase
  uefa: (
    <>
      <path d="M9 2h6l-.5 4 1.5 5-2 4h-4l-2-4 1.5-5z" />
      <path d="M11 15h2v3h3v3H8v-3h3z" />
    </>
  ),
  // Super Cup: plaque-shield
  super: (
    <>
      <path d="M12 2l7 3v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V5z" />
      <path d="M12 7l1.3 2.7 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4z" fill="var(--trophy-bg, #150a0c)" />
    </>
  ),
  // Club World Cup: globe on a stem
  cwc: (
    <>
      <circle cx="12" cy="8" r="5.5" />
      <path d="M6.5 8h11M12 2.5c2 2 2 9 0 11M12 2.5c-2 2-2 9 0 11" fill="none" stroke="var(--trophy-bg, #150a0c)" strokeWidth="0.9" />
      <path d="M10.5 13.5h3V18h2.5v3h-8v-3h2.5z" />
    </>
  ),
};

export function TrophyIcon({ k, className }: { k: TrophyKey; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      {paths[k]}
    </svg>
  );
}
