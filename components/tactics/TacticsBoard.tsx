"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PlTeam, TacticsPlayer } from "@/lib/plteams";
import { formationByKey, mirror, type Line } from "@/lib/formations";
import { COLORS, TOOL_KEYS, cloneBoard, inkFor, type Board, type Seg, type Shape, type Side, type Step, type Token, type Tool } from "@/components/tactics/types";
import { Pitch } from "@/components/tactics/Pitch";
import { DrawLayer } from "@/components/tactics/DrawLayer";
import { PlayerToken } from "@/components/tactics/PlayerToken";
import { TeamPanel } from "@/components/tactics/TeamPanel";
import { Toolbar } from "@/components/tactics/Toolbar";
import { StepsBar } from "@/components/tactics/StepsBar";
import { exportPng } from "@/components/tactics/canvas";
import { useSlideDrag } from "@/components/tactics/useSlideDrag";

/* ───────────── teams ───────────── */

export type TeamChoice = {
  key: string;
  name: string;
  short: string;
  color: string;
  ink: "light" | "dark";
  players: TacticsPlayer[];
  custom: boolean;
};

const CUSTOM_LINES: Line[] = ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"];

function customTeam(side: Side): TeamChoice {
  return {
    key: `custom-${side}`,
    name: "Custom XI",
    short: side === "a" ? "XI" : "XI",
    color: side === "a" ? "#e11d2a" : "#2b6cb0",
    ink: "light",
    custom: true,
    players: CUSTOM_LINES.map((line, i) => ({
      id: -(i + 1) * (side === "a" ? 1 : 100),
      name: `Player ${i + 1}`,
      last: `Player ${i + 1}`,
      number: i + 1,
      position: line,
      photo: "",
    })),
  };
}

const fromPl = (t: PlTeam): TeamChoice => ({ ...t, key: String(t.id), custom: false });

/* ───────────── board building ───────────── */

function buildSide(side: Side, team: TeamChoice, formationKey: string): Token[] {
  const f = formationByKey(formationKey);
  // Fill each slot from the squad, preferring a player who actually plays there
  const spare = [...team.players];
  const take = (line: Line) => {
    if (!spare.length) return null;
    const i = spare.findIndex((p) => p.position === line);
    return spare.splice(i >= 0 ? i : 0, 1)[0];
  };

  return f.slots.map((s, i) => {
    const p = take(s.line);
    const [x, y] = side === "a" ? [s.x, s.y] : mirror(s.x, s.y);
    return {
      id: `${side}-${i}`,
      side,
      playerId: p?.id ?? null,
      name: p?.name ?? s.role,
      last: p?.last ?? s.role,
      number: p?.number ?? null,
      photo: p?.photo || null,
      role: s.role,
      line: s.line,
      x,
      y,
      ox: x,
      oy: y,
    };
  });
}

const CENTRE = { x: 50, y: 52.5 };

/* ───────────── component ───────────── */

