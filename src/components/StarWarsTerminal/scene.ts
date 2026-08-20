import * as THREE from 'three';

/**
 * The TIE fighter, as actual geometry.
 *
 * This is the whole reason the WebGL rewrite exists. The previous build
 * drew a flat billboard and spun it with a 2D rotate, so the ship could
 * never turn away from you: the same silhouette, the same painted-on
 * highlight, from every angle. Here the hull is real vertices with real
 * normals, so when a ship rolls, each face catches the key light
 * differently and the wings foreshorten on their own.
 *
 * Geometry and materials are created once and shared by every ship; only
 * the Mesh wrappers are per-instance.
 */

export interface ShipAssets {
  build: () => THREE.Group;
  dispose: () => void;
}

export function createShipFactory(): ShipAssets {
  // Hexagonal wing panel: a 6-sided prism laid on its side, which is
  // exactly what a TIE's solar array is.
  const wingGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.1, 6);
  wingGeo.rotateZ(Math.PI / 2);

  const hubGeo = new THREE.SphereGeometry(0.52, 28, 20);
  const strutGeo = new THREE.CylinderGeometry(0.075, 0.075, 2.1, 10);
  strutGeo.rotateZ(Math.PI / 2);
  const windowGeo = new THREE.CircleGeometry(0.3, 24);
  const rimGeo = new THREE.TorusGeometry(0.31, 0.035, 10, 28);

  // Deliberately lighter than a screen-accurate TIE. Against true black
  // the canonical near-black hull disappears; this reads as gunmetal in the
  // key light while still going properly dark on the shadow side.
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x9aa4b2,
    metalness: 0.72,
    roughness: 0.38,
  });

  // Panels are near-black and rougher, so they read as a different
  // material from the hull rather than the same grey twice.
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x59626f,
    metalness: 0.5,
    roughness: 0.62,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x090b10,
    metalness: 0.3,
    roughness: 0.25,
    emissive: new THREE.Color(0xff4a22),
    emissiveIntensity: 2.4,
  });

  const build = () => {
    const g = new THREE.Group();

    for (const dir of [-1, 1]) {
      const wing = new THREE.Mesh(wingGeo, panelMat);
      wing.position.x = dir * 1.15;
      g.add(wing);

      const strut = new THREE.Mesh(strutGeo, hullMat);
      strut.position.x = dir * 0.55;
      strut.scale.x = 0.55;
      g.add(strut);
    }

    g.add(new THREE.Mesh(hubGeo, hullMat));

    // Viewport faces -Z, which is where the camera is.
    const win = new THREE.Mesh(windowGeo, glassMat);
    win.position.z = -0.5;
    g.add(win);

    const rim = new THREE.Mesh(rimGeo, hullMat);
    rim.position.z = -0.49;
    g.add(rim);

    return g;
  };

  const dispose = () => {
    for (const geo of [wingGeo, hubGeo, strutGeo, windowGeo, rimGeo]) geo.dispose();
    for (const mat of [hullMat, panelMat, glassMat]) mat.dispose();
  };

  return { build, dispose };
}

/** Starfield as real points in the same space the ships fly through. */
export function createStarfield(count: number, depth: number, spread: number) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = -Math.random() * depth;
    sizes[i] = 0.6 + Math.random() * 1.8;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color: 0xf0f3fa,
    size: 1.6,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return { points: new THREE.Points(geo, mat), positions, geo, mat };
}
