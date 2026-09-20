'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useMaterials } from './Materials';
import { deckGeometry, finLayout, groundGeometry, oliveTree, PLAN, poolParts, primitives, slab, wallGeometry } from '@/lib/villa/geometry';
import { useSpec } from '@/lib/villa/config';
import { Water } from './Water';

/**
 * The residence. Composed from the plan in lib/villa/geometry: an envelope of walls with cut
 * openings, a floating roof with deep overhangs, a glazed south face onto the terrace, and an
 * interior laid out as foyer · living · kitchen.
 */

const WIDTH = PLAN.east - PLAN.west;
const DEPTH = PLAN.south - PLAN.north;
const INSIDE_H = PLAN.ceiling - PLAN.plinth;

/* ── Envelope ─────────────────────────────────────────────── */

function Envelope() {
  const m = useMaterials();

  // North: closed to the street, opened by a band of high slots that wash the ceiling.
  const north = useMemo(
    () =>
      wallGeometry(
        WIDTH,
        INSIDE_H,
        PLAN.wall,
        [
          { x: -8, y: 2.3, w: 3.2, h: 0.75 },
          { x: -3, y: 2.3, w: 3.2, h: 0.75 },
          { x: 2, y: 2.3, w: 3.2, h: 0.75 },
          { x: 7.6, y: 0.95, w: 3.4, h: 1.35 },
        ],
        'wall-north',
      ),
    [],
  );

  // West: the entrance. A tall pivot opening under the portico, and a slot for the foyer.
  const west = useMemo(
    () =>
      wallGeometry(
        DEPTH,
        INSIDE_H,
        PLAN.wall,
        [
          { x: 1.6, y: 0, w: 1.7, h: 2.95 },
          { x: -3.4, y: 1.5, w: 0.5, h: 1.6 },
        ],
        'wall-west',
      ),
    [],
  );

  // East: closed, with one window to the kitchen behind the fin screen.
  const east = useMemo(() => wallGeometry(DEPTH, INSIDE_H, PLAN.wall, [{ x: -1.2, y: 0.9, w: 2.6, h: 1.8 }], 'wall-east'), []);

  // South: solid only where the foyer sits; the rest is glass.
  const southSolid = useMemo(() => wallGeometry(5, INSIDE_H, PLAN.wall, [{ x: 0, y: 1.1, w: 2.2, h: 1.1 }], 'wall-south-foyer'), []);

  return (
    <group>
      <mesh geometry={north} material={m.facade} position={[0, PLAN.plinth, PLAN.north]} castShadow receiveShadow />
      <mesh geometry={west} material={m.facade} position={[PLAN.west, PLAN.plinth, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow />
      <mesh geometry={east} material={m.facade} position={[PLAN.east, PLAN.plinth, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow />
      <mesh geometry={southSolid} material={m.facade} position={[PLAN.west + 2.5, PLAN.plinth, PLAN.south]} castShadow receiveShadow />
    </group>
  );
}

/* ── Slabs ────────────────────────────────────────────────── */

function Slabs() {
  const m = useMaterials();
  const overhang = 1.5;
  const roofW = WIDTH + overhang * 2;
  const roofD = DEPTH + overhang * 2;

  return (
    <group>
      {/* Plinth: the house sits on a stone table, one step above the terrace. */}
      <mesh geometry={slab(WIDTH + 1.4, PLAN.plinth, DEPTH + 1.4, 'plinth')} material={m.deck} position={[0, PLAN.plinth / 2, 0]} receiveShadow castShadow />
      {/* Interior floor. */}
      <mesh geometry={slab(WIDTH, 0.04, DEPTH, 'floor')} material={m.floor} position={[0, PLAN.plinth + 0.02, 0]} receiveShadow />
      {/* Ceiling plane, lifted off the walls by the slot windows above. */}
      <mesh geometry={slab(WIDTH, 0.04, DEPTH, 'ceiling')} material={m.ceiling} position={[0, PLAN.ceiling - 0.02, 0]} receiveShadow />
      {/* A dark reveal under the roof: on site this shadow gap is what makes a slab float. */}
      <mesh geometry={slab(WIDTH - 0.35, 0.06, DEPTH - 0.35, 'reveal')} material={m.dark} position={[0, PLAN.ceiling - 0.05, 0]} />
      {/* Roof: a thin plane with deep eaves. */}
      <mesh geometry={slab(roofW, PLAN.slab, roofD, 'roof')} material={m.concrete} position={[0, PLAN.ceiling + PLAN.slab / 2, 0]} castShadow receiveShadow />
      {/* Soffit, so the underside of the eaves reads as a finished surface. */}
      <mesh geometry={slab(roofW - 0.06, 0.03, roofD - 0.06, 'soffit')} material={m.soffit} position={[0, PLAN.ceiling - 0.01, 0]} receiveShadow />

      {/* Upper volume over the kitchen: the cantilever that gives the house its silhouette. */}
      <group position={[7, 0, -2.75]}>
        <mesh geometry={slab(10, INSIDE_H, 8.5, 'upper-walls')} material={m.facade} position={[0, PLAN.ceiling + PLAN.slab + INSIDE_H / 2, 0]} castShadow receiveShadow />
        <mesh geometry={slab(10.8, PLAN.slab, 9.3, 'upper-roof')} material={m.concrete} position={[0, PLAN.upperCeiling + PLAN.slab / 2, 0]} castShadow receiveShadow />
        {/* A window band on the south face, so the upper floor is not a blind box. */}
        <mesh geometry={slab(6.4, 1.9, 0.08, 'upper-glass')} material={m.glass} position={[-0.6, PLAN.ceiling + PLAN.slab + 1.75, 4.27]} />
        <mesh geometry={slab(6.6, 0.09, 0.16, 'upper-head')} material={m.frame} position={[-0.6, PLAN.ceiling + PLAN.slab + 2.74, 4.3]} castShadow />
        <mesh geometry={slab(6.6, 0.09, 0.16, 'upper-sill')} material={m.frame} position={[-0.6, PLAN.ceiling + PLAN.slab + 0.76, 4.3]} castShadow />
        {[-3.4, -1.7, 0, 1.7].map((x) => (
          <mesh key={x} geometry={slab(0.07, 1.9, 0.16, 'upper-mullion')} material={m.frame} position={[x - 0.6, PLAN.ceiling + PLAN.slab + 1.75, 4.3]} castShadow />
        ))}
      </group>
    </group>
  );
}

/* ── Glazing ──────────────────────────────────────────────── */

/** A run of glass in slim frames. Mullions are real posts, so reflections break as they do on site. */
function Glazing({ from, to, z, x, axis = 'x', height = INSIDE_H, base = PLAN.plinth, panel = 2.4 }: { from: number; to: number; z?: number; x?: number; axis?: 'x' | 'z'; height?: number; base?: number; panel?: number }) {
  const m = useMaterials();
  const length = to - from;
  const count = Math.max(1, Math.round(length / panel));
  const step = length / count;
  const mullion = useMemo(() => new THREE.BoxGeometry(0.07, height, 0.12), [height]);
  const glass = useMemo(() => new THREE.PlaneGeometry(step - 0.07, height - 0.1), [step, height]);
  const head = useMemo(() => new THREE.BoxGeometry(length, 0.1, 0.14), [length]);

  const place = (value: number): [number, number, number] => (axis === 'x' ? [value, 0, z ?? 0] : [x ?? 0, 0, value]);
  const rotation: [number, number, number] = axis === 'x' ? [0, 0, 0] : [0, Math.PI / 2, 0];

  return (
    <group>
      {Array.from({ length: count }, (_, index) => {
        const centre = from + step * (index + 0.5);
        const [px, , pz] = place(centre);
        return <mesh key={`g${index}`} geometry={glass} material={m.glass} position={[px, base + height / 2, pz]} rotation={rotation} />;
      })}
      {Array.from({ length: count + 1 }, (_, index) => {
        const centre = from + step * index;
        const [px, , pz] = place(centre);
        return <mesh key={`m${index}`} geometry={mullion} material={m.frame} position={[px, base + height / 2, pz]} rotation={rotation} castShadow />;
      })}
      {[base + 0.02, base + height - 0.02].map((y, index) => {
        const [px, , pz] = place(from + length / 2);
        return <mesh key={`h${index}`} geometry={head} material={m.frame} position={[px, y, pz]} rotation={rotation} castShadow />;
      })}
    </group>
  );
}

/** Vertical fins: shade the east glass and stripe the light across the floor through the day. */
function Fins() {
  const m = useMaterials();
  const geometry = useMemo(() => new THREE.BoxGeometry(0.12, INSIDE_H + 0.3, 0.42), []);
  const east = finLayout(PLAN.north + 1.2, PLAN.south - 1.2, 0.62);
  return (
    <group>
      {east.map((z, index) => (
        <mesh key={index} geometry={geometry} material={m.frame} position={[PLAN.east + 0.55, PLAN.plinth + (INSIDE_H + 0.3) / 2, z]} rotation={[0, Math.PI / 2, 0]} castShadow />
      ))}
    </group>
  );
}

/** The portico: a deep shaded threshold, the liwan the studio is named after. */
function Portico() {
  const m = useMaterials();
  const columns = [-4.4, 1.6];
  return (
    <group>
      {/* The roof runs on from the main slab rather than sitting under it. */}
      <mesh geometry={slab(4.6, PLAN.slab, 9.5, 'portico-roof')} material={m.concrete} position={[PLAN.west - 2.3, PLAN.ceiling + PLAN.slab / 2, -1.2]} castShadow receiveShadow />
      <mesh geometry={slab(4.5, 0.03, 9.4, 'portico-soffit')} material={m.soffit} position={[PLAN.west - 2.3, PLAN.ceiling - 0.015, -1.2]} receiveShadow />
      <mesh geometry={slab(4.6, 0.12, 9.5, 'portico-floor')} material={m.deck} position={[PLAN.west - 2.3, PLAN.plinth - 0.06, -1.2]} receiveShadow />
      {columns.map((z, index) => (
        <mesh key={index} geometry={slab(0.34, PLAN.ceiling - PLAN.plinth, 0.34, 'portico-column')} material={m.facade} position={[PLAN.west - 4.4, PLAN.plinth + (PLAN.ceiling - PLAN.plinth) / 2, z]} castShadow receiveShadow />
      ))}
      {/* Entrance door, set into the opening in the west wall. */}
      <mesh geometry={slab(0.08, 2.9, 1.6, 'door')} material={m.timber} position={[PLAN.west - 0.02, PLAN.plinth + 1.45, 1.6]} castShadow />
      <mesh geometry={slab(0.04, 1.1, 0.04, 'handle')} material={m.metal} position={[PLAN.west - 0.1, PLAN.plinth + 1.6, 2.2]} castShadow />
      {/* A bench along the wall, and a strip of water that cools the threshold. */}
      <mesh geometry={slab(1.1, 0.12, 3.2, 'bench')} material={m.deck} position={[PLAN.west - 1.6, PLAN.plinth + 0.42, -3.6]} castShadow receiveShadow />
      <mesh geometry={slab(1.6, 0.06, 7.5, 'rill')} material={m.water} position={[PLAN.west - 4.9, PLAN.plinth - 0.08, -1.2]} receiveShadow />
    </group>
  );
}

/* ── Interior ─────────────────────────────────────────────── */

function Partitions() {
  const m = useMaterials();
  const foyer = useMemo(() => wallGeometry(8, INSIDE_H, 0.18, [], 'part-foyer'), []);
  const kitchen = useMemo(() => wallGeometry(6, INSIDE_H, 0.18, [], 'part-kitchen'), []);
  return (
    <group>
      <mesh geometry={foyer} material={m.wall} position={[PLAN.foyerEast, PLAN.plinth, PLAN.north + 4]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow />
      <mesh geometry={kitchen} material={m.wall} position={[PLAN.kitchenWest, PLAN.plinth, PLAN.north + 3]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow />
      {/* Interior face of the north wall, so the living room reads as plaster, not stone. */}
      <mesh geometry={slab(WIDTH - 0.5, INSIDE_H, 0.06, 'north-lining')} material={m.wall} position={[0, PLAN.plinth + INSIDE_H / 2, PLAN.north + 0.16]} receiveShadow />
    </group>
  );
}

function Living() {
  const m = useMaterials();
  const box = primitives.box();
  const cyl = primitives.cylinder();

  return (
    <group position={[-2.6, PLAN.plinth, 2.4]}>
      {/* Rug grounds the seating group. */}
      <mesh geometry={primitives.plane()} material={m.rug} position={[0, 0.005, 0.2]} rotation={[-Math.PI / 2, 0, 0]} scale={[6.4, 4.6, 1]} receiveShadow />

      {/* One large canvas on the plaster, hung low the way galleries hang. */}
      <group position={[-0.6, 0, -4.15]}>
        <mesh geometry={box} material={m.metal} position={[0, 1.95, 0]} scale={[2.6, 1.7, 0.04]} castShadow />
        <mesh geometry={box} material={m.rug} position={[0, 1.95, 0.03]} scale={[2.46, 1.56, 0.02]} />
        <mesh geometry={box} material={m.dark} position={[-0.35, 1.8, 0.045]} scale={[1.1, 0.9, 0.01]} />
      </group>

      {/* Sofa: a long bench and a return, the way a room this wide is actually furnished. */}
      <group position={[0, 0, -1.1]}>
        <mesh geometry={box} material={m.sofa} position={[0, 0.34, 0]} scale={[4.2, 0.44, 1.05]} castShadow receiveShadow />
        <mesh geometry={box} material={m.sofa} position={[0, 0.72, -0.42]} scale={[4.2, 0.62, 0.22]} castShadow />
        {[-1.4, 0, 1.4].map((x) => (
          <mesh key={x} geometry={box} material={m.sofa} position={[x, 0.64, 0.06]} scale={[1.28, 0.16, 0.92]} castShadow />
        ))}
        {[-2.05, 2.05].map((x) => (
          <mesh key={x} geometry={box} material={m.sofa} position={[x, 0.52, 0]} scale={[0.22, 0.8, 1.05]} castShadow />
        ))}
        <mesh geometry={box} material={m.dark} position={[0, 0.08, 0]} scale={[4, 0.16, 0.9]} />
      </group>

      {/* Return seat, facing the glass. */}
      <group position={[2.35, 0, 1.15]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh geometry={box} material={m.sofa} position={[0, 0.34, 0]} scale={[2.2, 0.44, 1.05]} castShadow receiveShadow />
        <mesh geometry={box} material={m.sofa} position={[0, 0.72, -0.42]} scale={[2.2, 0.62, 0.22]} castShadow />
        <mesh geometry={box} material={m.dark} position={[0, 0.08, 0]} scale={[2, 0.16, 0.9]} />
      </group>

      {/* Coffee table in stone, with a timber tray. */}
      <mesh geometry={box} material={m.counter} position={[0, 0.34, 0.75]} scale={[1.9, 0.08, 0.9]} castShadow receiveShadow />
      {[-0.75, 0.75].map((x) => (
        <mesh key={x} geometry={box} material={m.counter} position={[x, 0.16, 0.75]} scale={[0.12, 0.32, 0.8]} castShadow />
      ))}
      <mesh geometry={box} material={m.timber} position={[0.3, 0.4, 0.75]} scale={[0.5, 0.04, 0.34]} castShadow />

      {/* Floor lamp: a thin stem and a warm shade. */}
      <group position={[-2.9, 0, -0.4]}>
        <mesh geometry={cyl} material={m.metal} position={[0, 0.02, 0]} scale={[0.16, 0.04, 0.16]} castShadow />
        <mesh geometry={cyl} material={m.metal} position={[0, 0.85, 0]} scale={[0.018, 1.7, 0.018]} castShadow />
        <mesh geometry={cyl} material={m.ceiling} position={[0, 1.76, 0]} scale={[0.17, 0.22, 0.17]} castShadow />
      </group>

      {/* A tall plant in a stone pot: the one soft silhouette in the room. */}
      <group position={[3.6, 0, -1.6]}>
        <mesh geometry={cyl} material={m.counter} position={[0, 0.28, 0]} scale={[0.32, 0.56, 0.32]} castShadow receiveShadow />
        {[0.95, 1.4, 1.75].map((y, index) => (
          <mesh
            key={y}
            geometry={primitives.foliage()}
            material={m.foliage}
            position={[index % 2 ? 0.16 : -0.14, y, index % 2 ? -0.12 : 0.1]}
            scale={[0.44 - index * 0.06, 0.3, 0.44 - index * 0.06]}
            castShadow
          />
        ))}
      </group>

      {/* Sideboard against the partition, with two objects on top. */}
      <group position={[-3.9, 0, -3.4]}>
        <mesh geometry={box} material={m.cabinet} position={[0, 0.42, 0]} scale={[2.6, 0.72, 0.48]} castShadow receiveShadow />
        <mesh geometry={cyl} material={m.counter} position={[-0.7, 0.92, 0]} scale={[0.11, 0.28, 0.11]} castShadow />
        <mesh geometry={box} material={m.timber} position={[0.5, 0.84, 0]} scale={[0.36, 0.12, 0.28]} castShadow />
      </group>
    </group>
  );
}

function Dining() {
  const m = useMaterials();
  const box = primitives.box();
  const cyl = primitives.cylinder();
  const chairs = [-1, 0, 1];

  return (
    <group position={[1.1, PLAN.plinth, -2.2]}>
      <mesh geometry={box} material={m.timber} position={[0, 0.74, 0]} scale={[2.7, 0.06, 1.1]} castShadow receiveShadow />
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} geometry={box} material={m.timber} position={[x, 0.37, 0]} scale={[0.1, 0.74, 0.9]} castShadow />
      ))}
      {chairs.map((index) =>
        [-0.78, 0.78].map((z) => (
          <group key={`${index}${z}`} position={[index * 0.85, 0, z]} rotation={[0, z > 0 ? Math.PI : 0, 0]}>
            <mesh geometry={box} material={m.sofa} position={[0, 0.45, 0]} scale={[0.48, 0.06, 0.46]} castShadow />
            <mesh geometry={box} material={m.sofa} position={[0, 0.7, -0.2]} scale={[0.48, 0.5, 0.05]} castShadow />
            {[-0.2, 0.2].map((cx) =>
              [-0.18, 0.18].map((cz) => <mesh key={`${cx}${cz}`} geometry={cyl} material={m.metal} position={[cx, 0.22, cz]} scale={[0.016, 0.45, 0.016]} />),
            )}
          </group>
        )),
      )}
      {/* Pendant line over the table. */}
      {[-0.8, 0, 0.8].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh geometry={cyl} material={m.metal} position={[0, 2.5, 0]} scale={[0.006, 1.2, 0.006]} />
          <mesh geometry={cyl} material={m.metal} position={[0, 1.86, 0]} scale={[0.09, 0.14, 0.09]} castShadow />
        </group>
      ))}
    </group>
  );
}

function Kitchen() {
  const m = useMaterials();
  const box = primitives.box();
  const cyl = primitives.cylinder();

  return (
    <group position={[7.4, PLAN.plinth, -1.2]}>
      {/* Island: stone top with a thin shadow gap over the cabinet body. */}
      <group position={[0, 0, 1.9]}>
        <mesh geometry={box} material={m.cabinet} position={[0, 0.44, 0]} scale={[3.6, 0.82, 1.1]} castShadow receiveShadow />
        <mesh geometry={box} material={m.counter} position={[0, 0.91, 0]} scale={[3.8, 0.06, 1.24]} castShadow receiveShadow />
        <mesh geometry={box} material={m.dark} position={[0, 0.04, 0]} scale={[3.4, 0.08, 1]} />
        <mesh geometry={cyl} material={m.metal} position={[-1.1, 1.06, -0.2]} scale={[0.022, 0.24, 0.022]} castShadow />
        <mesh geometry={box} material={m.metal} position={[-1.1, 1.17, -0.06]} scale={[0.03, 0.03, 0.3]} castShadow />
        <mesh geometry={box} material={m.dark} position={[-1.1, 0.945, 0.05]} scale={[0.7, 0.02, 0.44]} />
        {[-1.1, 0, 1.1].map((x) => (
          <group key={x} position={[x, 0, 0.95]}>
            <mesh geometry={cyl} material={m.timber} position={[0, 0.66, 0]} scale={[0.17, 0.05, 0.17]} castShadow />
            {[0, 1, 2, 3].map((leg) => {
              const angle = (leg / 4) * Math.PI * 2 + Math.PI / 4;
              return <mesh key={leg} geometry={cyl} material={m.metal} position={[Math.cos(angle) * 0.13, 0.33, Math.sin(angle) * 0.13]} scale={[0.012, 0.66, 0.012]} />;
            })}
          </group>
        ))}
      </group>

      {/* Run along the north wall: base units, worktop, splashback and tall cupboards. */}
      <group position={[0, 0, -4.2]}>
        <mesh geometry={box} material={m.cabinet} position={[0, 0.44, 0]} scale={[7, 0.82, 0.64]} castShadow receiveShadow />
        <mesh geometry={box} material={m.counter} position={[0, 0.88, 0.02]} scale={[7.1, 0.05, 0.68]} castShadow receiveShadow />
        <mesh geometry={box} material={m.counter} position={[0, 1.22, -0.28]} scale={[7.1, 0.62, 0.04]} receiveShadow />
        <mesh geometry={box} material={m.cabinet} position={[2.6, 1.45, -0.02]} scale={[1.8, 2.9, 0.68]} castShadow receiveShadow />
        <mesh geometry={box} material={m.timber} position={[-1.6, 1.75, -0.12]} scale={[3.2, 0.05, 0.3]} castShadow />
        {[-2.6, -1.4, -0.2, 1].map((x) => (
          <mesh key={x} geometry={box} material={m.metal} position={[x, 0.7, 0.34]} scale={[0.7, 0.012, 0.02]} />
        ))}
      </group>
    </group>
  );
}

/** An open stair to the upper floor: treads cantilevered off a single blade wall. */
function Stair() {
  const m = useMaterials();
  const treads = 12;
  return (
    <group position={[2.2, PLAN.plinth, -5.1]}>
      <mesh geometry={slab(0.16, PLAN.ceiling - PLAN.plinth, 3.4, 'stair-blade')} material={m.wall} position={[-0.9, (PLAN.ceiling - PLAN.plinth) / 2, 0]} castShadow receiveShadow />
      {Array.from({ length: treads }, (_, index) => (
        <mesh key={index} geometry={slab(1.5, 0.08, 0.3, 'tread')} material={m.timber} position={[-0.1, 0.28 + index * 0.28, 1.35 - index * 0.25]} castShadow receiveShadow />
      ))}
    </group>
  );
}

/* ── Landscape ────────────────────────────────────────────── */

function Pool() {
  const m = useMaterials();
  const parts = poolParts();
  const [cx, , cz] = parts.centre;

  return (
    <group position={[cx, 0, cz]}>
      <mesh geometry={parts.floor} material={m.poolBed} position={[0, -parts.depth, 0]} receiveShadow />
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={parts.sideLong} material={m.poolBed} position={[(side * (parts.width + parts.wall)) / 2, -parts.depth / 2, 0]} receiveShadow />
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={parts.sideShort} material={m.poolBed} position={[0, -parts.depth / 2, (side * (parts.length + parts.wall)) / 2]} receiveShadow />
      ))}

      {/* Coping: a stone lip that oversails the basin, so the edge takes a hard line of light. */}
      {[-1, 1].map((side) => (
        <mesh key={`c${side}`} geometry={slab(0.6, 0.09, parts.length + 1.2, 'coping-long')} material={m.deck} position={[(side * (parts.width + 0.6)) / 2, 0.045, 0]} castShadow receiveShadow />
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`s${side}`} geometry={slab(parts.width + 1.2, 0.09, 0.6, 'coping-short')} material={m.deck} position={[0, 0.045, (side * (parts.length + 0.6)) / 2]} castShadow receiveShadow />
      ))}
      {/* Submerged steps at the shallow end. */}
      {[0, 1, 2].map((index) => (
        <mesh key={index} geometry={slab(3.2, 0.38, 0.5, 'pool-step')} material={m.poolBed} position={[-parts.width / 2 + 2.2, -0.19 - index * 0.38, parts.length / 2 - 0.45 - index * 0.5]} receiveShadow />
      ))}
    </group>
  );
}