export function TacticsBoard({ teams }: { teams: PlTeam[] }) {
  const choices = useMemo(() => {
    const list = teams.map(fromPl);
    return { list, a: [...list, customTeam("a")], b: [...list, customTeam("b")] };
  }, [teams]);

  const pick = (list: TeamChoice[], name: string, fallback: number) => list.find((t) => t.name === name) ?? list[fallback] ?? customTeam("a");

  const [teamA, setTeamA] = useState<TeamChoice>(() => pick(choices.a, "Liverpool", 0));
  const [teamB, setTeamB] = useState<TeamChoice>(() => pick(choices.b, "Man City", 1));
  const [formA, setFormA] = useState("433");
  const [formB, setFormB] = useState("4231");

  const [tokens, setTokens] = useState<Token[]>(() => [
    ...buildSide("a", pick(choices.a, "Liverpool", 0), "433"),
    ...buildSide("b", pick(choices.b, "Man City", 1), "4231"),
  ]);
  const [ball, setBall] = useState(CENTRE);
  const [passes, setPasses] = useState<Seg[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [future, setFuture] = useState<Shape[][]>([]);

  const [tool, setTool] = useState<Tool>("move");
  const [color, setColor] = useState(COLORS[0]);
  const [width, setWidth] = useState(4);

  const [trails, setTrails] = useState(false);
  const [passLine, setPassLine] = useState(false);
  const [photos, setPhotos] = useState(false);
  const [dimSide, setDimSide] = useState<Side | null>(null);
  const [present, setPresent] = useState(false);
  const [help, setHelp] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  // Formation changes and steps glide; a drag has already animated itself
  const [animate, setAnimate] = useState(true);
  // Optional kit-colour override per side (two clubs can otherwise look alike)
  const [shirtA, setShirtA] = useState<string | null>(null);
  const [shirtB, setShirtB] = useState<string | null>(null);

  const [steps, setSteps] = useState<Step[]>([]);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const pitch = useRef<HTMLDivElement>(null);
  const nextStepId = useRef(1);

  const board: Board = useMemo(() => ({ tokens, ball, passes, shapes }), [tokens, ball, passes, shapes]);
  const teamFor = useCallback((side: Side) => (side === "a" ? teamA : teamB), [teamA, teamB]);
  const colorFor = useCallback((t: Token) => {
    const team = t.side === "a" ? teamA : teamB;
    const shirt = t.side === "a" ? shirtA : shirtB;
    return shirt ? { color: shirt, ink: inkFor(shirt) } : { color: team.color, ink: team.ink };
  }, [teamA, teamB, shirtA, shirtB]);

  const say = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 1800);
  }, []);

  /* ── players ── */

  const moveToken = useCallback((id: string, x: number, y: number) => {
    setAnimate(false);
    setTokens((ts) => ts.map((t) => (t.id === id ? { ...t, x, y } : t)));
  }, []);

  const setTeam = useCallback((side: Side, team: TeamChoice) => {
    setAnimate(true);
    // a new club brings its own colours
    if (side === "a") setShirtA(null);
    else setShirtB(null);
    if (side === "a") setTeamA(team);
    else setTeamB(team);
    const formation = side === "a" ? formA : formB;
    setTokens((ts) => [...ts.filter((t) => t.side !== side), ...buildSide(side, team, formation)]);
    setPicked(null);
  }, [formA, formB]);

  const setFormation = useCallback((side: Side, key: string) => {
    setAnimate(true);
    if (side === "a") setFormA(key);
    else setFormB(key);
    setTokens((ts) => [...ts.filter((t) => t.side !== side), ...buildSide(side, side === "a" ? teamA : teamB, key)]);
    setPicked(null);
  }, [teamA, teamB]);

  const swapPlayer = useCallback((id: string, p: TacticsPlayer) => {
    setTokens((ts) => ts.map((t) => (t.id === id ? { ...t, playerId: p.id, name: p.name, last: p.last, number: p.number, photo: p.photo || null } : t)));
    setPicked(null);
  }, []);

  const renameToken = useCallback((id: string, name: string, number: number | null) => {
    setTokens((ts) => ts.map((t) => (t.id === id ? { ...t, name, last: name, number } : t)));
  }, []);

  const resetBoard = useCallback(() => {
    setAnimate(true);
    setTokens([...buildSide("a", teamA, formA), ...buildSide("b", teamB, formB)]);
    setBall(CENTRE);
    setPasses([]);
    setActiveStep(null);
    say("Board reset");
  }, [teamA, teamB, formA, formB, say]);

  const clearTrails = useCallback(() => {
    setTokens((ts) => ts.map((t) => ({ ...t, ox: t.x, oy: t.y })));
    setPasses([]);
  }, []);

  const flipSides = useCallback(() => {
    setAnimate(true);
    setTokens((ts) => ts.map((t) => ({ ...t, x: 100 - t.x, y: 100 - t.y, ox: 100 - t.ox, oy: 100 - t.oy })));
    setBall((b) => ({ x: 100 - b.x, y: 100 - b.y }));
    setPasses((ps) => ps.map((p) => ({ a: [100 - p.a[0], 100 - p.a[1]], b: [100 - p.b[0], 100 - p.b[1]] })));
  }, []);

  /* ── ball ── */

  const ballEl = useRef<HTMLButtonElement>(null);
  const { dragging: ballDragging, handlers: ballHandlers } = useSlideDrag({
    elRef: ballEl,
    pitchRef: pitch,
    x: ball.x,
    y: ball.y,
    enabled: tool === "move",
    onCommit: (x, y) => {
      // The pass line is opt-in: with it off the ball just moves and leaves nothing
      if (passLine) setPasses((ps) => [...ps, { a: [ball.x, ball.y], b: [x, y] }]);
      setAnimate(false);
      setBall({ x, y });
    },
  });

  /* ── drawings ── */

  const addShape = useCallback((s: Shape) => {
    setShapes((cur) => [...cur, s]);
    setFuture([]);
  }, []);
  const eraseShape = useCallback((i: number) => {
    setShapes((cur) => cur.filter((_, k) => k !== i));
    setFuture([]);
  }, []);
  const undo = useCallback(() => {
    setShapes((cur) => {
      if (!cur.length) return cur;
      setFuture((f) => [cur, ...f]);
      return cur.slice(0, -1);
    });
  }, []);
  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      setShapes(f[0]);
      return f.slice(1);
    });
  }, []);
  const clearDrawings = useCallback(() => {
    setShapes((cur) => {
      if (cur.length) setFuture((f) => [cur, ...f]);
      return [];
    });
  }, []);

  /* ── steps ── */

  const addStep = useCallback(() => {
    const id = nextStepId.current++;
    setSteps((s) => [...s, { id, label: `Step ${s.length + 1}`, board: cloneBoard(board) }]);
    setActiveStep(id);
    say("Step saved");
  }, [board, say]);

  const applyStep = useCallback((id: number) => {
    const step = steps.find((s) => s.id === id);
    if (!step) return;
    const b = cloneBoard(step.board);
    setAnimate(true);
    setTokens(b.tokens);
    setBall(b.ball);
    setPasses(b.passes);
    setShapes(b.shapes);
    setActiveStep(id);
  }, [steps]);

  const removeStep = useCallback((id: number) => {
    setSteps((s) => s.filter((x) => x.id !== id));
    setActiveStep((cur) => (cur === id ? null : cur));
  }, []);

  const stepBy = useCallback((dir: 1 | -1) => {
    setSteps((s) => {
      if (!s.length) return s;
      const i = s.findIndex((x) => x.id === activeStep);
      const next = s[Math.min(s.length - 1, Math.max(0, (i < 0 ? -1 : i) + dir))];
      if (next) applyStep(next.id);
      return s;
    });
  }, [activeStep, applyStep]);

  /* ── save / load / export ── */

  const snapshot = useCallback(
    () => ({
      teamA: teamA.key,
      teamB: teamB.key,
      formA,
      formB,
      shirtA,
      shirtB,
      board,
      steps,
      trails,
      passLine,
      photos,
    }),
    [teamA, teamB, formA, formB, shirtA, shirtB, board, steps, trails, passLine, photos],
  );

  const load = useCallback((saved: ReturnType<typeof snapshot>) => {
    const a = choices.a.find((t) => t.key === saved.teamA);
    const b = choices.b.find((t) => t.key === saved.teamB);
    if (a) setTeamA(a);
    if (b) setTeamB(b);
    setFormA(saved.formA);
    setFormB(saved.formB);
    setShirtA(saved.shirtA ?? null);
    setShirtB(saved.shirtB ?? null);
    setTokens(saved.board.tokens);
    setBall(saved.board.ball);
    setPasses(saved.board.passes ?? []);
    setShapes(saved.board.shapes ?? []);
    setSteps(saved.steps ?? []);
    nextStepId.current = Math.max(1, ...(saved.steps ?? []).map((s) => s.id + 1));
    setTrails(!!saved.trails);
    setPassLine(!!saved.passLine);
    setPhotos(!!saved.photos);
    setActiveStep(null);
    say("Board loaded");
  }, [choices, say]);

  const savePng = useCallback(async () => {
    const url = await exportPng({
      board,
      colorFor,
      trails,
      passLine,
      photos,
      title: `${teamA.name} vs ${teamB.name}`,
    });
    const a = document.createElement("a");
    a.href = url;
    a.download = `kop-karuthu-tactics-${Date.now()}.png`;
    a.click();
    say("PNG saved");
  }, [board, colorFor, trails, passLine, photos, teamA, teamB, say]);

  /* ── page chrome: no scrolling, hidden nav in present mode ── */

  useEffect(() => {
    document.documentElement.dataset.board = "true";
    return () => {
      delete document.documentElement.dataset.board;
      delete document.documentElement.dataset.present;
    };
  }, []);

  useEffect(() => {
    if (present) document.documentElement.dataset.present = "true";
    else delete document.documentElement.dataset.present;
  }, [present]);

  /* ── keyboard ── */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (TOOL_KEYS[k]) {
        setTool(TOOL_KEYS[k]);
        return;
      }
      if (k === "f") setPresent((p) => !p);
      else if (k === "?" || (k === "/" && e.shiftKey)) setHelp((h) => !h);
      else if (k === "escape") {
        setPresent(false);
        setHelp(false);
        setPicked(null);
      } else if (k === "t") setTrails((v) => !v);
      else if (k === "y") setPassLine((v) => !v);
      else if (k === "c") clearDrawings();
      else if (k === "n") addStep();
      else if (e.key === "ArrowRight") stepBy(1);
      else if (e.key === "ArrowLeft") stepBy(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, clearDrawings, addStep, stepBy]);

  /* ── render ── */

  const pickedToken = picked ? tokens.find((t) => t.id === picked) ?? null : null;

  return (
    <div className="tactics relative flex h-[100svh] w-full flex-col overflow-hidden bg-night text-paper">
      <div className="flex min-h-0 flex-1 items-stretch justify-center gap-3 p-2 pt-16 md:gap-4 md:p-4 md:pt-20">
        {!present && (
          <div className="no-scrollbar hidden w-[208px] shrink-0 flex-col justify-center gap-6 overflow-y-auto lg:flex">
            <TeamPanel
              side="b"
              team={teamB}
              teams={choices.b}
              formation={formB}
              dimmed={dimSide}
              shirt={shirtB}
              onShirt={setShirtB}
              onTeam={(t) => setTeam("b", t)}
              onFormation={(k) => setFormation("b", k)}
              onDim={setDimSide}
            />
            <TeamPanel
              side="a"
              team={teamA}
              teams={choices.a}
              formation={formA}
              dimmed={dimSide}
              shirt={shirtA}
              onShirt={setShirtA}
              onTeam={(t) => setTeam("a", t)}
              onFormation={(k) => setFormation("a", k)}
              onDim={setDimSide}
            />
          </div>
        )}

        {/* Pitch — sized from whichever of the two axes runs out first */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center" style={{ containerType: "size" }}>
          <div
            ref={pitch}
            className="relative overflow-hidden rounded-[14px] shadow-[0_24px_60px_-20px_rgb(0_0_0/0.8)] ring-1 ring-paper/15"
            style={{
              aspectRatio: "80 / 105",
              height: "min(100cqh, calc(100cqw * 105 / 80))",
              containerType: "inline-size",
              ["--disc" as string]: "clamp(18px, 8.4cqw, 48px)",
            }}
          >
            <Pitch className="absolute inset-0 size-full" />

            {/* Movement trails and the ball's pass line, both opt-in */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
              <defs>
                <marker id="trail-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(244,239,228,0.9)" />
                </marker>
              </defs>
              {trails &&
                tokens
                  .filter((t) => Math.hypot(t.x - t.ox, t.y - t.oy) > 1.2)
                  .map((t) => (
                    <line
                      key={t.id}
                      x1={t.ox}
                      y1={t.oy}
                      x2={t.x}
                      y2={t.y}
                      stroke="rgba(244,239,228,0.9)"
                      strokeWidth="0.45"
                      strokeDasharray="1.6 1.2"
                      strokeLinecap="round"
                      markerEnd="url(#trail-head)"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
              {passLine &&
                passes.map((p, i) => (
                  <line
                    key={i}
                    x1={p.a[0]}
                    y1={p.a[1]}
                    x2={p.b[0]}
                    y2={p.b[1]}
                    stroke="#f6c445"
                    strokeWidth="0.45"
                    strokeDasharray="1.8 1.4"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
            </svg>

            <DrawLayer shapes={shapes} tool={tool} color={color} width={width} onAdd={addShape} onErase={eraseShape} />

            {tokens.map((t) => (
              <PlayerToken
                key={t.id}
                token={t}
                color={colorFor(t).color}
                ink={colorFor(t).ink}
                photos={photos}
                dim={dimSide != null && dimSide !== t.side}
                locked={tool !== "move"}
                animate={animate}
                pitch={pitch}
                onCommit={moveToken}
                onPick={setPicked}
              />
            ))}

            <button
              ref={ballEl}
              type="button"
              {...ballHandlers}
              aria-label="Ball. Drag to move."
              className="absolute -translate-x-1/2 -translate-y-1/2 touch-none rounded-full bg-paper shadow-[0_4px_10px_rgb(0_0_0/0.6)] ring-2 ring-night/60"
              style={{
                left: `${ball.x}%`,
                top: `${ball.y}%`,
                width: "calc(var(--disc) * 0.46)",
                height: "calc(var(--disc) * 0.46)",
                zIndex: 25,
                pointerEvents: tool === "move" ? "auto" : "none",
                cursor: ballDragging ? "grabbing" : "grab",
              }}
            />
          </div>
        </div>

        {!present && (
          <Toolbar
            tool={tool}
            color={color}
            width={width}
            trails={trails}
            passLine={passLine}
            photos={photos}
            canUndo={shapes.length > 0}
            canRedo={future.length > 0}
            onTool={setTool}
            onColor={setColor}
            onWidth={setWidth}
            onTrails={() => setTrails((v) => !v)}
            onPassLine={() => setPassLine((v) => !v)}
            onPhotos={() => setPhotos((v) => !v)}
            onUndo={undo}
            onRedo={redo}
            onClear={clearDrawings}
            onClearTrails={clearTrails}
            onFlip={flipSides}
            onReset={resetBoard}
            onPresent={() => setPresent(true)}
            onExport={savePng}
            onHelp={() => setHelp(true)}
            snapshot={snapshot}
            onLoad={load}
            className="no-scrollbar hidden w-[248px] shrink-0 overflow-y-auto lg:block"
          />
        )}
      </div>

      {/* On a phone the controls live in a sheet so the pitch keeps the screen */}
      {!present && (
        <>
          <button
            type="button"
            onClick={() => setSheet((v) => !v)}
            aria-expanded={sheet}
            className="absolute right-3 top-16 z-40 rounded-full bg-night-2/90 px-4 py-2 text-xs font-semibold ring-1 ring-paper/15 backdrop-blur lg:hidden"
          >
            {sheet ? "Hide controls" : "Controls"}
          </button>

          {sheet && (
            <div className="absolute inset-x-0 bottom-0 z-40 max-h-[58svh] overflow-y-auto bg-night/95 p-3 pb-16 backdrop-blur lg:hidden">
              <div className="grid gap-2 sm:grid-cols-2">
                <TeamPanel
                  side="b"
                  team={teamB}
                  teams={choices.b}
                  formation={formB}
                  dimmed={dimSide}
                  shirt={shirtB}
                  onShirt={setShirtB}
                  onTeam={(t) => setTeam("b", t)}
                  onFormation={(k) => setFormation("b", k)}
                  onDim={setDimSide}
                  compact
                />
                <TeamPanel
                  side="a"
                  team={teamA}
                  teams={choices.a}
                  formation={formA}
                  dimmed={dimSide}
                  shirt={shirtA}
                  onShirt={setShirtA}
                  onTeam={(t) => setTeam("a", t)}
                  onFormation={(k) => setFormation("a", k)}
                  onDim={setDimSide}
                  compact
                />
              </div>
              <Toolbar
                tool={tool}
                color={color}
                width={width}
                trails={trails}
                passLine={passLine}
                photos={photos}
                canUndo={shapes.length > 0}
                canRedo={future.length > 0}
                onTool={setTool}
                onColor={setColor}
                onWidth={setWidth}
                onTrails={() => setTrails((v) => !v)}
                onPassLine={() => setPassLine((v) => !v)}
                onPhotos={() => setPhotos((v) => !v)}
                onUndo={undo}
                onRedo={redo}
                onClear={clearDrawings}
                onClearTrails={clearTrails}
                onFlip={flipSides}
                onReset={resetBoard}
                onPresent={() => {
                  setSheet(false);
                  setPresent(true);
                }}
                onExport={savePng}
                onHelp={() => setHelp(true)}
                snapshot={snapshot}
                onLoad={load}
                compact
                className="mt-2"
              />
            </div>
          )}
        </>
      )}

      <StepsBar
        steps={steps}
        active={activeStep}
        present={present}
        onAdd={addStep}
        onApply={applyStep}
        onRemove={removeStep}
        onStep={stepBy}
        onExitPresent={() => setPresent(false)}
      />

      {/* Swap / rename sheet */}
      {pickedToken && (
        <SwapSheet
          token={pickedToken}
          team={teamFor(pickedToken.side)}
          onClose={() => setPicked(null)}
          onSwap={(p) => swapPlayer(pickedToken.id, p)}
          onRename={(name, number) => renameToken(pickedToken.id, name, number)}
        />
      )}

      {help && <HelpOverlay onClose={() => setHelp(false)} />}

      {toast && (
        <div role="status" className="pointer-events-none fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-night-2 px-5 py-2 text-sm ring-1 ring-paper/15">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ───────────── swap / rename ───────────── */

function SwapSheet({
  token,
  team,
  onClose,
  onSwap,
  onRename,
}: {
  token: Token;
  team: TeamChoice;
  onClose: () => void;
  onSwap: (p: TacticsPlayer) => void;
  onRename: (name: string, number: number | null) => void;
}) {
  const [name, setName] = useState(token.last);
  const [number, setNumber] = useState(token.number != null ? String(token.number) : "");

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-night/70 p-3 backdrop-blur-sm md:items-center" role="dialog" aria-modal="true" aria-label={`Change ${token.last}`}>
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={onClose} />
      <div className="relative flex max-h-[70svh] w-full max-w-lg flex-col rounded-[18px] bg-night-2 p-4 ring-1 ring-paper/15">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-paper/50">{token.role} · {team.name}</p>
            <p className="text-xl font-semibold">{token.name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-night px-4 py-2 text-sm ring-1 ring-paper/15">
            Close
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="flex-1 text-xs text-paper/60">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg bg-night px-3 py-2 text-base text-paper ring-1 ring-paper/15 outline-none focus:ring-kop"
            />
          </label>
          <label className="w-24 text-xs text-paper/60">
            Number
            <input
              value={number}
              inputMode="numeric"
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 2))}
              className="mt-1 w-full rounded-lg bg-night px-3 py-2 text-base text-paper ring-1 ring-paper/15 outline-none focus:ring-kop"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              onRename(name.trim() || token.last, number === "" ? null : Number(number));
              onClose();
            }}
            className="rounded-lg bg-kop px-4 py-2 text-sm font-semibold"
          >
            Rename
          </button>
        </div>

        {!team.custom && (
          <>
            <p className="mt-5 text-xs uppercase tracking-wide text-paper/50">Swap with {team.name} squad</p>
            <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
              <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {team.players.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => onSwap(p)}
                      className="flex w-full items-center gap-2 rounded-lg bg-night px-2.5 py-2 text-left text-sm ring-1 ring-paper/10 hover:ring-kop"
                    >
                      <span className="w-6 shrink-0 text-xs text-paper/50">{p.number ?? "–"}</span>
                      <span className="truncate">{p.last}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ───────────── shortcuts ───────────── */

const SHORTCUTS: [string, string][] = [
  ["V", "Move players and the ball"],
  ["P / L / A", "Pen, line, arrow"],
  ["R / O", "Rectangle, ellipse"],
  ["Z / S", "Zone, spotlight"],
  ["E", "Eraser"],
  ["T / Y", "Toggle movement trails / pass line"],
  ["C", "Clear drawings"],
  ["N", "Save the board as a step"],
  ["← / →", "Step backwards / forwards"],
  ["Ctrl+Z / Shift+Ctrl+Z", "Undo / redo"],
  ["F", "Present mode"],
  ["Esc", "Leave present mode"],
];

function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-night/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-[18px] bg-night-2 p-6 ring-1 ring-paper/15">
        <h2 className="display text-3xl">Shortcuts</h2>
        <dl className="mt-4 space-y-2 text-sm">
          {SHORTCUTS.map(([key, what]) => (
            <div key={key} className="flex items-baseline justify-between gap-6">
              <dt className="shrink-0 rounded bg-night px-2 py-1 font-mono text-xs ring-1 ring-paper/15">{key}</dt>
              <dd className="text-right text-paper/75">{what}</dd>
            </div>
          ))}
        </dl>
        <button type="button" onClick={onClose} className="mt-6 w-full rounded-full bg-kop py-2.5 font-semibold">
          Got it
        </button>
      </div>
    </div>
  );
}
