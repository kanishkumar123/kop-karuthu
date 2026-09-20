"use client";

import { useEffect, useRef, useState } from "react";
import { Renderer, Program, Mesh, Triangle, Texture, RenderTarget, Vec2 } from "ogl";
import type { Img } from "@/lib/images";
import { cn } from "@/lib/utils";

/*
 * Fluid-ink colour reveal over a photo slideshow.
 *
 * A low-res "field" texture holds velocity (RG) and ink (B). Every frame:
 *   1. blur pass   – a 3×3 tent blur of the field (lets ink and velocity diffuse)
 *   2. field pass  – semi-Lagrangian advection: each texel looks back along its
 *                    velocity, mixes in the blurred copy, gets warped by drifting
 *                    noise, decays, and receives a splat of velocity + ink at the pointer
 *   3. composite   – B&W photo; where there's ink the real colour shows through with a
 *                    liquid sheen, refraction and chromatic aberration along the flow
 * Fast flicks throw ink further and leave swirling trails; ink fades back to B&W in ~2.4s.
 * Slides crossfade with a noise-edged dissolve every 8s (paused while painting).
 */

// ── tuning ───────────────────────────────────────────────────────────
const FIELD_W = 320; // field resolution (height follows the aspect ratio)
const RADIUS = 0.06; // splat falloff (exponential), in screen-height units
const STRENGTH = 0.55; // how much pointer velocity is injected per frame
const VEL_CLAMP = 4.0;
const VEL_DECAY = 0.045; // per 60fps frame (exponential)
const INK_DECAY = 0.4 / 60; // per 60fps frame (linear): full → gone in ~2.4s
const INK_ADD = 0.7;
const ADVECTION = 0.0035; // uv per frame per velocity unit
const BLUR_MIX = 0.35;
const INK_BLUR = 0.12;
const NOISE_STRENGTH = 0.0022;
const SLIDE_HOLD = 8; // seconds
const SLIDE_FADE = 1.6; // seconds

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

const common = /* glsl */ `
precision highp float;
uniform float uEnc;
// 8-bit fallback stores velocity biased around 0.5; half-float stores it raw
vec3 dec(vec4 t) { return uEnc > 0.5 ? vec3((t.rg - 0.50196) * 8.0, t.b) : t.rgb; }
vec4 enc(vec2 v, float ink) { return uEnc > 0.5 ? vec4(v / 8.0 + 0.50196, ink, 1.0) : vec4(v, ink, 1.0); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}`;

const initFrag = /* glsl */ `
${common}
void main() { gl_FragColor = enc(vec2(0.0), 0.0); }`;

const blurFrag = /* glsl */ `
precision highp float;
uniform sampler2D tSrc;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(tSrc, vUv) * 4.0;
  c += texture2D(tSrc, vUv + vec2(uTexel.x, 0.0)) * 2.0;
  c += texture2D(tSrc, vUv - vec2(uTexel.x, 0.0)) * 2.0;
  c += texture2D(tSrc, vUv + vec2(0.0, uTexel.y)) * 2.0;
  c += texture2D(tSrc, vUv - vec2(0.0, uTexel.y)) * 2.0;
  c += texture2D(tSrc, vUv + uTexel);
  c += texture2D(tSrc, vUv - uTexel);
  c += texture2D(tSrc, vUv + vec2(uTexel.x, -uTexel.y));
  c += texture2D(tSrc, vUv + vec2(-uTexel.x, uTexel.y));
  gl_FragColor = c / 16.0;
}`;