function Landscape() {
  const m = useMaterials();
  const box = primitives.box();

  // Planting is kept to the edges: nothing stands between the camera and the house.
  const trees = useMemo(
    () =>
      [
        [-20, -15],
        [-19, 18],
        [17.5, 8],
        [19, -3],
        [-13, 24],
        [14, 24.5],
        [-21, -8],
        [21, 18],
      ].map(([x, z], index) => ({ x, z, tree: oliveTree(index + 1) })),
    [],
  );
  // A line of cypress along the west boundary gives the site a vertical rhythm.
  const cypress = useMemo(() => [-10, -4, 2, 20, 26].map((z, index) => ({ z, height: 6.2 + ((index * 37) % 11) * 0.22 })), []);

  return (
    <group>
      {/* Ground: a wide gravel field, so the house sits in a landscape rather than on a page. */}
      <mesh geometry={groundGeometry()} material={m.gravel} position={[0, -0.02, 0]} receiveShadow />
      {/* Terrace deck, cut around the pool so the water reads as a basin in the stone. */}
      <mesh geometry={deckGeometry()} material={m.deck} receiveShadow />
      {/* Lawn beyond the pool. */}
      <mesh geometry={primitives.plane()} material={m.lawn} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 27]} scale={[38, 14, 1]} receiveShadow />

      {/* Three steps from the terrace up to the plinth. */}
      {[0, 1, 2].map((index) => (
        <mesh key={index} geometry={slab(9, 0.15, 0.42, 'step')} material={m.deck} position={[-1, 0.075 + index * 0.15, PLAN.south + 1.5 - index * 0.42]} receiveShadow castShadow />
      ))}

      {/* Low planters edging the terrace. */}
      {[
        [-11.5, 10.5, 3.2],
        [12.5, 10.5, 3.2],
        [-11.5, 16, 2.4],
      ].map(([x, z, d], index) => (
        <group key={index} position={[x, 0, z]}>
          <mesh geometry={box} material={m.deck} position={[0, 0.28, 0]} scale={[1.5, 0.56, d]} castShadow receiveShadow />
          <mesh geometry={box} material={m.foliage} position={[0, 0.66, 0]} scale={[1.3, 0.3, d - 0.2]} castShadow />
        </group>
      ))}

      {trees.map(({ x, z, tree }, index) => (
        <group key={index} position={[x, 0, z]} rotation={[0, tree.twist, tree.lean]}>
          <mesh geometry={primitives.trunk()} material={m.trunk} position={[0, tree.height / 2, 0]} scale={[1, tree.height, 1]} castShadow />
          {tree.clusters.map((cluster, clusterIndex) => (
            <mesh
              key={clusterIndex}
              geometry={primitives.foliage()}
              material={m.foliage}
              position={cluster.position}
              rotation={[cluster.rotation, cluster.rotation * 1.3, 0]}
              scale={[cluster.scale * 0.82, cluster.scale * 0.5, cluster.scale * 0.82]}
              castShadow
            />
          ))}
        </group>
      ))}

      {cypress.map(({ z, height }, index) => (
        <group key={index} position={[-31, 0, z]}>
          <mesh geometry={primitives.trunk()} material={m.trunk} position={[0, height / 2, 0]} scale={[0.6, height, 0.6]} castShadow />
          {[0.3, 0.52, 0.74].map((level, levelIndex) => (
            <mesh
              key={level}
              geometry={primitives.foliage()}
              material={m.foliage}
              position={[0, height * level + 0.7, 0]}
              scale={[1.15 - levelIndex * 0.28, height * 0.28, 1.15 - levelIndex * 0.28]}
              castShadow
            />
          ))}
        </group>
      ))}

      {/* Terrace furniture: two loungers by the water, a table under the eaves. */}
      {[-1.4, 1.6].map((offset, index) => (
        <group key={index} position={[-6.6, 0, 11.6 + offset * 1.9]} rotation={[0, Math.PI / 2, 0]}>
          <mesh geometry={box} material={m.deck} position={[0, 0.3, 0]} scale={[1.98, 0.1, 0.72]} castShadow receiveShadow />
          {[-0.85, 0.85].map((x) => (
            <mesh key={x} geometry={box} material={m.timber} position={[x, 0.15, 0]} scale={[0.08, 0.3, 0.66]} castShadow />
          ))}
          <mesh geometry={box} material={m.sofa} position={[0, 0.39, 0]} scale={[1.9, 0.09, 0.66]} castShadow />
          <mesh geometry={box} material={m.sofa} position={[-0.66, 0.6, 0]} rotation={[0, 0, 0.5]} scale={[0.66, 0.09, 0.62]} castShadow />
        </group>
      ))}
      <group position={[8.8, 0, 9.2]}>
        <mesh geometry={box} material={m.timber} position={[0, 0.72, 0]} scale={[2.1, 0.06, 0.95]} castShadow receiveShadow />
        {[-0.9, 0.9].map((x) => (
          <mesh key={x} geometry={box} material={m.metal} position={[x, 0.36, 0]} scale={[0.06, 0.72, 0.8]} castShadow />
        ))}
        {[-0.6, 0.6].map((x) =>
          [-0.75, 0.75].map((z) => (
            <group key={`${x}${z}`} position={[x, 0, z]} rotation={[0, z > 0 ? Math.PI : 0, 0]}>
              <mesh geometry={box} material={m.deck} position={[0, 0.44, 0]} scale={[0.46, 0.05, 0.44]} castShadow />
              <mesh geometry={box} material={m.deck} position={[0, 0.67, -0.19]} scale={[0.46, 0.44, 0.05]} castShadow />
            </group>
          )),
        )}
      </group>
    </group>
  );
}

