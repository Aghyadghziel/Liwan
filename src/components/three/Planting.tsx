'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useMaterials } from './Materials';

/**
 * Planting. Trees are not blobs: each canopy is a few hundred small leaf sprays, turned every
 * way, shaded as one rounded volume (their normals point out from the crown, not off each
 * card). Palms are built frond by frond. Everything is grown from a seed, merged into a single
 * mesh per plant, and reused — so the garden costs a handful of draw calls.
 */

function seeded(seed: number) {
  let state = seed * 9301 + 49297;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/** Appends one quad to the buffers, with a normal that belongs to the crown, not the card. */
function pushCard(buffers: { position: number[]; normal: number[]; uv: number[]; index: number[] }, matrix: THREE.Matrix4, normal: THREE.Vector3) {
  const base = buffers.position.length / 3;
  const corners: [number, number][] = [
    [-0.5, -0.5],
    [0.5, -0.5],
    [0.5, 0.5],
    [-0.5, 0.5],
  ];
  const v = new THREE.Vector3();
  for (const [x, y] of corners) {
    v.set(x, y, 0).applyMatrix4(matrix);
    buffers.position.push(v.x, v.y, v.z);
    buffers.normal.push(normal.x, normal.y, normal.z);
    buffers.uv.push(x + 0.5, y + 0.5);
  }
  buffers.index.push(base, base + 1, base + 2, base, base + 2, base + 3);
}

function toGeometry(buffers: { position: number[]; normal: number[]; uv: number[]; index: number[] }) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(buffers.position, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(buffers.normal, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(buffers.uv, 2));
  geometry.setIndex(buffers.index);
  geometry.computeBoundingSphere();
  return geometry;
}

/** A crown of leaf sprays filling a few overlapping ellipsoids. */
function crownGeometry(seed: number, lobes: { centre: [number, number, number]; radius: [number, number, number] }[], cards: number, size: number) {
  const random = seeded(seed);
  const buffers = { position: [] as number[], normal: [] as number[], uv: [] as number[], index: [] as number[] };
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const middle = new THREE.Vector3();
  for (const lobe of lobes) middle.add(new THREE.Vector3(...lobe.centre));
  middle.divideScalar(lobes.length);

  for (let i = 0; i < cards; i++) {
    const lobe = lobes[i % lobes.length];
    // Points gather toward the surface of the lobe: a crown is a shell of leaves, not a solid.
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(1 - random() * 1.7);
    const shell = 0.55 + Math.pow(random(), 0.6) * 0.45;
    position.set(
      lobe.centre[0] + Math.sin(phi) * Math.cos(theta) * lobe.radius[0] * shell,
      lobe.centre[1] + Math.cos(phi) * lobe.radius[1] * shell,
      lobe.centre[2] + Math.sin(phi) * Math.sin(theta) * lobe.radius[2] * shell,
    );
    euler.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
    quaternion.setFromEuler(euler);
    const s = size * (0.75 + random() * 0.6);
    scale.set(s, s, s);
    matrix.compose(position, quaternion, scale);
    normal.copy(position).sub(middle).normalize().lerp(new THREE.Vector3(0, 1, 0), 0.35).normalize();
    pushCard(buffers, matrix, normal);
  }
  return toGeometry(buffers);
}

/** An olive: a short, leaning, forked trunk under a wide grey-green crown. */
function oliveParts(seed: number) {
  const random = seeded(seed);
  const height = 2.1 + random() * 0.8;
  const lobes = Array.from({ length: 4 }, (_, index) => ({
    centre: [(random() - 0.5) * 2.2, height + 0.7 + random() * 0.9, (random() - 0.5) * 2.2] as [number, number, number],
    radius: [1.5 + random() * 0.6, 1 + random() * 0.4, 1.5 + random() * 0.6] as [number, number, number],
    index,
  }));
  const crown = crownGeometry(seed + 11, lobes, 340, 0.95);
  const limbs = lobes.map((lobe) => {
    const from = new THREE.Vector3(0, height * 0.55, 0);
    const to = new THREE.Vector3(lobe.centre[0] * 0.8, lobe.centre[1] - 0.2, lobe.centre[2] * 0.8);
    const curve = new THREE.CatmullRomCurve3([from, from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 0.25, 0)), to]);
    return new THREE.TubeGeometry(curve, 6, 0.07, 6);
  });
  const bole = new THREE.CylinderGeometry(0.16, 0.26, height * 0.62, 9);
  bole.translate(0, height * 0.31, 0);
  return { crown, limbs, bole };
}

export function Olive({ seed, position, scale = 1, rotation = 0 }: { seed: number; position: [number, number, number]; scale?: number; rotation?: number }) {
  const m = useMaterials();
  const parts = useMemo(() => oliveParts(seed), [seed]);
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      <mesh geometry={parts.bole} material={m.trunk} castShadow receiveShadow />
      {parts.limbs.map((limb, index) => (
        <mesh key={index} geometry={limb} material={m.trunk} castShadow />
      ))}
      <mesh geometry={parts.crown} material={m.olive} castShadow receiveShadow />
    </group>
  );
}

