'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import './StarWarsTerminal.css';

/**
 * Full-screen cinematic space background: a shaded TIE-fighter squadron
 * closing on the viewer through a parallax starfield. Click to fire.
 *
 * This canvas sits at z-index -1 behind every page, so it is deliberately
 * held back — low overall luminance plus a vignette — to keep foreground
 * text readable. Brightness is spent on small hot elements (cockpit glow,
 * laser cores, explosions) rather than on large bright areas.
 */

interface Star {
  x: number;
  y: number;
  z: number;
  prevScale: number;
}

interface Enemy {
  x: number;
  y: number;
  z: number;
  roll: number;
  rollRate: number;
  driftX: number;
  driftY: number;
  active: boolean;
}

interface Laser {
  // World-space origin and target. Bolts used to interpolate between two
  // SCREEN points, which is why they never shared the scene's perspective:
  // the ships shrank with distance and the bolts did not. Now they travel
  // through the same 3D space and the projection does the work.
  ox: number;
  oy: number;
  oz: number;
  tx: number;
  ty: number;
  tz: number;
  // Where the crosshair was on screen when this shot was fired. The bolt is
  // drawn along its own converging path, but hits are judged here, so what
  // you clicked is what dies.
  aimX: number;
  aimY: number;
  progress: number;
  active: boolean;
}

interface Debris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Explosion {
  x: number;
  y: number;
  scale: number;
  age: number;
  debris: Debris[];
  active: boolean;
}

// One focal length for everything, so stars and ships share a single
// coherent 3D space (the previous build used 128 for stars and 500 for
// ships, which made them move at contradictory rates).
const FOCAL = 320;
const Z_FAR = 2600;
// Ships are culled when they leave the frame, not at a fixed depth — that
// is what a fly-by is. This is just the backstop for the rare one heading
// almost straight down the lens.
const Z_NEAR = 40;
const MAX_ENEMIES = 5;
// Projected ship size at z = FOCAL. Drives both the drawing and the
// laser hit test, so the two can't drift apart.
const SHIP_SIZE = 62;
// Where bolts are born and where they expire, in the same z units as ships.
const BOLT_Z_START = 200;
const BOLT_Z_END = Z_FAR + 700;
// Bolt length as a fraction of its flight. It's a fixed length in WORLD
// terms; perspective shortens it on its own as it recedes.
const BOLT_SPAN = 0.055;

const BEST_KEY = 'starWarsHighScore';
let bestListeners: (() => void)[] = [];
let bestCache: string | null = null;

function readBest(): string {
  if (bestCache === null) {
    bestCache = window.localStorage.getItem(BEST_KEY) ?? '0';
  }
  return bestCache;
}

function writeBest(value: number) {
  bestCache = String(value);
  window.localStorage.setItem(BEST_KEY, bestCache);
  for (const l of bestListeners) l();
}

function subscribeBest(cb: () => void) {
  bestListeners.push(cb);
  return () => {
    bestListeners = bestListeners.filter((l) => l !== cb);
  };
}

