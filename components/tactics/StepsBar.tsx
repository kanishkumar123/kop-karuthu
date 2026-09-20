"use client";

import type { Step } from "@/components/tactics/types";
import { cn } from "@/lib/utils";

/**
 * Steps are board snapshots you click through like slides while you talk —
 * the piece that makes this useful on a watchalong. Visible in present mode
 * too, since that's when you're actually stepping through them.
 */
export function StepsBar({
  steps,
  active,
  present,
  onAdd,
  onApply,
  onRemove,
  onStep,
  onExitPresent,
}: {
  steps: Step[];
  active: number | null;
  present: boolean;
  onAdd: () => void;
  onApply: (id: number) => void;
  onRemove: (id: number) => void;
  onStep: (dir: 1 | -1) => void;
  onExitPresent: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center p-2 md:p-3">
      <div className="pointer-events-auto flex max-w-full items-center gap-1.5 rounded-full bg-night-2/90 px-2 py-1.5 ring-1 ring-paper/12 backdrop-blur">
        <button
          type="button"
          onClick={() => onStep(-1)}
          disabled={!steps.length}
          aria-label="Previous step"
          className="rounded-full px-2.5 py-1.5 text-sm text-paper/75 hover:text-paper disabled:opacity-40"
        >
          ‹
        </button>

        <ul className="flex max-w-[52vw] items-center gap-1 overflow-x-auto no-scrollbar">
          {steps.length === 0 && <li className="whitespace-nowrap px-2 text-xs text-paper/45">No steps yet</li>}
          {steps.map((s, i) => (
            <li key={s.id} className="group relative">
              <button
                type="button"
                onClick={() => onApply(s.id)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-colors",
                  active === s.id ? "bg-kop text-paper ring-kop" : "bg-night text-paper/75 ring-paper/12 hover:text-paper",
                )}
              >
                {i + 1}
              </button>
              {!present && (
                <button
                  type="button"
                  aria-label={`Delete step ${i + 1}`}
                  onClick={() => onRemove(s.id)}
                  className="absolute -right-1 -top-1 hidden size-4 items-center justify-center rounded-full bg-night text-[10px] text-paper/70 ring-1 ring-paper/20 group-hover:flex"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onStep(1)}
          disabled={!steps.length}
          aria-label="Next step"
          className="rounded-full px-2.5 py-1.5 text-sm text-paper/75 hover:text-paper disabled:opacity-40"
        >
          ›
        </button>

        <span aria-hidden className="mx-0.5 h-5 w-px bg-paper/15" />

        <button type="button" onClick={onAdd} className="whitespace-nowrap rounded-full bg-kop px-3 py-1.5 text-xs font-semibold">
          + Step
        </button>

        {present && (
          <button type="button" onClick={onExitPresent} className="whitespace-nowrap rounded-full bg-night px-3 py-1.5 text-xs font-semibold ring-1 ring-paper/15">
            Exit
          </button>
        )}
      </div>
    </div>
  );
}
