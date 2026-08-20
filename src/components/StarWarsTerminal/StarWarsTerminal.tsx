'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { createShipFactory, createStarfield } from './scene';
import './StarWarsTerminal.css';

/**
 * WebGL space scene behind the whole site.
 *
 * Real geometry, real normals, one key light. The ships are lit rather
 * than painted, which is the point: as one rolls, each face takes the
 * light differently and the wing panels foreshorten by themselves. The
 * previous canvas build could not do either, and that is what made it
 * read as fake no matter how much detail went on top.
 *
 * Held deliberately dark. This sits behind every page, so brightness is
 * spent only on small hot elements (viewport glow, bolts, explosions)
 * that bloom picks up, never on large areas competing with text.
 */

const SPAWN_Z = -1400;
const CULL_Z = 60;
const MAX_SHIPS = 5;
// The hull is modelled about 4.6 units across, which is a sensible size to
// author but far too small to see from a spawn a thousand units away: it
// worked out at roughly two pixels. The model stays as built and the whole
// group is scaled here, so one number controls apparent size.
const SHIP_SCALE = 10;
const SHIP_SPAN = 46;
const STAR_DEPTH = 2000;
// Vertical FOV tuned for landscape. Three's fov is vertical, so a portrait
// phone would otherwise lose most of the horizontal field; resize() widens
// it on tall screens and caps the widening to avoid lens distortion.
const BASE_FOV = 58;
const MAX_FOV = 82;

interface Ship {
  group: THREE.Group;
  spin: THREE.Vector3;
  drift: THREE.Vector3;
  alive: boolean;
}

interface Bolt {
  mesh: THREE.Object3D;
  vel: THREE.Vector3;
  life: number;
  alive: boolean;
}

interface Burst {
  points: THREE.Points;
  vel: Float32Array;
  age: number;
  alive: boolean;
}

// --- Best score -----------------------------------------------------------
// The displayed best is whatever we currently believe: the browser's own
// record until the server answers, then the global figure. localStorage is
// kept as the offline fallback so the HUD still shows something sensible
// when the store is not configured or the network is down.

const BEST_KEY = 'starWarsHighScore';
let bestListeners: (() => void)[] = [];
let bestValue: number | null = null;
let bestIsGlobal = false;

function notify() {
  for (const l of bestListeners) l();
}

function readBest(): number {
  if (bestValue === null) {
    bestValue = Number(window.localStorage.getItem(BEST_KEY) ?? '0') || 0;
  }
  return bestValue;
}

function setBest(value: number, global: boolean) {
  const wasGlobal = bestIsGlobal;
  if (global) bestIsGlobal = true;

  const higher = bestValue === null || value > bestValue;
  if (higher) bestValue = value;

  // The flag is part of what the HUD renders, so a flip has to notify even
  // when the number itself did not move.
  if (higher || (!wasGlobal && bestIsGlobal)) notify();
}

function subscribeBest(cb: () => void) {
  bestListeners.push(cb);
  return () => {
    bestListeners = bestListeners.filter((l) => l !== cb);
  };
}

/** Whether the number on screen is the world record or just this browser's. */
function readBestIsGlobal(): boolean {
  return bestIsGlobal;
}

async function fetchGlobalBest() {
  try {
    const res = await fetch('/api/score', { cache: 'no-store' });
    if (!res.ok) return;
    const data = (await res.json()) as { best?: number; available?: boolean };
    if (data.available && typeof data.best === 'number') {
      setBest(data.best, true);
    }
  } catch {
    // Offline or unconfigured: the local best already on screen stands.
  }
}

// A run scores one point per kill, and submitting on every one of them would
// burn through the per-minute allowance mid-game. Submit at most this often,
// and always flush the final figure when the page goes away.
const SUBMIT_INTERVAL_MS = 8000;
let lastSubmitAt = 0;
let pendingScore = 0;

async function pushScore(score: number) {
  pendingScore = 0;
  try {
    const res = await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score }),
      keepalive: true,
    });
    if (!res.ok) return;
    const data = (await res.json()) as { best?: number; available?: boolean };
    if (data.available && typeof data.best === 'number') setBest(data.best, true);
  } catch {
    // Keep the local record; the next run will try again.
  }
}

function recordScore(score: number) {
  if (score <= 0) return;

  // Local record and the HUD update immediately; the server is caught up
  // separately so a slow round trip never delays the number on screen.
  if (score > readBest()) {
    window.localStorage.setItem(BEST_KEY, String(score));
    setBest(score, false);
  }

  pendingScore = Math.max(pendingScore, score);
  const now = Date.now();
  if (now - lastSubmitAt >= SUBMIT_INTERVAL_MS) {
    lastSubmitAt = now;
    void pushScore(pendingScore);
  }
}

