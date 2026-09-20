"use client";

import { useState } from "react";
import { COLORS, type Tool } from "@/components/tactics/types";
import { cn } from "@/lib/utils";

/**
 * Drawing tools, the two opt-in toggles (movement trails and the ball's pass
 * line) and the board actions. Saved boards live in this browser only.
 */

const STORE = "kk-tactics-boards";

type Saved = Record<string, unknown>;

const TOOLS: { key: Tool; label: string; hint: string }[] = [
  { key: "move", label: "Move", hint: "V" },
  { key: "pen", label: "Pen", hint: "P" },
  { key: "line", label: "Line", hint: "L" },
  { key: "arrow", label: "Arrow", hint: "A" },
  { key: "rect", label: "Box", hint: "R" },
  { key: "ellipse", label: "Oval", hint: "O" },
  { key: "zone", label: "Zone", hint: "Z" },
  { key: "spot", label: "Spot", hint: "S" },
  { key: "erase", label: "Erase", hint: "E" },
];

function readBoards(): Record<string, Saved> {
  try {
    return JSON.parse(localStorage.getItem(STORE) ?? "{}") as Record<string, Saved>;
  } catch {
    return {};
  }
}

export function Toolbar({
  tool,
  color,
  width,
  trails,
  passLine,
  photos,
  canUndo,
  canRedo,
  onTool,
  onColor,
  onWidth,
  onTrails,
  onPassLine,
  onPhotos,
  onUndo,
  onRedo,
  onClear,
  onClearTrails,
  onFlip,
  onReset,
  onPresent,
  onExport,
  onHelp,
  snapshot,
  onLoad,
  compact = false,
  className = "",
}: {
  tool: Tool;
  color: string;
  width: number;
  trails: boolean;
  passLine: boolean;
  photos: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onTool: (t: Tool) => void;
  onColor: (c: string) => void;
  onWidth: (w: number) => void;
  onTrails: () => void;
  onPassLine: () => void;
  onPhotos: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onClearTrails: () => void;
  onFlip: () => void;
  onReset: () => void;
  onPresent: () => void;
  onExport: () => void;
  onHelp: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshot: () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLoad: (saved: any) => void;
  compact?: boolean;
  className?: string;
}) {
  // Read only when the menu is opened, so nothing depends on storage at render
  const [boards, setBoards] = useState<Record<string, Saved> | null>(null);

  const save = () => {
    const name = window.prompt("Name this board", `Board ${new Date().toLocaleDateString("en-GB")}`);
    if (!name) return;
    const all = readBoards();
    all[name] = snapshot();
    try {
      localStorage.setItem(STORE, JSON.stringify(all));
      setBoards(all);
    } catch {
      window.alert("Couldn't save — this browser's storage is full or blocked.");
    }
  };

  const remove = (name: string) => {
    const all = readBoards();
    delete all[name];
    localStorage.setItem(STORE, JSON.stringify(all));
    setBoards(all);
  };

  const btn = "rounded-lg px-2 py-2 text-xs font-semibold ring-1 transition-colors";
  const quiet = "bg-night text-paper/75 ring-paper/15 hover:text-paper";

  return (
    <div className={cn("flex flex-col gap-5 rounded-[16px] bg-night-2/90 p-4 ring-1 ring-paper/12 backdrop-blur", className)}>
      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-paper/50">Tools</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {TOOLS.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-pressed={tool === t.key}
              title={`${t.label} (${t.hint})`}
              onClick={() => onTool(t.key)}
              className={cn(btn, tool === t.key ? "bg-kop text-paper ring-kop" : quiet)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Colour ${c}`}
            aria-pressed={color === c}
            onClick={() => onColor(c)}
            className={cn("size-6 rounded-full ring-2 transition-transform", color === c ? "scale-110 ring-paper" : "ring-paper/25")}
            style={{ background: c }}
          />
        ))}
        <label className="ml-auto flex items-center gap-1 text-[11px] text-paper/55">
          <span className="sr-only sm:not-sr-only">Size</span>
          <input
            type="range"
            min={2}
            max={12}
            value={width}
            onChange={(e) => onWidth(Number(e.target.value))}
            className="w-20 accent-[var(--color-kop)]"
            aria-label="Line thickness"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button type="button" disabled={!canUndo} onClick={onUndo} className={cn(btn, quiet, "disabled:opacity-40")}>
          Undo
        </button>
        <button type="button" disabled={!canRedo} onClick={onRedo} className={cn(btn, quiet, "disabled:opacity-40")}>
          Redo
        </button>
        <button type="button" onClick={onClear} className={cn(btn, quiet)}>
          Clear
        </button>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-paper/50">Show</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Toggle on={trails} onClick={onTrails} label="Trails" hint="T" />
          <Toggle on={passLine} onClick={onPassLine} label="Pass line" hint="Y" />
          <Toggle on={photos} onClick={onPhotos} label="Photos" hint="" />
          <button type="button" onClick={onClearTrails} className={cn(btn, quiet)}>
            Clear trails
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={onFlip} className={cn(btn, quiet)}>
          Flip sides
        </button>
        <button type="button" onClick={onReset} className={cn(btn, quiet)}>
          Reset
        </button>
        <button type="button" onClick={onPresent} className={cn(btn, quiet)}>
          Present
        </button>
        <button type="button" onClick={onExport} className={cn(btn, quiet)}>
          Export PNG
        </button>
        <button type="button" onClick={save} className={cn(btn, quiet)}>
          Save board
        </button>
        <button type="button" onClick={() => setBoards((b) => (b ? null : readBoards()))} className={cn(btn, quiet)}>
          {boards ? "Hide saved" : "Load board"}
        </button>
      </div>

      {boards && (
        <ul className="max-h-40 space-y-1.5 overflow-y-auto">
          {Object.keys(boards).length === 0 && <li className="text-xs text-paper/50">Nothing saved yet.</li>}
          {Object.keys(boards).map((name) => (
            <li key={name} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  onLoad(boards[name]);
                  setBoards(null);
                }}
                className="min-w-0 flex-1 truncate rounded-lg bg-night px-2 py-1.5 text-left text-xs ring-1 ring-paper/10 hover:ring-kop"
              >
                {name}
              </button>
              <button type="button" aria-label={`Delete ${name}`} onClick={() => remove(name)} className="rounded-lg bg-night px-2 py-1.5 text-xs text-paper/50 ring-1 ring-paper/10 hover:text-kop">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {!compact && (
        <div className="text-[11px] leading-snug text-paper/45">
          <p>Drag a disc to slide it; tap one to swap or rename.</p>
          <button type="button" onClick={onHelp} className="mt-1 underline-offset-2 hover:underline">
            Keyboard shortcuts (?)
          </button>
        </div>
      )}
    </div>
  );
}

function Toggle({ on, onClick, label, hint }: { on: boolean; onClick: () => void; label: string; hint: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      title={hint ? `${label} (${hint})` : label}
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold ring-1 transition-colors",
        on ? "bg-kop text-paper ring-kop" : "bg-night text-paper/75 ring-paper/15 hover:text-paper",
      )}
    >
      <span className="truncate">{label}</span>
      <span aria-hidden className={cn("size-2 rounded-full", on ? "bg-paper" : "bg-paper/25")} />
    </button>
  );
}
