/**
 * Formation shapes for the tactics board.
 *
 * Coordinates are percentages of the whole pitch for the *bottom* team, which
 * attacks upwards: y=100 is its own goal line, y=0 the opposition's. The top
 * team uses the same shapes mirrored through the centre (x→100-x, y→100-y).
 */

export type Line = "GK" | "DEF" | "MID" | "FWD";
export type Slot = { role: string; line: Line; x: number; y: number };
export type Formation = { key: string; label: string; slots: Slot[] };

const gk: Slot = { role: "GK", line: "GK", x: 50, y: 93 };

const back4: Slot[] = [
  { role: "LB", line: "DEF", x: 13, y: 77 },
  { role: "CB", line: "DEF", x: 37, y: 80 },
  { role: "CB", line: "DEF", x: 63, y: 80 },
  { role: "RB", line: "DEF", x: 87, y: 77 },
];

const back3: Slot[] = [
  { role: "CB", line: "DEF", x: 29, y: 79 },
  { role: "CB", line: "DEF", x: 50, y: 82 },
  { role: "CB", line: "DEF", x: 71, y: 79 },
];

const back5: Slot[] = [
  { role: "LWB", line: "DEF", x: 9, y: 71 },
  { role: "CB", line: "DEF", x: 30, y: 80 },
  { role: "CB", line: "DEF", x: 50, y: 83 },
  { role: "CB", line: "DEF", x: 70, y: 80 },
  { role: "RWB", line: "DEF", x: 91, y: 71 },
];

const front3: Slot[] = [
  { role: "LW", line: "FWD", x: 16, y: 31 },
  { role: "ST", line: "FWD", x: 50, y: 24 },
  { role: "RW", line: "FWD", x: 84, y: 31 },
];

const front2: Slot[] = [
  { role: "ST", line: "FWD", x: 38, y: 26 },
  { role: "ST", line: "FWD", x: 62, y: 26 },
];

const lone: Slot[] = [{ role: "ST", line: "FWD", x: 50, y: 24 }];

const flat4: Slot[] = [
  { role: "LM", line: "MID", x: 13, y: 55 },
  { role: "CM", line: "MID", x: 38, y: 57 },
  { role: "CM", line: "MID", x: 62, y: 57 },
  { role: "RM", line: "MID", x: 87, y: 55 },
];

export const formations: Formation[] = [
  {
    key: "433",
    label: "4-3-3",
    slots: [
      gk,
      ...back4,
      { role: "CDM", line: "MID", x: 50, y: 64 },
      { role: "CM", line: "MID", x: 29, y: 55 },
      { role: "CM", line: "MID", x: 71, y: 55 },
      ...front3,
    ],
  },
  {
    key: "433dp",
    label: "4-3-3 double pivot",
    slots: [
      gk,
      ...back4,
      { role: "DM", line: "MID", x: 36, y: 64 },
      { role: "DM", line: "MID", x: 64, y: 64 },
      { role: "CM", line: "MID", x: 50, y: 48 },
      ...front3,
    ],
  },
  {
    key: "4231",
    label: "4-2-3-1",
    slots: [
      gk,
      ...back4,
      { role: "DM", line: "MID", x: 36, y: 64 },
      { role: "DM", line: "MID", x: 64, y: 64 },
      { role: "LW", line: "MID", x: 15, y: 40 },
      { role: "AM", line: "MID", x: 50, y: 43 },
      { role: "RW", line: "MID", x: 85, y: 40 },
      ...lone,
    ],
  },
  { key: "442", label: "4-4-2", slots: [gk, ...back4, ...flat4, ...front2] },
  {
    key: "4141",
    label: "4-1-4-1",
    slots: [
      gk,
      ...back4,
      { role: "DM", line: "MID", x: 50, y: 66 },
      { role: "LM", line: "MID", x: 13, y: 49 },
      { role: "CM", line: "MID", x: 38, y: 50 },
      { role: "CM", line: "MID", x: 62, y: 50 },
      { role: "RM", line: "MID", x: 87, y: 49 },
      ...lone,
    ],
  },
  {
    key: "352",
    label: "3-5-2",
    slots: [
      gk,
      ...back3,
      { role: "LWB", line: "MID", x: 9, y: 60 },
      { role: "CM", line: "MID", x: 33, y: 55 },
      { role: "CDM", line: "MID", x: 50, y: 63 },
      { role: "CM", line: "MID", x: 67, y: 55 },
      { role: "RWB", line: "MID", x: 91, y: 60 },
      ...front2,
    ],
  },
  {
    key: "343",
    label: "3-4-3",
    slots: [
      gk,
      ...back3,
      { role: "LM", line: "MID", x: 11, y: 58 },
      { role: "CM", line: "MID", x: 38, y: 59 },
      { role: "CM", line: "MID", x: 62, y: 59 },
      { role: "RM", line: "MID", x: 89, y: 58 },
      ...front3,
    ],
  },
  {
    key: "532",
    label: "5-3-2",
    slots: [
      gk,
      ...back5,
      { role: "CM", line: "MID", x: 30, y: 56 },
      { role: "CM", line: "MID", x: 50, y: 59 },
      { role: "CM", line: "MID", x: 70, y: 56 },
      ...front2,
    ],
  },
  { key: "541", label: "5-4-1", slots: [gk, ...back5, ...flat4, ...lone] },
];

export const defaultFormation = formations[0];

export const formationByKey = (key: string) => formations.find((f) => f.key === key) ?? defaultFormation;

/** Mirror a bottom-team position for the team attacking the other way. */
export const mirror = (x: number, y: number): [number, number] => [100 - x, 100 - y];
