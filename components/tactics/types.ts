import type { Line } from "@/lib/formations";
import type { Position } from "@/lib/fpl";

export type Side = "a" | "b";
export type Pt = [number, number];

export type Tool = "move" | "pen" | "line" | "arrow" | "rect" | "ellipse" | "zone" | "spot" | "erase";

export type Shape =
  | { t: "pen"; pts: Pt[]; color: string; w: number }
  | { t: "line" | "arrow"; a: Pt; b: Pt; color: string; w: number }
  | { t: "rect" | "ellipse"; a: Pt; b: Pt; color: string; w: number; fill: boolean }
  | { t: "spot"; a: Pt; b: Pt };

export type Token = {
  id: string;
  side: Side;
  /** FPL element id, or null for a custom placeholder */
  playerId: number | null;
  name: string;
  /** Short name shown under the disc */
  last: string;
  number: number | null;
  photo: string | null;
  role: string;
  line: Line;
  x: number;
  y: number;
  /** Where this player started, for the movement trail */
  ox: number;
  oy: number;
};

export type Ball = { x: number; y: number };
export type Seg = { a: Pt; b: Pt };

export type Board = {
  tokens: Token[];
  ball: Ball;
  passes: Seg[];
  shapes: Shape[];
};

export type Step = { id: number; label: string; board: Board };

export const COLORS = ["#f4efe4", "#e11d2a", "#f6c445", "#35d6a0", "#4aa8ff"];

/** Kit colours you can override a whole team with */
export const KITS = ["#e11d2a", "#1f4fd8", "#f4efe4", "#0f1013", "#f6a01a", "#18a05a", "#8b2fc9", "#3fd0d6"];

/** Dark text reads better on a pale kit */
export const inkFor = (hex: string): "light" | "dark" => {
  const n = parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "dark" : "light";
};

export const TOOL_KEYS: Record<string, Tool> = {
  v: "move",
  p: "pen",
  l: "line",
  a: "arrow",
  r: "rect",
  o: "ellipse",
  z: "zone",
  s: "spot",
  e: "erase",
};

export const posLine = (p: Position): Line => p;

/** Deep-ish clone for board snapshots (plain data only). */
export const cloneBoard = (b: Board): Board => JSON.parse(JSON.stringify(b)) as Board;