const fieldFrag = /* glsl */ `
${common}
uniform sampler2D tField;
uniform sampler2D tBlur;
uniform vec2 uMouse;
uniform vec2 uPrev;
uniform vec2 uVel;
uniform float uPresent;
uniform float uFps;
uniform float uAspect;
uniform float uTime;
varying vec2 vUv;
float sdSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0);
  return length(pa - ba * h);
}
void main() {
  vec2 ratio = vec2(uAspect, 1.0);
  // exponential falloff around the whole pointer path since last frame, so fast
  // flicks leave a continuous trail even at low frame rates
  float mask = exp(-sdSeg(vUv * ratio, uPrev * ratio, uMouse * ratio) / ${RADIUS.toFixed(4)});

  // semi-Lagrangian backtrace + drifting noise so ink curls instead of sliding
  vec3 base = dec(texture2D(tField, vUv));
  vec2 back = vUv - base.rg * ${ADVECTION.toFixed(5)} * uFps / ratio;
  vec2 np = vUv * ratio * 3.2;
  vec2 nz = (vec2(vnoise(np + uTime * 0.12), vnoise(np + vec2(7.3, 1.7) - uTime * 0.1)) - 0.5) * ${NOISE_STRENGTH.toFixed(5)} * uFps;
  vec2 d = back + nz;

  vec3 adv = dec(texture2D(tField, d));
  vec3 bl = dec(texture2D(tBlur, d));

  // blur mixes are "per 60fps frame" — rescale so 120/144Hz screens don't over-diffuse
  float vMix = 1.0 - pow(1.0 - ${BLUR_MIX.toFixed(3)}, uFps);
  float iMix = 1.0 - pow(1.0 - ${INK_BLUR.toFixed(3)}, uFps);
  vec2 vel = mix(adv.rg, bl.rg, vMix) * exp(-${VEL_DECAY.toFixed(4)} * uFps);
  float ink = max(0.0, mix(adv.b, bl.b, iMix) - ${INK_DECAY.toFixed(5)} * uFps);

  vel = clamp(vel + uVel * ${STRENGTH.toFixed(3)} * mask * uPresent * min(uFps, 2.0), -${VEL_CLAMP.toFixed(1)}, ${VEL_CLAMP.toFixed(1)});
  ink = min(1.0, ink + smoothstep(0.08, 1.0, mask) * uPresent * ${INK_ADD.toFixed(3)});
  gl_FragColor = enc(vel, ink);
}`;

const compositeFrag = /* glsl */ `
${common}
uniform sampler2D tField;
uniform sampler2D tA;
uniform sampler2D tB;
uniform vec2 uRes;
uniform vec2 uImgA;
uniform vec2 uImgB;
uniform vec2 uFocalA;
uniform vec2 uFocalB;
uniform float uMix;
uniform float uTime;
uniform float uReveal;
uniform float uAspect;
varying vec2 vUv;

// CSS object-fit: cover with object-position = focal
vec2 cover(vec2 uv, vec2 img, vec2 focal) {
  float rs = uRes.x / uRes.y;
  float ri = img.x / img.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return uv * s + (1.0 - s) * focal;
}

vec3 sampleCA(sampler2D t, vec2 uv, vec2 img, vec2 focal, vec2 ca) {
  return vec3(
    texture2D(t, cover(uv + ca, img, focal)).r,
    texture2D(t, cover(uv, img, focal)).g,
    texture2D(t, cover(uv - ca, img, focal)).b
  );
}

void main() {
  vec3 f = dec(texture2D(tField, vUv));
  float ink = smoothstep(0.03, 0.5, f.b);
  vec2 vel = f.rg;
  float sp = length(vel);
  vec2 dir = sp > 0.0001 ? vel / sp : vec2(0.0);

  // liquid refraction + chromatic aberration only where ink flows
  vec2 uv = vUv - vel * 0.0045 * ink / vec2(uAspect, 1.0);
  vec2 ca = dir * min(sp, 3.0) * 0.0028 * ink;

  vec3 a = sampleCA(tA, uv, uImgA, uFocalA, ca);
  vec3 b = sampleCA(tB, uv, uImgB, uFocalB, ca);

  // noise-edged dissolve between slides
  float n = vnoise(vUv * vec2(uAspect, 1.0) * 2.4 + 3.1) * 0.75 + vnoise(vUv * 11.0) * 0.25;
  float dm = smoothstep(n - 0.12, n + 0.12, uMix * 1.24 - 0.12);
  vec3 col = mix(a, b, dm);

  // B&W base with a punchy curve
  float l = smoothstep(0.02, 0.96, dot(col, vec3(0.299, 0.587, 0.114)));
  vec3 bw = vec3(l);

  // revealed colour, slightly boosted
  vec3 painted = mix(vec3(l), col, 1.14);

  // iridescent liquid sheen, tinted Kop red → floodlight gold → away teal
  float phase = sp * 0.9 + dot(vUv, vec2(2.6, 1.7)) + uTime * 0.35;
  vec3 irid = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.12, 0.28) + phase));
  irid = mix(vec3(0.88, 0.06, 0.18), vec3(0.97, 0.91, 0.69), irid.r) * (0.7 + 0.3 * irid.g) + vec3(0.12, 0.71, 0.64) * irid.b * 0.25;
  float sheen = ink * smoothstep(0.25, 2.8, sp) * 0.42;
  painted = 1.0 - (1.0 - painted) * (1.0 - irid * sheen); // screen blend

  // soft glowing rim where the ink is thinning
  float rim = ink * (1.0 - ink) * 4.0;
  painted += vec3(0.97, 0.91, 0.69) * rim * 0.06;

  vec3 c = mix(bw, painted, ink);

  c *= 0.8; // keep type over the photo legible
  float vig = smoothstep(1.3, 0.3, length((vUv - 0.5) * vec2(1.15, 1.0)));
  c *= mix(0.45, 1.0, vig);
  c = mix(c, vec3(0.082, 0.039, 0.047), smoothstep(0.38, 0.0, vUv.y) * 0.92);
  c += (hash(vUv * uRes + fract(uTime) * 91.0) - 0.5) * 0.05;

  gl_FragColor = vec4(c * uReveal, 1.0);
}`;

