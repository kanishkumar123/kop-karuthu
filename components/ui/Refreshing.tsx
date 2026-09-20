/**
 * Shown when a live-data section is temporarily unavailable. Upstream APIs blip
 * from time to time; the page revalidates quickly, so the section says it's
 * coming back rather than silently vanishing.
 */
export function Refreshing({ what, className = "" }: { what: string; className?: string }) {
  return (
    <p role="status" className={`inline-flex items-center gap-2 rounded-full bg-night-2 px-4 py-2 text-sm text-paper/70 ring-1 ring-paper/10 ${className}`}>
      <span aria-hidden className="size-2 animate-pulse rounded-full bg-kop" />
      Refreshing {what}&hellip;
    </p>
  );
}
