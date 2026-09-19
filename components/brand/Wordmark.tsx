import { cn } from "@/lib/utils";

/** Typographic wordmark: solid KOP, outlined KARUTHU. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-[0.18em] font-black uppercase leading-none tracking-[-0.04em]", className)}>
      <span className="text-kop">Kop</span>
      <span className="outline-text">Karuthu</span>
    </span>
  );
}
