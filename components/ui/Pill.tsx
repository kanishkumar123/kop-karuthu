import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "kop" | "flood" | "teal" | "paper" | "ink" | "glass" | "outline";

const tones: Record<Tone, string> = {
  kop: "bg-kop text-paper",
  flood: "bg-flood text-night",
  teal: "bg-teal text-night",
  paper: "bg-paper text-ink",
  ink: "bg-ink text-paper",
  glass: "bg-night/55 text-paper ring-1 ring-paper/20 backdrop-blur-md",
  outline: "ring-1 ring-current/30 text-current",
};

const dots: Partial<Record<Tone, string>> = {
  kop: "bg-paper",
  flood: "bg-kop",
  teal: "bg-night",
  paper: "bg-kop",
  ink: "bg-kop",
  glass: "bg-kop",
  outline: "bg-kop",
};

/** Small rounded label. Replaces the old rotated "stamp" labels everywhere. */
export function Pill({
  children,
  tone = "glass",
  dot = false,
  size = "sm",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  size?: "xs" | "sm";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold leading-none",
        size === "xs" ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        tones[tone],
        className,
      )}
    >
      {dot && <span aria-hidden className={cn("size-1.5 rounded-full", dots[tone])} />}
      {children}
    </span>
  );
}
