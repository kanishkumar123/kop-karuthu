/**
 * The pitch itself: a vertical SVG drawn in pitch units (68 × 105 metres) so
 * it stays crisp at any size. Purely decorative — everything interactive sits
 * in layers above it.
 */
export function Pitch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 105" className={className} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="pitch-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="80" height="105" fill="#153a22" />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x="0" y={i * 10.5} width="80" height="5.25" fill="#1a4a2a" />
      ))}
      <rect x="0" y="0" width="80" height="105" fill="url(#pitch-sheen)" />

      <g fill="none" stroke="#eae0cc" strokeOpacity="0.6" strokeWidth="0.3">
        <rect x="2" y="2" width="76" height="101" />
        <line x1="2" y1="52.5" x2="78" y2="52.5" />
        <circle cx="40" cy="52.5" r="9.15" />
        <circle cx="40" cy="52.5" r="0.4" fill="#eae0cc" stroke="none" />

        {/* Penalty and six-yard boxes, both ends */}
        <rect x="19.85" y="2" width="40.3" height="16.5" />
        <rect x="30.85" y="2" width="18.3" height="5.5" />
        <circle cx="40" cy="13" r="0.4" fill="#eae0cc" stroke="none" />
        <path d="M 32.7 18.5 A 9.15 9.15 0 0 0 47.3 18.5" />

        <rect x="19.85" y="86.5" width="40.3" height="16.5" />
        <rect x="30.85" y="97.5" width="18.3" height="5.5" />
        <circle cx="40" cy="92" r="0.4" fill="#eae0cc" stroke="none" />
        <path d="M 32.7 86.5 A 9.15 9.15 0 0 1 47.3 86.5" />

        {/* Corner arcs */}
        <path d="M 2 3 A 1 1 0 0 0 3 2" />
        <path d="M 77 2 A 1 1 0 0 0 78 3" />
        <path d="M 2 102 A 1 1 0 0 1 3 103" />
        <path d="M 78 102 A 1 1 0 0 0 77 103" />
      </g>
    </svg>
  );
}
