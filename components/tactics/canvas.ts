import type { Board, Pt, Shape, Token } from "@/components/tactics/types";

/**
 * Canvas drawing shared by the live board and the PNG export, so what you save
 * is what you saw. Everything takes a width/height in CSS pixels and shape
 * coordinates in pitch percent.
 */

const at = (w: number, h: number, p: Pt): [number, number] => [(p[0] / 100) * w, (p[1] / 100) * h];

export function drawShape(ctx: CanvasRenderingContext2D, w: number, h: number, s: Shape) {
  if (s.t === "spot") {
    const [ax, ay] = at(w, h, s.a);
    const [bx, by] = at(w, h, s.b);
    ctx.save();
    ctx.fillStyle = "rgba(6,4,5,0.62)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.ellipse((ax + bx) / 2, (ay + by) / 2, Math.abs(bx - ax) / 2, Math.abs(by - ay) / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = s.color;
  ctx.lineWidth = s.w;
  ctx.setLineDash([]);

  if (s.t === "pen") {
    ctx.beginPath();
    s.pts.forEach((p, i) => {
      const [x, y] = at(w, h, p);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
    return;
  }

  const [ax, ay] = at(w, h, s.a);
  const [bx, by] = at(w, h, s.b);

  if (s.t === "line" || s.t === "arrow") {
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    if (s.t === "arrow") {
      const ang = Math.atan2(by - ay, bx - ax);
      const head = Math.max(10, s.w * 3.4);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx - head * Math.cos(ang - 0.4), by - head * Math.sin(ang - 0.4));
      ctx.lineTo(bx - head * Math.cos(ang + 0.4), by - head * Math.sin(ang + 0.4));
      ctx.closePath();
      ctx.fillStyle = s.color;
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  ctx.beginPath();
  if (s.t !== "rect" && s.t !== "ellipse") {
    ctx.restore();
    return;
  }
  if (s.t === "rect") ctx.rect(Math.min(ax, bx), Math.min(ay, by), Math.abs(bx - ax), Math.abs(by - ay));
  else ctx.ellipse((ax + bx) / 2, (ay + by) / 2, Math.abs(bx - ax) / 2, Math.abs(by - ay) / 2, 0, 0, Math.PI * 2);
  if (s.fill) {
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = s.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.stroke();
  ctx.restore();
}

export function drawShapes(ctx: CanvasRenderingContext2D, w: number, h: number, shapes: Shape[]) {
  for (const s of shapes) if (s.t !== "spot") drawShape(ctx, w, h, s);
  const spot = [...shapes].reverse().find((s) => s.t === "spot");
  if (spot) drawShape(ctx, w, h, spot);
}

/* ───────────── PNG export ───────────── */

function pitch(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const sx = w / 80;
  const sy = h / 105;
  ctx.fillStyle = "#153a22";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#1a4a2a";
  for (let i = 0; i < 10; i++) ctx.fillRect(0, i * 10.5 * sy, w, 5.25 * sy);

  ctx.strokeStyle = "rgba(234,224,204,0.6)";
  ctx.lineWidth = Math.max(1, 0.3 * sx);
  const rect = (x: number, y: number, rw: number, rh: number) => ctx.strokeRect(x * sx, y * sy, rw * sx, rh * sy);
  rect(2, 2, 76, 101);
  rect(19.85, 2, 40.3, 16.5);
  rect(30.85, 2, 18.3, 5.5);
  rect(19.85, 86.5, 40.3, 16.5);
  rect(30.85, 97.5, 18.3, 5.5);
  ctx.beginPath();
  ctx.moveTo(2 * sx, 52.5 * sy);
  ctx.lineTo(78 * sx, 52.5 * sy);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(40 * sx, 52.5 * sy, 9.15 * sx, 9.15 * sy, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function disc(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: Token,
  color: string,
  ink: "light" | "dark",
  r: number,
  img: HTMLImageElement | null,
) {
  const [x, y] = at(w, h, [t.x, t.y]);
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  if (img) {
    ctx.save();
    ctx.clip();
    ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
    ctx.restore();
  } else {
    ctx.fillStyle = ink === "dark" ? "#150a0c" : "#f4efe4";
    ctx.font = `700 ${r * 0.9}px Outfit, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t.number != null ? String(t.number) : t.last.slice(0, 2).toUpperCase(), x, y + r * 0.04);
  }
  ctx.lineWidth = Math.max(1.5, r * 0.12);
  ctx.strokeStyle = "rgba(244,239,228,0.85)";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = `600 ${r * 0.62}px Outfit, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const label = t.last;
  const tw = ctx.measureText(label).width;
  ctx.fillStyle = "rgba(21,10,12,0.85)";
  ctx.fillRect(x - tw / 2 - r * 0.2, y + r * 1.15, tw + r * 0.4, r * 0.85);
  ctx.fillStyle = "#f4efe4";
  ctx.fillText(label, x, y + r * 1.25);
  ctx.restore();
}

function dashed(ctx: CanvasRenderingContext2D, w: number, h: number, a: Pt, b: Pt, color: string, lw: number) {
  ctx.save();
  ctx.setLineDash([lw * 2.5, lw * 2]);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  const [ax, ay] = at(w, h, a);
  const [bx, by] = at(w, h, b);
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.stroke();
  ctx.restore();
}

export type ExportOpts = {
  board: Board;
  colorFor: (t: Token) => { color: string; ink: "light" | "dark" };
  trails: boolean;
  passLine: boolean;
  photos: boolean;
  title: string;
};

/** Render the board to a PNG data URL at a fixed, share-friendly size. */
export async function exportPng({ board, colorFor, trails, passLine, photos, title }: ExportOpts): Promise<string> {
  const w = 1080;
  const h = Math.round((105 / 80) * w);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;

  pitch(ctx, w, h);
  drawShapes(ctx, w, h, board.shapes);

  if (trails) {
    for (const t of board.tokens) {
      if (Math.hypot(t.x - t.ox, t.y - t.oy) < 1.2) continue;
      dashed(ctx, w, h, [t.ox, t.oy], [t.x, t.y], "rgba(244,239,228,0.9)", 4);
    }
  }
  if (passLine) for (const p of board.passes) dashed(ctx, w, h, p.a, p.b, "#f6c445", 4);

  const r = w * 0.032;
  let images: (HTMLImageElement | null)[] = board.tokens.map(() => null);
  if (photos) {
    images = await Promise.all(
      board.tokens.map(
        (t) =>
          new Promise<HTMLImageElement | null>((res) => {
            if (!t.photo) return res(null);
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => res(img);
            img.onerror = () => res(null);
            img.src = t.photo;
          }),
      ),
    );
  }
  board.tokens.forEach((t, i) => {
    const { color, ink } = colorFor(t);
    disc(ctx, w, h, t, color, ink, r, images[i]);
  });

  // Ball
  const [bx, by] = at(w, h, [board.ball.x, board.ball.y]);
  ctx.beginPath();
  ctx.arc(bx, by, r * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "#f8f5ee";
  ctx.fill();
  ctx.strokeStyle = "#150a0c";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "rgba(21,10,12,0.72)";
  ctx.fillRect(0, h - 54, w, 54);
  ctx.fillStyle = "#f4efe4";
  ctx.font = "600 26px Outfit, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(title, 24, h - 27);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(244,239,228,0.6)";
  ctx.fillText("Kop Karuthu", w - 24, h - 27);

  return c.toDataURL("image/png");
}