function flushScore() {
  if (pendingScore > 0) void pushScore(pendingScore);
}

export default function StarWarsTerminal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);

  const storedBest = useSyncExternalStore(subscribeBest, readBest, () => 0);
  const isWorldRecord = useSyncExternalStore(subscribeBest, readBestIsGlobal, () => false);
  const highScore = Math.max(score, storedBest);

  useEffect(() => {
    void fetchGlobalBest();

    // pagehide rather than unload: it is the event that still fires on iOS
    // and when a tab is frozen, and fetch(keepalive) survives it.
    const onLeave = () => flushScore();
    window.addEventListener('pagehide', onLeave);
    return () => {
      onLeave();
      window.removeEventListener('pagehide', onLeave);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      // No WebGL: the CSS background colour stands in. Better an empty
      // dark field than a broken canvas.
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    renderer.setClearColor(0x000000, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Low exposure keeps the scene a backdrop; bloom does the rest.
    renderer.toneMappingExposure = 0.85;

    const scene = new THREE.Scene();
    // Distance fade comes from real fog now rather than a per-object alpha,
    // so ships and stars recede together.
    scene.fog = new THREE.FogExp2(0x000000, 0.0004);

    const camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.5, 3200);
    camera.position.set(0, 0, 0);

    // Half-extents of the view cone at a given depth. Spawn bounds derive
    // from these so ships are framed the same on any aspect. Declared here,
    // directly under the camera, because placeShip() below calls them: as
    // consts further down the effect body they sat in the temporal dead
    // zone and the first spawn threw.
    const halfHeightAt = (z: number) =>
      Math.abs(z) * Math.tan((camera.fov * Math.PI) / 360);
    const halfWidthAt = (z: number) => halfHeightAt(z) * camera.aspect;
    let starSpreadX = 900;
    let starSpreadY = 900;

    // --- Lighting: one key, one fill, one cold rim ---
    const key = new THREE.DirectionalLight(0xfff4e6, 3.6);
    key.position.set(-4, 5, 2);
    scene.add(key);

    // Was 0x4466aa, which tinted every unlit face blue and, with bloom
    // spreading it, washed the whole frame. A near-neutral cool fill still
    // separates the shadow side without colouring the scene.
    const fill = new THREE.DirectionalLight(0x33404f, 0.6);
    fill.position.set(5, -2, 1);
    scene.add(fill);

    scene.add(new THREE.AmbientLight(0x1b202a, 0.55));

    // Sits beyond the ships and shines back toward the camera, catching the
    // outer edge of the hull and wing panels. On a black field this rim is
    // what keeps a ship from reading as a hole in the starfield.
    const rim = new THREE.DirectionalLight(0xbcd2ff, 1.5);
    rim.position.set(1.5, 2, -6);
    scene.add(rim);

    // --- Starfield ---
    // Halved. The field was dense enough to read as static noise rather
    // than depth, and it was also the main thing bloom was smearing.
    const starCount = Math.round(
      Math.min(700, Math.max(200, (window.innerWidth * window.innerHeight) / 2800))
    );
    const stars = createStarfield(starCount, STAR_DEPTH, 900);
    scene.add(stars.points);

    // --- Ships ---
    const factory = createShipFactory();
    const ships: Ship[] = [];

    const placeShip = (ship: Ship) => {
      const z = SPAWN_Z - Math.random() * 500;
      const hw = halfWidthAt(z);
      const hh = halfHeightAt(z);
      // Inside the cone, but off-centre, so every ship has a flight path
      // that carries it out of frame rather than into the lens.
      let x = (Math.random() - 0.5) * hw * 1.5;
      const minOff = hw * 0.16;
      if (Math.abs(x) < minOff) x = x < 0 ? -minOff : minOff;
      ship.group.scale.setScalar(SHIP_SCALE);
      ship.group.position.set(x, (Math.random() - 0.5) * hh * 1.2, z);
      ship.group.rotation.set(Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28);
      ship.spin.set(
        (Math.random() - 0.5) * 0.006,
        (Math.random() - 0.5) * 0.006,
        (Math.random() - 0.5) * 0.01
      );
      ship.drift.set((Math.random() - 0.5) * 0.22, (Math.random() - 0.5) * 0.16, 0);
      ship.group.visible = true;
      ship.alive = true;
    };

    const spawnShip = () => {
      const dead = ships.find((s) => !s.alive);
      if (dead) {
        placeShip(dead);
        return;
      }
      if (ships.length >= MAX_SHIPS) return;
      const group = factory.build();
      const ship: Ship = {
        group,
        spin: new THREE.Vector3(),
        drift: new THREE.Vector3(),
        alive: true,
      };
      placeShip(ship);
      scene.add(group);
      ships.push(ship);
    };


    // --- Bolts ---
    // One unlit cylinder renders every pixel of the bolt at the same colour,
    // so there is no falloff across its width and it reads as a flat stick
    // no matter how much bloom is thrown at it. Two additive layers fix
    // that: a near-white core inside a wider, softer, coloured sheath. The
    // overlap brightens toward the middle, which is what the eye reads as a
    // round, glowing object rather than a painted line.
    //
    // The sheath tapers from a wide tail to a tighter nose so the bolt has a
    // direction of travel even in a still frame.
    const boltCoreGeo = new THREE.CylinderGeometry(0.2, 0.2, 30, 6);
    boltCoreGeo.rotateX(Math.PI / 2);
    const boltGlowGeo = new THREE.CylinderGeometry(0.5, 0.95, 34, 10);
    boltGlowGeo.rotateX(Math.PI / 2);

    // Additive so bolts brighten what they cross and feed the bloom pass;
    // depthWrite off so the two layers never z-fight with each other.
    const boltCoreMat = new THREE.MeshBasicMaterial({
      color: 0xfff3ea,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const boltGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff4a22,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const makeBolt = () => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(boltGlowGeo, boltGlowMat));
      g.add(new THREE.Mesh(boltCoreGeo, boltCoreMat));
      return g;
    };

    const bolts: Bolt[] = [];

    // --- Explosions ---
    const bursts: Burst[] = [];
    const burstMat = new THREE.PointsMaterial({
      color: 0xffb066,
      size: 3.2,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const explodeAt = (pos: THREE.Vector3) => {
      if (bursts.length >= 4) return;
      const n = 60;
      const positions = new Float32Array(n * 3);
      const vel = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = pos.y;
        positions[i * 3 + 2] = pos.z;
        const dir = new THREE.Vector3(
          Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5
        ).normalize().multiplyScalar(0.7 + Math.random() * 2.6);
        vel[i * 3] = dir.x;
        vel[i * 3 + 1] = dir.y;
        vel[i * 3 + 2] = dir.z;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const pts = new THREE.Points(geo, burstMat.clone());
      scene.add(pts);
      bursts.push({ points: pts, vel, age: 0, alive: true });
    };

    // --- Post: bloom is what makes the emissive parts read as light ---
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    // strength, radius, threshold. The threshold now sits above the stars
    // so only genuinely hot things (viewport, bolts, fireballs) bloom.
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.7, 0.45, 0.62);
    composer.addPass(bloom);

    // --- Sizing ---
    let width = 0;
    let height = 0;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      // Bloom cost scales with pixel count, so the ceiling is lower than it
      // would be for a plain forward render.
      //
      // Phones get a tighter budget again. A coarse pointer is a good proxy
      // for a battery-powered GPU, and at that screen size the extra
      // resolution buys almost nothing: this is a backdrop behind text, and
      // it is the only thing on the page rendering every frame. Halves the
      // per-frame fragment work on a typical handset.
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.4);
      const bloomDiv = coarse ? 3 : 2;

      renderer.setPixelRatio(dpr);
      composer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
      bloom.setSize(Math.round(width / bloomDiv), Math.round(height / bloomDiv));
      const aspect = width / height;
      camera.aspect = aspect;
      // Portrait: widen the vertical field so the horizontal one does not
      // collapse. Landscape keeps the tuned value.
      camera.fov =
        aspect >= 1
          ? BASE_FOV
          : Math.min(
              MAX_FOV,
              (2 * Math.atan(Math.tan((BASE_FOV * Math.PI) / 360) / aspect) * 180) / Math.PI
            );
      camera.updateProjectionMatrix();

      starSpreadX = halfWidthAt(STAR_DEPTH) * 2.1;
      starSpreadY = halfHeightAt(STAR_DEPTH) * 2.1;
    };
    resize();

    // Stagger the opening formation through the depth range so the scene
    // has ships at readable sizes immediately, instead of three specks that
    // take twenty seconds to arrive.
    for (let i = 0; i < 4; i++) {
      spawnShip();
      const s0 = ships[ships.length - 1];
      if (s0) s0.group.position.z = -260 - i * 330;
    }

    // --- Input ---
    const pointer = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();

    let scrollVel = 0;
    let scrollBoost = 0;
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      scrollVel = Math.max(-9, Math.min(14, scrollVel + (y - lastScrollY) * 0.16));
      lastScrollY = y;
    };

    // Anything that carries its own affordance. Over these the reticle is
    // the wrong signal: a button is not a target.
    const UI_SELECTOR = 'a,button,[role="button"],.dock-panel,.cat-chat-container';
    // Typing needs the precision of a real caret, so these keep the I-beam
    // and the reticle gets out of the way entirely.
    const TEXT_SELECTOR = 'input,textarea,select,.devterm';

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

      const ch = crosshairRef.current;
      if (!ch) return;

      const el = e.target instanceof Element ? e.target : null;
      const mode = el?.closest(TEXT_SELECTOR)
        ? 'text'
        : el?.closest(UI_SELECTOR)
          ? 'ui'
          : 'armed';
      ch.dataset.mode = mode;

      ch.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };

    let recoilTimer: ReturnType<typeof setTimeout> | undefined;

    const onFire = (e: MouseEvent) => {
      // Recoil is the confirmation that the click did something, and it is
      // what teaches the control: press, the sight kicks, bolts leave.
      const ch = crosshairRef.current;
      if (ch && ch.dataset.mode === 'armed') {
        ch.classList.remove('is-firing');
        // Reflow, so a rapid second click restarts the animation instead of
        // being swallowed by the still-running one.
        void ch.offsetWidth;
        ch.classList.add('is-firing');
        clearTimeout(recoilTimer);
        recoilTimer = setTimeout(() => ch.classList.remove('is-firing'), 220);
      }

      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      // Cannons sit inboard and below, so the pair converges on the aim
      // point like wing guns instead of firing from the screen corners.
      for (const side of [-1, 1]) {
        const origin = new THREE.Vector3(side * 26, -16, -12);
        const target = raycaster.ray.direction.clone().multiplyScalar(1400);
        const dir = target.sub(origin).normalize();

        const dead = bolts.find((b) => !b.alive);
        const mesh = dead ? dead.mesh : makeBolt();
        mesh.position.copy(origin);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
        mesh.visible = true;
        if (!dead) scene.add(mesh);

        const bolt: Bolt = { mesh, vel: dir.multiplyScalar(26), life: 0, alive: true };
        if (dead) Object.assign(dead, bolt);
        else bolts.push(bolt);
      }
    };

    // --- Loop ---
    let last = performance.now();
    let raf = 0;
    let paused = document.hidden;

    const onVisibility = () => {
      paused = document.hidden;
      // Reset the clock so returning to the tab does not apply one enormous
      // delta and teleport everything forward.
      last = performance.now();
      if (!paused) raf = requestAnimationFrame(frame);
    };
    const hitBox = new THREE.Box3();
    const shipPos = new THREE.Vector3();
    // Swept-collision scratch. Hoisted like the rest: allocating a Vector3
    // per bolt per ship per frame is exactly the kind of garbage that shows
    // up as periodic hitching.
    const prevPos = new THREE.Vector3();
    const sweepDir = new THREE.Vector3();
    const sweepRay = new THREE.Ray();
    const hitPoint = new THREE.Vector3();
    // Hoisted: this used to be constructed inside the bolt/ship loop, so it
    // allocated once per pair per frame and fed the garbage collector.
    const hitSize = new THREE.Vector3(SHIP_SPAN, SHIP_SPAN, SHIP_SPAN);
    let aliveShips = 0;

    const frame = (now: number) => {
      if (paused) return;
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;

      scrollVel *= Math.pow(0.93, dt);
      if (Math.abs(scrollVel) < 0.05) scrollVel = 0;
      scrollBoost += (scrollVel - scrollBoost) * (1 - Math.pow(0.82, dt));

      const speed = reduceMotion ? 0 : (3.4 + scrollBoost) * dt;

      // Stars
      const sp = stars.positions;
      for (let i = 0; i < sp.length; i += 3) {
        sp[i + 2] += speed;
        if (sp[i + 2] > 20) {
          sp[i] = (Math.random() - 0.5) * starSpreadX;
          sp[i + 1] = (Math.random() - 0.5) * starSpreadY;
          sp[i + 2] = -STAR_DEPTH;
        } else if (sp[i + 2] < -STAR_DEPTH - 20) {
          sp[i + 2] = 0;
        }
      }
      stars.geo.attributes.position.needsUpdate = true;

      // Ships
      aliveShips = 0;
      for (const ship of ships) {
        if (!ship.alive) continue;
        aliveShips += 1;
        ship.group.position.z += speed * 1.35;
        ship.group.position.x += ship.drift.x * dt;
        ship.group.position.y += ship.drift.y * dt;
        if (!reduceMotion) {
          ship.group.rotation.x += ship.spin.x * dt;
          ship.group.rotation.y += ship.spin.y * dt;
          ship.group.rotation.z += ship.spin.z * dt;
        }
        if (ship.group.position.z > CULL_Z) {
          ship.alive = false;
          ship.group.visible = false;
        }
      }

      if (aliveShips < MAX_SHIPS && Math.random() < 0.02 * dt) {
        spawnShip();
      }

      // Bolts
      for (const bolt of bolts) {
        if (!bolt.alive) continue;
        prevPos.copy(bolt.mesh.position);
        bolt.mesh.position.addScaledVector(bolt.vel, dt);
        const stepLen = prevPos.distanceTo(bolt.mesh.position);
        bolt.life += dt;
        if (bolt.life > 110 || bolt.mesh.position.z < SPAWN_Z - 400) {
          bolt.alive = false;
          bolt.mesh.visible = false;
          continue;
        }

        for (const ship of ships) {
          if (!ship.alive) continue;
          ship.group.getWorldPosition(shipPos);
          // A box around the hull is a fair proxy for a TIE and far cheaper
          // than per-triangle intersection every frame.
          hitBox.setFromCenterAndSize(shipPos, hitSize);

          // A bolt covers 26 units in a frame at 60fps, and more when the
          // frame rate dips, against a hull box only 23 units from centre
          // to face. Testing the end point alone therefore steps straight
          // over ships: the shot visibly passes through and nothing
          // happens. Sweep the segment the bolt actually travelled instead.
          let struck = hitBox.containsPoint(bolt.mesh.position);
          if (!struck && stepLen > 0) {
            sweepDir.copy(bolt.mesh.position).sub(prevPos).divideScalar(stepLen);
            sweepRay.set(prevPos, sweepDir);
            struck =
              sweepRay.intersectBox(hitBox, hitPoint) !== null &&
              prevPos.distanceTo(hitPoint) <= stepLen;
          }
          if (!struck) continue;

          explodeAt(shipPos);
          ship.alive = false;
          ship.group.visible = false;
          bolt.alive = false;
          bolt.mesh.visible = false;

          scoreRef.current += 1;
          setScore(scoreRef.current);
          recordScore(scoreRef.current);
          break;
        }
      }

      // Bursts
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.age += dt;
        const attr = b.points.geometry.attributes.position;
        const arr = attr.array as Float32Array;
        for (let j = 0; j < arr.length; j += 3) {
          arr[j] += b.vel[j] * dt;
          arr[j + 1] += b.vel[j + 1] * dt;
          arr[j + 2] += b.vel[j + 2] * dt;
        }
        attr.needsUpdate = true;
        const mat = b.points.material as THREE.PointsMaterial;
        mat.opacity = Math.max(0, 1 - b.age / 46);
        if (b.age > 46) {
          scene.remove(b.points);
          b.points.geometry.dispose();
          mat.dispose();
          bursts.splice(i, 1);
        }
      }

      composer.render();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (finePointer) document.documentElement.classList.add('sw-reticle-on');

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('click', onFire, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      clearTimeout(recoilTimer);
      document.documentElement.classList.remove('sw-reticle-on');
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('click', onFire);

      for (const b of bursts) {
        scene.remove(b.points);
        b.points.geometry.dispose();
        (b.points.material as THREE.Material).dispose();
      }
      boltCoreGeo.dispose();
      boltGlowGeo.dispose();
      boltCoreMat.dispose();
      boltGlowMat.dispose();
      burstMat.dispose();
      stars.geo.dispose();
      stars.mat.dispose();
      factory.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <div className="star-wars-terminal">
        <div className="sw-score-container">
          <div>SCORE {score.toString().padStart(5, '0')}</div>
          <div className="sw-score-top">
            {isWorldRecord ? 'WORLD' : 'BEST'} {highScore.toString().padStart(5, '0')}
          </div>
        </div>
        <canvas ref={canvasRef} />
        {/* Vignette lives in CSS rather than the render, so it costs nothing
            per frame and keeps foreground text readable. */}
        <div className="sw-vignette" aria-hidden="true" />
      </div>

      {/* Outside the scene on purpose. The scene sits at z-index -1, and a
          child cannot escape its parent's stacking context, so in there the
          reticle could never draw over the page. */}
      <div ref={crosshairRef} className="sw-cursor" data-mode="armed" aria-hidden="true">
        <span className="sw-cursor-ring" />
        <span className="sw-cursor-dot" />
      </div>
    </>
  );
}