/** A date palm: a slightly bowed trunk, and a crown of fronds from upright to hanging. */
function palmParts(seed: number, height: number) {
  const random = seeded(seed);
  const lean = new THREE.Vector3((random() - 0.5) * 0.9, 0, (random() - 0.5) * 0.9);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(lean.x * 0.25, height * 0.5, lean.z * 0.25), new THREE.Vector3(lean.x, height, lean.z)]);
  const trunk = new THREE.TubeGeometry(curve, 14, 0.2, 10);
  const top = new THREE.Vector3(lean.x, height, lean.z);

  const buffers = { position: [] as number[], normal: [] as number[], uv: [] as number[], index: [] as number[] };
  const fronds = 40;
  const segments = 9;
  for (let i = 0; i < fronds; i++) {
    const azimuth = (i / fronds) * Math.PI * 2 * 2.4 + random();
    // Young fronds stand up in the middle; old ones hang at the skirt.
    const age = i / fronds;
    const rise = THREE.MathUtils.lerp(1.15, -0.45, age) + (random() - 0.5) * 0.2;
    const length = 2.9 + random() * 0.9;
    const width = 1.15;
    const droop = 0.5 + age * 1.1;
    const out = new THREE.Vector3(Math.cos(azimuth), 0, Math.sin(azimuth));
    const side = new THREE.Vector3(-out.z, 0, out.x);
    const base = buffers.position.length / 3;
    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      const reach = length * t;
      const centre = top
        .clone()
        .addScaledVector(out, Math.cos(rise) * reach)
        .add(new THREE.Vector3(0, Math.sin(rise) * reach - droop * t * t * length * 0.42, 0));
      for (const edge of [-1, 1]) {
        // Leaflets fold up from the rachis in a shallow V.
        const point = centre.clone().addScaledVector(side, edge * width * 0.5).add(new THREE.Vector3(0, width * 0.16, 0));
        buffers.position.push(point.x, point.y, point.z);
        buffers.normal.push(out.x * 0.3, 0.9, out.z * 0.3);
        buffers.uv.push(t, edge < 0 ? 0 : 1);
      }
    }
    for (let s = 0; s < segments; s++) {
      const a = base + s * 2;
      buffers.index.push(a, a + 1, a + 3, a, a + 3, a + 2);
    }
  }
  return { trunk, crown: toGeometry(buffers) };
}

export function Palm({ seed, position, height = 7 }: { seed: number; position: [number, number, number]; height?: number }) {
  const m = useMaterials();
  const parts = useMemo(() => palmParts(seed, height), [seed, height]);
  return (
    <group position={position}>
      <mesh geometry={parts.trunk} material={m.palmTrunk} castShadow receiveShadow />
      <mesh geometry={parts.crown} material={m.frond} castShadow />
    </group>
  );
}

/** A low mound of shrub, for planters and the foot of walls. */
export function Shrub({ seed, position, size = [1.1, 0.55, 1.1] }: { seed: number; position: [number, number, number]; size?: [number, number, number] }) {
  const m = useMaterials();
  const geometry = useMemo(() => crownGeometry(seed, [{ centre: [0, size[1] * 0.8, 0], radius: size }], 90, 0.55), [seed, size]);
  return <mesh geometry={geometry} material={m.shrub} position={position} castShadow receiveShadow />;
}

/** Fountain grass, planted in drifts: every tuft is three crossed blades of the same texture. */
export function GrassDrift({ seed, from, to, count, spread = 0.5, height = 0.95 }: { seed: number; from: [number, number, number]; to: [number, number, number]; count: number; spread?: number; height?: number }) {
  const m = useMaterials();
  const geometry = useMemo(() => {
    const random = seeded(seed);
    const buffers = { position: [] as number[], normal: [] as number[], uv: [] as number[], index: [] as number[] };
    const matrix = new THREE.Matrix4();
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const x = THREE.MathUtils.lerp(from[0], to[0], t) + (random() - 0.5) * spread;
      const z = THREE.MathUtils.lerp(from[2], to[2], t) + (random() - 0.5) * spread;
      const h = height * (0.75 + random() * 0.5);
      const turn = random() * Math.PI;
      for (let blade = 0; blade < 3; blade++) {
        matrix.compose(new THREE.Vector3(x, from[1] + h / 2, z), new THREE.Quaternion().setFromAxisAngle(up, turn + (blade * Math.PI) / 3), new THREE.Vector3(h * 1.15, h, 1));
        pushCard(buffers, matrix, up);
      }
    }
    return toGeometry(buffers);
  }, [seed, from, to, count, spread, height]);
  return <mesh geometry={geometry} material={m.grass} castShadow receiveShadow />;
}