export default function StarWarsTerminal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);

  // Server renders '0'; the client swaps in the stored value on hydration.
  const storedBest = Number(useSyncExternalStore(subscribeBest, readBest, () => '0'));
  const highScore = Math.max(score, storedBest);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;
    let dpr = 1;

    // Static backdrop (nebula + vignette) is expensive to build and never
    // changes between resizes, so it is rendered once to an offscreen
    // canvas and blitted each frame.
    let backdrop: HTMLCanvasElement | null = null;

    const stars: Star[] = [];
    const enemies: Enemy[] = [];
    const lasers: Laser[] = [];
    const explosions: Explosion[] = [];

    let pointerX = 0;
    let pointerY = 0;
    let pointerSeen = false;

    // Scroll couples into the starfield's forward velocity: scrolling down
    // accelerates you through the field, scrolling up backs you out, and
    // the boost decays so it settles to a drift when scrolling stops.
    // scrollVel is the raw target the wheel pushes around; scrollBoost is
    // what the scene actually uses. Feeding raw wheel deltas straight into
    // star velocity made every flick a hard step change, which is what read
    // as unnatural. scrollBoost chases the target instead of jumping to it.
    let scrollVel = 0;
    let scrollBoost = 0;
    let lastScrollY = 0;
    const SCROLL_MAX = 14;
    const SCROLL_MIN = -9;

    const spawnEnemy = () => {
      if (enemies.filter((e) => e.active).length >= MAX_ENEMIES) return;
      const dead = enemies.find((e) => !e.active);
      const spread = Math.max(width, height) * 1.1;

      // Guarantee lateral offset so every ship has a flight path that
      // carries it off the edge of the frame instead of into the lens.
      const minOff = spread * 0.17;
      let sx = (Math.random() - 0.5) * spread;
      const sy = (Math.random() - 0.5) * spread * 0.7;
      if (Math.abs(sx) < minOff) sx = sx < 0 ? -minOff : minOff;

      const next: Enemy = {
        x: sx,
        y: sy,
        z: Z_FAR + Math.random() * 600,
        roll: Math.random() * Math.PI * 2,
        rollRate: (Math.random() - 0.5) * 0.35,
        driftX: (Math.random() - 0.5) * 14,
        driftY: (Math.random() - 0.5) * 10,
        active: true,
      };
      if (dead) Object.assign(dead, next);
      else enemies.push(next);
    };

    const buildBackdrop = () => {
      const off = document.createElement('canvas');
      off.width = Math.max(1, Math.floor(width * dpr));
      off.height = Math.max(1, Math.floor(height * dpr));
      const b = off.getContext('2d');
      if (!b) return null;
      b.scale(dpr, dpr);

      b.fillStyle = '#01030a';
      b.fillRect(0, 0, width, height);

      // Two faint nebula clouds for depth. Kept very low alpha: this is a
      // backdrop, not a subject.
      const clouds = [
        { x: width * 0.22, y: height * 0.3, r: Math.max(width, height) * 0.45, c: '80, 40, 140' },
        { x: width * 0.82, y: height * 0.72, r: Math.max(width, height) * 0.4, c: '20, 70, 130' },
      ];
      for (const cl of clouds) {
        const g = b.createRadialGradient(cl.x, cl.y, 0, cl.x, cl.y, cl.r);
        g.addColorStop(0, `rgba(${cl.c}, 0.16)`);
        g.addColorStop(0.5, `rgba(${cl.c}, 0.05)`);
        g.addColorStop(1, `rgba(${cl.c}, 0)`);
        b.fillStyle = g;
        b.fillRect(0, 0, width, height);
      }

      // Vignette — the main reason foreground text stays legible.
      const v = b.createRadialGradient(
        width / 2, height / 2, Math.min(width, height) * 0.25,
        width / 2, height / 2, Math.max(width, height) * 0.75
      );
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(0,0,0,0.72)');
      b.fillStyle = v;
      b.fillRect(0, 0, width, height);

      return off;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      // Cap DPR at 2 — beyond that the fill cost outweighs any visible gain.
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Recomputed on every resize — the previous build captured these once
      // at mount, so the whole scene sat off-centre after any resize.
      cx = width / 2;
      cy = height / 2;

      if (!pointerSeen) {
        pointerX = cx;
        pointerY = cy;
      }

      backdrop = buildBackdrop();

      // Star density follows screen area so phones don't overdraw.
      const target = Math.round(Math.min(260, Math.max(90, (width * height) / 6200)));
      while (stars.length > target) stars.pop();
      while (stars.length < target) {
        stars.push({
          x: (Math.random() - 0.5) * width * 2.2,
          y: (Math.random() - 0.5) * height * 2.2,
          z: Math.random() * Z_FAR,
          prevScale: 0,
        });
      }
    };

    /** Solid, shaded TIE fighter drawn in local space around (0,0). */
    const drawTIE = (size: number, roll: number, lit: number) => {
      const wingH = size;
      const wingW = size * 0.34;
      const gap = size * 0.62;

      ctx.save();
      ctx.rotate(roll);

      const hull = `rgba(38, 42, 52, ${lit})`;
      const edge = `rgba(150, 165, 185, ${lit * 0.85})`;
      const panel = `rgba(22, 25, 32, ${lit})`;

      // --- Wing panels (the hexagonal solar arrays) ---
      for (const dir of [-1, 1]) {
        const wx = dir * gap;
        ctx.beginPath();
        ctx.moveTo(wx - wingW, -wingH * 0.72);
        ctx.lineTo(wx + wingW, -wingH);
        ctx.lineTo(wx + wingW, wingH);
        ctx.lineTo(wx - wingW, wingH * 0.72);
        ctx.closePath();
        ctx.fillStyle = panel;
        ctx.fill();
        ctx.lineWidth = Math.max(0.6, size * 0.045);
        ctx.strokeStyle = edge;
        ctx.stroke();

        // Panel ribs catch the light and sell the solidity.
        ctx.beginPath();
        ctx.strokeStyle = `rgba(120, 135, 155, ${lit * 0.4})`;
        ctx.lineWidth = Math.max(0.4, size * 0.022);
        for (let i = -2; i <= 2; i++) {
          const t = i / 2.4;
          ctx.moveTo(wx - wingW * 0.92, wingH * t * 0.82);
          ctx.lineTo(wx + wingW * 0.92, wingH * t);
        }
        ctx.stroke();
      }

      // --- Struts ---
      ctx.strokeStyle = hull;
      ctx.lineWidth = Math.max(1, size * 0.12);
      ctx.beginPath();
      ctx.moveTo(-gap, 0);
      ctx.lineTo(gap, 0);
      ctx.stroke();
      ctx.strokeStyle = edge;
      ctx.lineWidth = Math.max(0.4, size * 0.03);
      ctx.beginPath();
      ctx.moveTo(-gap, 0);
      ctx.lineTo(gap, 0);
      ctx.stroke();

      // --- Cockpit ball ---
      const r = size * 0.3;
      const sphere = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
      sphere.addColorStop(0, `rgba(96, 104, 120, ${lit})`);
      sphere.addColorStop(0.55, `rgba(46, 51, 62, ${lit})`);
      sphere.addColorStop(1, `rgba(14, 16, 22, ${lit})`);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = sphere;
      ctx.fill();
      ctx.lineWidth = Math.max(0.5, size * 0.035);
      ctx.strokeStyle = edge;
      ctx.stroke();

      // Viewport + its glow — the one genuinely bright element on the ship.
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(8, 9, 12, ${lit})`;
      ctx.fill();

      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.75);
      glow.addColorStop(0, `rgba(255, 96, 60, ${lit * 0.85})`);
      glow.addColorStop(0.45, `rgba(200, 50, 30, ${lit * 0.3})`);
      glow.addColorStop(1, 'rgba(160, 30, 20, 0)');
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      ctx.restore();
    };

    const drawExplosion = (exp: Explosion) => {
      const t = exp.age / 46;
      if (t >= 1) {
        exp.active = false;
        return;
      }

      const R = exp.scale * (0.5 + t * 2.6);
      const fade = 1 - t;

      // Fireball: white-hot core through yellow and orange to smoke.
      const g = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, R);
      g.addColorStop(0, `rgba(255, 255, 235, ${0.95 * fade})`);
      g.addColorStop(0.22, `rgba(255, 214, 110, ${0.85 * fade})`);
      g.addColorStop(0.5, `rgba(255, 122, 40, ${0.55 * fade})`);
      g.addColorStop(0.78, `rgba(150, 46, 20, ${0.25 * fade})`);
      g.addColorStop(1, 'rgba(40, 12, 8, 0)');
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, R, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      // Shock ring
      if (t < 0.55) {
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, R * 1.15, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 200, 140, ${0.4 * (1 - t / 0.55)})`;
        ctx.lineWidth = Math.max(1, exp.scale * 0.12);
        ctx.stroke();
      }

      for (const d of exp.debris) {
        if (d.life <= 0) continue;
        d.x += d.vx;
        d.y += d.vy;
        d.vx *= 0.965;
        d.vy *= 0.965;
        d.life -= 0.024;
        ctx.fillStyle = `rgba(255, ${140 + Math.floor(80 * d.life)}, 70, ${Math.max(0, d.life)})`;
        const s = Math.max(1, exp.scale * 0.07);
        ctx.fillRect(d.x - s / 2, d.y - s / 2, s, s);
      }
    };

    let last = performance.now();

    const frame = (now: number) => {
      // Delta-time normalised to 60fps so motion is frame-rate independent.
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;

      if (backdrop) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(backdrop, 0, 0);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      } else {
        ctx.fillStyle = '#01030a';
        ctx.fillRect(0, 0, width, height);
      }

      // Exponential decay so a flick of the wheel surges and then eases
      // back rather than cutting out the moment the scroll event stops.
      scrollVel *= Math.pow(0.93, dt);
      if (Math.abs(scrollVel) < 0.05) scrollVel = 0;

      // Low-pass filter on top: the visible boost eases toward the target
      // over ~5 frames, so acceleration and settling are both gradual.
      scrollBoost += (scrollVel - scrollBoost) * (1 - Math.pow(0.82, dt));

      // --- Stars: streak as they pass, which reads as real speed ---
      const starSpeed = 3 + (reduceMotion ? 0 : scrollBoost);
      for (const star of stars) {
        const pz = star.z;
        if (!reduceMotion) star.z -= starSpeed * dt;

        if (star.z <= 1) {
          star.z = Z_FAR;
          star.x = (Math.random() - 0.5) * width * 2.2;
          star.y = (Math.random() - 0.5) * height * 2.2;
          continue;
        }
        // Scrolling up pushes stars back out, so they have to wrap the
        // far plane too.
        if (star.z >= Z_FAR) {
          star.z = 1;
          star.x = (Math.random() - 0.5) * width * 2.2;
          star.y = (Math.random() - 0.5) * height * 2.2;
          continue;
        }

        const k = FOCAL / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;
        if (px < -40 || px > width + 40 || py < -40 || py > height + 40) continue;

        const depth = 1 - star.z / Z_FAR;
        const alpha = 0.15 + depth * 0.7;
        const kPrev = FOCAL / pz;
        const qx = star.x * kPrev + cx;
        const qy = star.y * kPrev + cy;
        const streak = Math.hypot(px - qx, py - qy);

        if (streak > 1.2 && !reduceMotion) {
          ctx.beginPath();
          ctx.moveTo(qx, qy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = `rgba(210, 226, 255, ${alpha * 0.75})`;
          ctx.lineWidth = Math.max(0.5, depth * 1.6);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(228, 238, 255, ${alpha})`;
          const s = Math.max(0.6, depth * 1.9);
          ctx.fillRect(px - s / 2, py - s / 2, s, s);
        }
      }

      // --- TIE fighters, far to near so nearer ships overlap correctly ---
      const visible = enemies.filter((e) => e.active).sort((a, b) => b.z - a.z);
      for (const e of visible) {
        if (!reduceMotion) {
          e.z -= (3.2 + (reduceMotion ? 0 : scrollBoost * 0.18)) * dt;
          e.roll += e.rollRate * 0.02 * dt;
          e.x += e.driftX * 0.06 * dt;
          e.y += e.driftY * 0.06 * dt;
        }

        // Scrolling up can push a ship back past the far plane, where it
        // would otherwise stay active forever and block the spawner.
        if (e.z <= Z_NEAR || e.z > Z_FAR * 1.7) {
          e.active = false;
          continue;
        }

        const k = FOCAL / e.z;
        const px = e.x * k + cx;
        const py = e.y * k + cy;
        const size = k * SHIP_SIZE;
        if (size < 0.8) continue;

        // The pass itself: perspective sweeps a ship outward as it closes,
        // and it is retired only once it has genuinely left the frame. It
        // no longer fades out mid-screen, so it reads as having flown past
        // the camera rather than dissolving in front of it.
        const margin = size * 1.6 + 100;
        if (px < -margin || px > width + margin || py < -margin || py > height + margin) {
          e.active = false;
          continue;
        }

        // Distant ships still fade in from the backdrop.
        const lit = Math.min(1, Math.max(0.12, 1.25 - e.z / Z_FAR));

        ctx.save();
        ctx.translate(px, py);
        drawTIE(size, e.roll, lit);
        ctx.restore();
      }

      // --- Lasers ---
      for (const laser of lasers) {
        if (!laser.active) continue;
        laser.progress += 0.03 * dt;
        if (laser.progress > 1) {
          laser.active = false;
          continue;
        }

        const p = laser.progress;
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        // Head and tail are two points on the same 3D path; each is
        // projected independently. A bolt near the camera therefore draws
        // long and thick, and the same bolt near the far plane draws as a
        // short thin dash — with no special-case maths, exactly like the
        // ships. `bz` is now a real depth, so the hit test below can use it.
        const bz = lerp(laser.oz, laser.tz, p);
        const k = FOCAL / bz;
        const hx = lerp(laser.ox, laser.tx, p) * k + cx;
        const hy = lerp(laser.oy, laser.ty, p) * k + cy;

        const tp = Math.max(0, p - BOLT_SPAN);
        const tzz = lerp(laser.oz, laser.tz, tp);
        const kt = FOCAL / tzz;
        const sx = lerp(laser.ox, laser.tx, tp) * kt + cx;
        const sy = lerp(laser.oy, laser.ty, tp) * kt + cy;

        // Widths track the same projection scale the ships use. Clamped so a
        // bolt right at the muzzle doesn't become a slab, and a bolt at the
        // far plane doesn't vanish entirely.
        const bloomW = Math.min(14, Math.max(2, k * 9));
        const bodyW = Math.min(6, Math.max(0.9, k * 4.2));
        const coreW = Math.min(3, Math.max(0.5, k * 2));
        const fade = Math.min(1, 0.35 + k * 0.9);

        // Bloom is layered strokes rather than shadowBlur, which is far
        // cheaper and gives a tighter falloff.
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(hx, hy);
        ctx.strokeStyle = `rgba(255, 40, 30, ${0.22 * fade})`;
        ctx.lineWidth = bloomW;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(hx, hy);
        ctx.strokeStyle = `rgba(255, 95, 60, ${0.65 * fade})`;
        ctx.lineWidth = bodyW;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(hx, hy);
        ctx.strokeStyle = `rgba(255, 240, 225, ${0.95 * fade})`;
        ctx.lineWidth = coreW;
        ctx.stroke();
        ctx.lineCap = 'butt';

        // Collision in projected space, but gated on depth so a bolt can
        // only hit a ship it has actually reached.
        for (const e of enemies) {
          if (!e.active) continue;
          const k = FOCAL / e.z;
          const ex = e.x * k + cx;
          const ey = e.y * k + cy;
          // Aim assist: distant ships draw only a few pixels across, so the
          // hit radius has a floor. Without it the proportional radius fell
          // below the pointer's own accuracy and far ships were unhittable.
          const drawn = k * SHIP_SIZE;
          if (drawn < 0.8) continue;
          const radius = Math.max(18, drawn * 0.95);

          // Wide enough to cover one frame of travel (~93 z units at 60fps,
          // up to ~280 on a stalled frame) so a bolt cannot tunnel straight
          // through a ship between frames.
          if (Math.abs(bz - e.z) > 320) continue;
          if (Math.hypot(laser.aimX - ex, laser.aimY - ey) > radius) continue;

          e.active = false;
          laser.active = false;

          const debris: Debris[] = [];
          for (let i = 0; i < 14; i++) {
            const a = Math.random() * Math.PI * 2;
            const sp = 1.5 + Math.random() * 4.5;
            debris.push({ x: ex, y: ey, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1 });
          }

          const slot = explosions.find((x) => !x.active);
          const made: Explosion = {
            x: ex, y: ey, scale: Math.max(10, radius * 0.7), age: 0, debris, active: true,
          };
          if (slot) Object.assign(slot, made);
          else explosions.push(made);

          scoreRef.current += 1;
          setScore(scoreRef.current);
          if (scoreRef.current > Number(readBest())) writeBest(scoreRef.current);
          break;
        }
      }

      for (const exp of explosions) {
        if (!exp.active) continue;
        exp.age += dt;
        drawExplosion(exp);
      }

      // Objects are recycled in place, but trim any surplus so neither
      // array can grow without bound over a long session.
      if (lasers.length > 48) {
        for (let i = lasers.length - 1; i >= 0 && lasers.length > 24; i--) {
          if (!lasers[i].active) lasers.splice(i, 1);
        }
      }
      if (explosions.length > 24) {
        for (let i = explosions.length - 1; i >= 0 && explosions.length > 12; i--) {
          if (!explosions[i].active) explosions.splice(i, 1);
        }
      }

      if (enemies.filter((e) => e.active).length < MAX_ENEMIES && Math.random() < 0.02 * dt) {
        spawnEnemy();
      }

      // --- Crosshair (pointer devices only) ---
      if (pointerSeen) {
        ctx.strokeStyle = 'rgba(255, 90, 60, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(pointerX, pointerY, 26, 0, Math.PI * 2);
        ctx.moveTo(pointerX - 40, pointerY); ctx.lineTo(pointerX - 15, pointerY);
        ctx.moveTo(pointerX + 40, pointerY); ctx.lineTo(pointerX + 15, pointerY);
        ctx.moveTo(pointerX, pointerY - 40); ctx.lineTo(pointerX, pointerY - 15);
        ctx.moveTo(pointerX, pointerY + 40); ctx.lineTo(pointerX, pointerY + 15);
        ctx.stroke();
      }

      animId = requestAnimationFrame(frame);
    };

    resize();
    for (let i = 0; i < 3; i++) spawnEnemy();
    let animId = requestAnimationFrame(frame);

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointerSeen = true;
      pointerX = e.clientX;
      pointerY = e.clientY;
    };
    const onFire = (e: MouseEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      // Cannons sit inboard of the screen edge, so bolts converge like
      // wing-mounted guns rather than shooting from the exact corners.
      const inset = width * 0.16;
      const originY = height * 1.02;

      // Unproject: a point on screen at depth z sits at world
      // (screen - centre) * z / FOCAL. That gives the cannons a real
      // position just in front of the camera, and the crosshair a real
      // position out at the far plane.
      const unprojX = (sx: number, z: number) => ((sx - cx) * z) / FOCAL;
      const unprojY = (sy: number, z: number) => ((sy - cy) * z) / FOCAL;

      for (const oxScreen of [inset, width - inset]) {
        const slot = lasers.find((l) => !l.active);
        const made: Laser = {
          ox: unprojX(oxScreen, BOLT_Z_START),
          oy: unprojY(originY, BOLT_Z_START),
          oz: BOLT_Z_START,
          tx: unprojX(pointerX, BOLT_Z_END),
          ty: unprojY(pointerY, BOLT_Z_END),
          tz: BOLT_Z_END,
          aimX: pointerX,
          aimY: pointerY,
          progress: 0,
          active: true,
        };
        if (slot) Object.assign(slot, made);
        else lasers.push(made);
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY;
      lastScrollY = y;
      scrollVel = Math.max(SCROLL_MIN, Math.min(SCROLL_MAX, scrollVel + delta * 0.16));
    };

    lastScrollY = window.scrollY;

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('click', onFire, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('click', onFire);
    };
  }, []);

  return (
    <div className="star-wars-terminal">
      <div className="sw-score-container">
        <div>SCORE {score.toString().padStart(5, '0')}</div>
        <div className="sw-score-top">BEST {highScore.toString().padStart(5, '0')}</div>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
}