/** "50% 30%" → vec2(0.5, 0.7) in GL uv space (y up) */
function focalOf(img: Img) {
  const [x = "50%", y = "50%"] = (img.focal ?? "50% 50%").split(/\s+/);
  return new Vec2(parseFloat(x) / 100, 1 - parseFloat(y) / 100);
}

type Props = { slides: Img[]; className?: string; active?: boolean; onUnsupported?: () => void };

export function HeroInk({ slides, className, active = true, onUnsupported }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !slides.length) return;

    let renderer: Renderer;
    try {
      // big screens already push a lot of pixels; keep the count sane there
      const dprCap = window.innerWidth > 1600 ? 1.5 : 1.75;
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, dprCap), alpha: false, antialias: false, depth: false });
    } catch {
      onUnsupported?.();
      return;
    }
    const gl = renderer.gl;
    Object.assign(gl.canvas.style, { width: "100%", height: "100%", display: "block" });
    el.appendChild(gl.canvas);

    // Half-float field when the GPU can render to it; biased 8-bit otherwise
    const g2 = gl as WebGL2RenderingContext;
    const halfFloat = renderer.isWebgl2 && !!gl.getExtension("EXT_color_buffer_float");
    const enc = halfFloat ? 0 : 1;
    const rtBase = {
      depth: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      ...(halfFloat ? { type: g2.HALF_FLOAT, internalFormat: g2.RGBA16F, format: gl.RGBA } : {}),
    };
    let fieldW = FIELD_W;
    let fieldH = 180;
    let read = new RenderTarget(gl, { ...rtBase, width: fieldW, height: fieldH });
    let write = new RenderTarget(gl, { ...rtBase, width: fieldW, height: fieldH });
    const blurRT = new RenderTarget(gl, { ...rtBase, width: fieldW, height: fieldH });

    const geometry = new Triangle(gl);
    const initProg = new Program(gl, { vertex, fragment: initFrag, uniforms: { uEnc: { value: enc } } });
    const blurProg = new Program(gl, {
      vertex,
      fragment: blurFrag,
      uniforms: { tSrc: { value: read.texture }, uTexel: { value: new Vec2(1 / fieldW, 1 / fieldH) } },
    });
    const fieldProg = new Program(gl, {
      vertex,
      fragment: fieldFrag,
      uniforms: {
        uEnc: { value: enc },
        tField: { value: read.texture },
        tBlur: { value: blurRT.texture },
        uMouse: { value: new Vec2(-2, -2) },
        uPrev: { value: new Vec2(-2, -2) },
        uVel: { value: new Vec2(0, 0) },
        uPresent: { value: 0 },
        uFps: { value: 1 },
        uAspect: { value: 16 / 9 },
        uTime: { value: 0 },
      },
    });

    // Slide textures
    const textures = slides.map(() => new Texture(gl, { generateMipmaps: false }));
    const sizes = slides.map(() => new Vec2(16, 10));
    const focals = slides.map(focalOf);
    let loaded = 0;
    slides.forEach((s, i) => {
      const img = new Image();
      img.decoding = "async";
      img.src = s.texture ?? s.src;
      img.onload = () => {
        textures[i].image = img;
        sizes[i].set(img.naturalWidth, img.naturalHeight);
        loaded++;
        if (i === 0) setReady(true);
      };
    });

    const compProg = new Program(gl, {
      vertex,
      fragment: compositeFrag,
      uniforms: {
        uEnc: { value: enc },
        tField: { value: write.texture },
        tA: { value: textures[0] },
        tB: { value: textures[Math.min(1, textures.length - 1)] },
        uRes: { value: new Vec2(1, 1) },
        uImgA: { value: sizes[0] },
        uImgB: { value: sizes[Math.min(1, sizes.length - 1)] },
        uFocalA: { value: focals[0] },
        uFocalB: { value: focals[Math.min(1, focals.length - 1)] },
        uMix: { value: 0 },
        uTime: { value: 0 },
        uReveal: { value: 0 },
        uAspect: { value: 16 / 9 },
      },
    });

    const initMesh = new Mesh(gl, { geometry, program: initProg });
    const blurMesh = new Mesh(gl, { geometry, program: blurProg });
    const fieldMesh = new Mesh(gl, { geometry, program: fieldProg });
    const compMesh = new Mesh(gl, { geometry, program: compProg });

    const resetField = () => {
      for (const t of [read, write, blurRT]) renderer.render({ scene: initMesh, target: t });
    };

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      const aspect = width / height;
      compProg.uniforms.uRes.value.set(gl.canvas.width, gl.canvas.height);
      compProg.uniforms.uAspect.value = aspect;
      fieldProg.uniforms.uAspect.value = aspect;
      const h = Math.max(96, Math.round(FIELD_W / aspect));
      if (h !== fieldH) {
        fieldH = h;
        fieldW = FIELD_W;
        for (const t of [read, write, blurRT]) t.setSize(fieldW, fieldH);
        blurProg.uniforms.uTexel.value.set(1 / fieldW, 1 / fieldH);
        resetField();
      }
    };
    resetField();
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // ── pointer (uv space, y up) ──
    const ptr = { x: -2, y: -2, px: -2, py: -2, moved: false, lastPaint: -10 };
    const setPointer = (x: number, y: number) => {
      if (ptr.x < -1) {
        ptr.px = x;
        ptr.py = y;
      }
      ptr.x = x;
      ptr.y = y;
      ptr.moved = true;
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      setPointer((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(el);

    // ── slideshow state ──
    let cur = 0;
    let holdT = 0;
    let fadeT = -1; // <0 = holding

    let sweepStart = -1;
    let raf = 0;
    let last = performance.now();
    const t0 = last;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || document.hidden || !textures[0].image) return;
      const time = (now - t0) / 1000;
      const fps = dt * 60;

      // automatic swirl once the intro has finished — a hint that the photo is interactive
      if (activeRef.current && sweepStart < 0) sweepStart = time + 0.3;
      if (sweepStart > 0 && time >= sweepStart && time <= sweepStart + 1.8) {
        const k = (time - sweepStart) / 1.8;
        const a = k * Math.PI * 2.4;
        setPointer(0.18 + k * 0.62 + Math.cos(a) * 0.06, 0.55 + Math.sin(a) * 0.16);
      }

      // pointer velocity in "field units" (1 unit ≈ 1% of the screen per 60fps frame)
      const fu = fieldProg.uniforms;
      const vx = ((ptr.x - ptr.px) * 100) / Math.max(fps, 0.2);
      const vy = ((ptr.y - ptr.py) * 100) / Math.max(fps, 0.2);
      fu.uMouse.value.set(ptr.x, ptr.y);
      fu.uPrev.value.set(ptr.px, ptr.py);
      fu.uVel.value.set(vx * fu.uAspect.value, vy);
      fu.uPresent.value = ptr.moved ? 1 : 0;
      fu.uFps.value = fps;
      fu.uTime.value = time;
      if (ptr.moved && (Math.abs(vx) + Math.abs(vy) > 0.05)) ptr.lastPaint = time;
      ptr.px = ptr.x;
      ptr.py = ptr.y;
      ptr.moved = false;

      // 1. blur  2. field
      blurProg.uniforms.tSrc.value = read.texture;
      renderer.render({ scene: blurMesh, target: blurRT });
      fu.tField.value = read.texture;
      renderer.render({ scene: fieldMesh, target: write });

      // slideshow: hold, then dissolve to the next slide (paused while painting)
      const cu = compProg.uniforms;
      if (textures.length > 1 && loaded >= textures.length) {
        const painting = time - ptr.lastPaint < 1.2;
        if (fadeT < 0) {
          if (!painting) holdT += dt;
          if (holdT >= SLIDE_HOLD) {
            fadeT = 0;
            const nxt = (cur + 1) % textures.length;
            cu.tA.value = textures[cur];
            cu.uImgA.value = sizes[cur];
            cu.uFocalA.value = focals[cur];
            cu.tB.value = textures[nxt];
            cu.uImgB.value = sizes[nxt];
            cu.uFocalB.value = focals[nxt];
          }
        } else {
          fadeT += dt;
          const k = Math.min(1, fadeT / SLIDE_FADE);
          cu.uMix.value = k * k * (3 - 2 * k);
          if (k >= 1) {
            cur = (cur + 1) % textures.length;
            cu.tA.value = textures[cur];
            cu.uImgA.value = sizes[cur];
            cu.uFocalA.value = focals[cur];
            cu.uMix.value = 0;
            fadeT = -1;
            holdT = 0;
          }
        }
      }

      // 3. composite
      cu.tField.value = write.texture;
      cu.uTime.value = time;
      cu.uReveal.value += (1 - cu.uReveal.value) * 0.04;
      renderer.render({ scene: compMesh });

      [read, write] = [write, read];
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, [slides, onUnsupported]);

  return (
    <div
      ref={wrap}
      aria-hidden
      className={cn("absolute inset-0 transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0", className)}
    />
  );
}
