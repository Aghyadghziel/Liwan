import * as THREE from 'three';

/**
 * The residence is drawn from a plan, not modelled by hand. Walls are extruded profiles with
 * their openings cut out, so a window is a real hole you can see daylight through, and the
 * reveal has thickness like built work.
 *
 * Units are metres. X runs east, Z runs south toward the pool, Y is up.
 */

export const PLAN = {
  site: 78,
  /** Outer face of the villa envelope. */
  west: -12,
  east: 12,
  north: -7,
  south: 7,
  /** Floor levels. */
  plinth: 0.18,
  ceiling: 3.75,
  slab: 0.45,
  upperCeiling: 7.65,
  wall: 0.26,
  /** Interior divisions. */
  foyerEast: -7,
  kitchenWest: 3,
  /** Landscape. */
  pool: { x0: -2.5, x1: 9.5, z0: 10.5, z1: 15.6, depth: 1.5 },
  deck: { x0: -14, x1: 14, z0: 7, z1: 19 },
} as const;

export type Opening = { x: number; y: number; w: number; h: number };

const cache = new Map<string, THREE.BufferGeometry>();

function remember<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key) as T;
}

/**
 * A wall as an extruded outline with openings punched through it. The profile is drawn in
 * the XY plane and pushed along Z, so the opening keeps the wall's full thickness as a reveal.
 */
export function wallGeometry(length: number, height: number, thickness: number, openings: Opening[] = [], key?: string) {
  const build = () => {
    const shape = new THREE.Shape();
    shape.moveTo(-length / 2, 0);
    shape.lineTo(length / 2, 0);
    shape.lineTo(length / 2, height);
    shape.lineTo(-length / 2, height);
    shape.closePath();

    for (const opening of openings) {
      const hole = new THREE.Path();
      const x0 = opening.x - opening.w / 2;
      const x1 = opening.x + opening.w / 2;
      const y0 = opening.y;
      const y1 = opening.y + opening.h;
      hole.moveTo(x0, y0);
      hole.lineTo(x0, y1);
      hole.lineTo(x1, y1);
      hole.lineTo(x1, y0);
      hole.closePath();
      shape.holes.push(hole);
    }

    const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 2 });
    geometry.translate(0, 0, -thickness / 2);
    geometry.computeVertexNormals();
    return geometry;
  };
  return key ? remember(key, build) : build();
}

/** A rectangular slab: floors, roofs, copings, treads. */
export function slab(width: number, thickness: number, depth: number, key?: string) {
  const build = () => new THREE.BoxGeometry(width, thickness, depth);
  return key ? remember(key, build) : build();
}

/**
 * The pool: a basin cut into the deck. Built as a floor, four inner walls and a coping ring,
 * so the water sits inside real edges rather than on a painted rectangle.
 */
export function poolParts() {
  const { x0, x1, z0, z1, depth } = PLAN.pool;
  const width = x1 - x0;
  const length = z1 - z0;
  const wall = 0.3;
  return {
    centre: [(x0 + x1) / 2, 0, (z0 + z1) / 2] as [number, number, number],
    width,
    length,
    depth,
    floor: remember('pool-floor', () => new THREE.BoxGeometry(width, 0.2, length)),
    sideLong: remember('pool-side-long', () => new THREE.BoxGeometry(wall, depth, length)),
    sideShort: remember('pool-side-short', () => new THREE.BoxGeometry(width + wall * 2, depth, wall)),
    water: remember('pool-water', () => new THREE.PlaneGeometry(width - 0.04, length - 0.04, 24, 24)),
    wall,
  };
}

/**
 * The terrace, cut around the pool. A plain plane would bury the water underneath it, so the
 * deck is a shape with a rectangular hole and the basin sits inside it.
 */
export function deckGeometry() {
  return remember('deck', () => {
    const { x0, x1, z0, z1 } = PLAN.deck;
    // The outline is drawn with z negated, so rotating it back by a quarter turn leaves the
    // face pointing at the sky. Drawn the other way round the deck renders inside out.
    const shape = new THREE.Shape();
    shape.moveTo(x0, -z0);
    shape.lineTo(x1, -z0);
    shape.lineTo(x1, -z1);
    shape.lineTo(x0, -z1);
    shape.closePath();
    const pool = PLAN.pool;
    const hole = new THREE.Path();
    hole.moveTo(pool.x0, -pool.z0);
    hole.lineTo(pool.x0, -pool.z1);
    hole.lineTo(pool.x1, -pool.z1);
    hole.lineTo(pool.x1, -pool.z0);
    hole.closePath();
    shape.holes.push(hole);
    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateX(-Math.PI / 2);
    // Shape UVs come through in metres, which is what the paving texture expects.
    const uv = geometry.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i), uv.getY(i));
    geometry.computeVertexNormals();
    return geometry;
  });
}

/**
 * The site itself, cut around the pool for the same reason as the deck: a plane laid over
 * the basin hides the water beneath it, however deep the basin is.
 */
export function groundGeometry() {
  return remember('ground', () => {
    const half = PLAN.site / 2;
    const shape = new THREE.Shape();
    shape.moveTo(-half, half);
    shape.lineTo(half, half);
    shape.lineTo(half, -half);
    shape.lineTo(-half, -half);
    shape.closePath();
    const pool = PLAN.pool;
    const hole = new THREE.Path();
    hole.moveTo(pool.x0, -pool.z0);
    hole.lineTo(pool.x0, -pool.z1);
    hole.lineTo(pool.x1, -pool.z1);
    hole.lineTo(pool.x1, -pool.z0);
    hole.closePath();
    shape.holes.push(hole);
    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateX(-Math.PI / 2);
    geometry.computeVertexNormals();
    return geometry;
  });
}

/** Vertical shading fins: the pattern that gives the facade its rhythm and its shadows. */
export function finLayout(from: number, to: number, spacing: number) {
  const fins: number[] = [];
  for (let x = from; x <= to + 0.001; x += spacing) fins.push(x);
  return fins;
}

/** An olive tree, grown from a seed so no two on the site are identical. */
export function oliveTree(seed: number) {
  const random = (n: number) => {
    const value = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453;
    return value - Math.floor(value);
  };
  const height = 2.6 + random(1) * 1.6;
  const clusters = Array.from({ length: 5 + Math.floor(random(2) * 3) }, (_, index) => ({
    position: [(random(index * 3) - 0.5) * 2.4, height * (0.62 + random(index * 5) * 0.5), (random(index * 7) - 0.5) * 2.4] as [number, number, number],
    scale: 0.75 + random(index * 11) * 0.75,
    rotation: random(index * 13) * Math.PI,
  }));
  return { height, clusters, lean: (random(21) - 0.5) * 0.14, twist: random(23) * Math.PI * 2 };
}

/** Shared low-poly primitives, so the site's planting costs almost nothing to draw. */
export const primitives = {
  foliage: () => remember('foliage', () => new THREE.IcosahedronGeometry(1, 1)),
  trunk: () => remember('trunk', () => new THREE.CylinderGeometry(0.1, 0.19, 1, 7)),
  hedge: () => remember('hedge', () => new THREE.BoxGeometry(1, 1, 1)),
  cylinder: () => remember('cylinder', () => new THREE.CylinderGeometry(1, 1, 1, 24)),
  plane: () => remember('plane', () => new THREE.PlaneGeometry(1, 1)),
  box: () => remember('box', () => new THREE.BoxGeometry(1, 1, 1)),
};

export function disposeGeometry() {
  for (const geometry of cache.values()) geometry.dispose();
  cache.clear();
}