/* ── Interior light ───────────────────────────────────────── */

/** Lamps inside the house, so the interior is lit even when the camera is outside. */
function InteriorLight() {
  const spec = useSpec();
  const colour = spec.light === 'warm' ? '#ffd9b4' : '#eef2f5';
  const intensity = spec.light === 'warm' ? 5.5 : 5;
  return (
    <group>
      {/* Lamps the eye can place. */}
      <pointLight position={[-2.6, 2.5, 1.5]} color={colour} intensity={intensity} distance={17} decay={2} />
      <pointLight position={[7.4, 2.4, -1.2]} color={colour} intensity={intensity * 0.85} distance={15} decay={2} />
      <pointLight position={[-9, 2.4, -1]} color={colour} intensity={intensity * 0.5} distance={10} decay={2} />
      {/* Daylight arriving through the south glass, as a wide soft panel rather than a bulb.
          This is what a deep plan actually gets, and it is what stops the inside going muddy. */}
      <rectAreaLight position={[2, 2, PLAN.south - 0.35]} rotation={[0, Math.PI, 0]} width={17} height={3} intensity={4.2} color="#e8eef6" />
      <rectAreaLight position={[-9.4, 2, 1.6]} rotation={[0, Math.PI / 2, 0]} width={3} height={2.6} intensity={2.2} color="#eaf0f7" />
      {/* A little bounce off the floor, back onto the soffit. */}
      <pointLight position={[0, 3.35, 1]} color="#e6e9ef" intensity={7} distance={22} decay={2} />
    </group>
  );
}

/* ── The residence ────────────────────────────────────────── */

export function Villa({ detail = 'high' }: { detail?: 'high' | 'low' }) {
  return (
    <group>
      <Landscape />
      <Pool />
      <Water />
      <Slabs />
      <Envelope />
      <Portico />
      <Partitions />
      {/* South face: glass from the living room to the kitchen. */}
      <Glazing from={PLAN.foyerEast} to={PLAN.east} z={PLAN.south} />
      <Fins />
      <Living />
      <Dining />
      <Kitchen />
      {detail === 'high' && <Stair />}
      <InteriorLight />
    </group>
  );
}
