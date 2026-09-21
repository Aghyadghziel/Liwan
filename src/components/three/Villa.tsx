'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Batch } from './Batch';
import { useMaterials } from './Materials';
import { GrassDrift, Olive, Palm, Shrub } from './Planting';
import { deckGeometry, finLayout, groundGeometry, mbox, mcyl, mplane, PLAN, poolParts, slab, wallGeometry } from '@/lib/villa/geometry';
import { useSpec } from '@/lib/villa/config';
import { Water } from './Water';

/**
 * The residence. Composed from the plan in lib/villa/geometry: an envelope of walls with cut
 * openings, a floating roof with deep overhangs, a glazed south face onto the terrace, and an
 * interior laid out as foyer · living · kitchen.
 *
 * What separates this from a massing model is the second layer: parapets and copings, frames
 * in every opening, door boards, cabinet fronts with their gaps, cushions with soft edges,
 * curtains, downlights, a boundary wall. None of it is noticed; all of it is missed.
 */

const WIDTH = PLAN.east - PLAN.west;
const DEPTH = PLAN.south - PLAN.north;
const INSIDE_H = PLAN.ceiling - PLAN.plinth;
const ROOF_TOP = PLAN.ceiling + PLAN.slab;

type V3 = [number, number, number];
type Axis = 'x' | 'y' | 'z';

/** A box in metres: size, position, material. Almost everything built is one of these. */
function B({ s, p, r, m, grain, radius, cast = true, receive = true }: { s: V3; p: V3; r?: V3; m: THREE.Material; grain?: Axis; radius?: number; cast?: boolean; receive?: boolean }) {
  return <mesh geometry={mbox(s[0], s[1], s[2], { grain, radius })} material={m} position={p} rotation={r} castShadow={cast} receiveShadow={receive} />;
}

/** A cylinder in metres, standing on its foot at `p`. */
function C({ rt, rb, h, p, m, r, cast = true }: { rt: number; rb?: number; h: number; p: V3; m: THREE.Material; r?: V3; cast?: boolean }) {
  return <mesh geometry={mcyl(rt, rb ?? rt, h)} material={m} position={[p[0], p[1] + h / 2, p[2]]} rotation={r} castShadow={cast} receiveShadow />;
}

/* ── Envelope ─────────────────────────────────────────────── */

const NORTH_OPENINGS = [
  { x: -8, y: 2.3, w: 3.2, h: 0.75 },
  { x: -3, y: 2.3, w: 3.2, h: 0.75 },
  { x: 2, y: 2.3, w: 3.2, h: 0.75 },
  { x: 7.6, y: 0.95, w: 3.4, h: 1.35 },
];
// The west and east walls are turned a quarter, so their local x runs toward world -z.
const WEST_OPENINGS = [
  { x: -1.6, y: 0, w: 1.7, h: 2.95 },
  { x: -3.4, y: 1.5, w: 0.5, h: 1.6 },
];
const EAST_OPENINGS = [{ x: -1.2, y: 0.9, w: 2.6, h: 1.8 }];
const FOYER_OPENINGS = [{ x: 0, y: 1.1, w: 2.2, h: 1.1 }];

/** A fixed light set into a wall opening: a slim frame at the outer third of the reveal, and glass. */
function Light({ w, h, p, r, frosted = false }: { w: number; h: number; p: V3; r?: V3; frosted?: boolean }) {
  const m = useMaterials();
  const f = 0.045;
  return (
    <group position={p} rotation={r}>
      <B s={[w, f, 0.07]} p={[0, h / 2 - f / 2, 0]} m={m.frame} />
      <B s={[w, f, 0.07]} p={[0, -h / 2 + f / 2, 0]} m={m.frame} />
      <B s={[f, h, 0.07]} p={[-w / 2 + f / 2, 0, 0]} m={m.frame} />
      <B s={[f, h, 0.07]} p={[w / 2 - f / 2, 0, 0]} m={m.frame} />
      <mesh material={frosted ? m.frosted : m.glass} position={[0, 0, 0]}>
        <planeGeometry args={[w - f * 2, h - f * 2]} />
      </mesh>
      {/* A stone sill, thrown a finger past the wall face. */}
      <B s={[w + 0.06, 0.03, 0.2]} p={[0, -h / 2 - 0.015, 0.06]} m={m.deck} />
    </group>
  );
}

function Envelope() {
  const m = useMaterials();
  const north = useMemo(() => wallGeometry(WIDTH, INSIDE_H, PLAN.wall, NORTH_OPENINGS, 'wall-north'), []);
  const west = useMemo(() => wallGeometry(DEPTH, INSIDE_H, PLAN.wall, WEST_OPENINGS, 'wall-west'), []);
  const east = useMemo(() => wallGeometry(DEPTH, INSIDE_H, PLAN.wall, EAST_OPENINGS, 'wall-east'), []);
  const southSolid = useMemo(() => wallGeometry(5, INSIDE_H, PLAN.wall, FOYER_OPENINGS, 'wall-south-foyer'), []);

  return (
    <group>
      <mesh geometry={north} material={m.facade} position={[0, PLAN.plinth, PLAN.north]} castShadow receiveShadow />
      <mesh geometry={west} material={m.facade} position={[PLAN.west, PLAN.plinth, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow />
      <mesh geometry={east} material={m.facade} position={[PLAN.east, PLAN.plinth, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow />
      <mesh geometry={southSolid} material={m.facade} position={[PLAN.west + 2.5, PLAN.plinth, PLAN.south]} castShadow receiveShadow />

      {/* Glass in every opening. North faces the street: its lights sit toward the outside. */}
      {NORTH_OPENINGS.map((o) => (
        <Light key={o.x} w={o.w} h={o.h} p={[o.x, PLAN.plinth + o.y + o.h / 2, PLAN.north - 0.05]} r={[0, Math.PI, 0]} frosted />
      ))}
      <Light w={0.5} h={1.6} p={[PLAN.west - 0.05, PLAN.plinth + 1.5 + 0.8, 3.4]} r={[0, -Math.PI / 2, 0]} frosted />
      <Light w={2.6} h={1.8} p={[PLAN.east + 0.05, PLAN.plinth + 0.9 + 0.9, 1.2]} r={[0, Math.PI / 2, 0]} />
      <Light w={2.2} h={1.1} p={[PLAN.west + 2.5, PLAN.plinth + 1.1 + 0.55, PLAN.south + 0.05]} />

      {/* A recessed plinth course: the wall stops 120 mm short of the ground, in shadow. */}
      <B s={[WIDTH - 0.04, 0.12, DEPTH - 0.04]} p={[0, PLAN.plinth - 0.06, 0]} m={m.dark} cast={false} />
    </group>
  );
}

/* ── Slabs and roof ───────────────────────────────────────── */

/** A flat roof as built: slab, an upstand around the edge, a metal coping, and ballast inside. */
function FlatRoof({ w, d, p, plant = false }: { w: number; d: number; p: V3; plant?: boolean }) {
  const m = useMaterials();
  const up = 0.22;
  const t = 0.18;
  return (
    <group position={p}>
      <B s={[w, PLAN.slab, d]} p={[0, PLAN.slab / 2, 0]} m={m.concrete} radius={0.012} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <B s={[w, up, t]} p={[0, PLAN.slab + up / 2, (side * (d - t)) / 2]} m={m.concrete} />
          <B s={[w + 0.04, 0.025, t + 0.06]} p={[0, PLAN.slab + up + 0.012, (side * (d - t)) / 2]} m={m.frame} />
          <B s={[t, up, d - t * 2]} p={[(side * (w - t)) / 2, PLAN.slab + up / 2, 0]} m={m.concrete} />
          <B s={[t + 0.06, 0.025, d + 0.04]} p={[(side * (w - t)) / 2, PLAN.slab + up + 0.012, 0]} m={m.frame} />
        </group>
      ))}
      <mesh geometry={mplane(w - t * 2, d - t * 2)} material={m.roofTop} position={[0, PLAN.slab + 0.04, 0]} receiveShadow />
      {/* Plant, where plant goes: behind a louvred screen, off the street side. */}
      {plant && (
        <group position={[w / 2 - 2.6, PLAN.slab + 0.04, -d / 2 + 2]}>
          {[-0.75, 0.75].map((x) => (
            <B key={x} s={[1.1, 0.9, 0.5]} p={[x, 0.5, 0]} m={m.frame} />
          ))}
          {Array.from({ length: 9 }, (_, index) => (
            <B key={index} s={[3.4, 0.07, 0.02]} p={[0, 0.16 + index * 0.13, 0.7]} r={[0.5, 0, 0]} m={m.frame} />
          ))}
        </group>
      )}
    </group>
  );
}

function Slabs() {
  const m = useMaterials();
  const overhang = 1.5;
  const roofW = WIDTH + overhang * 2;
  const roofD = DEPTH + overhang * 2;
  const upperBase = ROOF_TOP;
  const upperSouth = useMemo(() => wallGeometry(10, INSIDE_H, 0.3, [{ x: -0.6, y: 0.8, w: 6.4, h: 1.9 }], 'upper-south'), []);

  return (
    <group>
      {/* Plinth: the house sits on a stone table, one step above the terrace. */}
      <mesh geometry={slab(WIDTH + 1.4, PLAN.plinth, DEPTH + 1.4)} material={m.deck} position={[0, PLAN.plinth / 2, 0]} receiveShadow castShadow />
      {/* Interior floor. */}
      <mesh geometry={mplane(WIDTH - PLAN.wall, DEPTH - PLAN.wall)} material={m.floor} position={[0, PLAN.plinth + 0.004, 0]} receiveShadow />
      {/* Ceiling, and the dark shadow gap that lifts it off the walls. */}
      <B s={[WIDTH, 0.04, DEPTH]} p={[0, PLAN.ceiling - 0.02, 0]} m={m.ceiling} cast={false} radius={0} />
      <B s={[WIDTH - 0.3, 0.05, DEPTH - 0.3]} p={[0, PLAN.ceiling - 0.055, 0]} m={m.dark} cast={false} radius={0} />
      <B s={[WIDTH - 0.36, 0.05, DEPTH - 0.36]} p={[0, PLAN.ceiling - 0.06, 0]} m={m.ceiling} cast={false} radius={0} />

      <FlatRoof w={roofW} d={roofD} p={[0, PLAN.ceiling, 0]} />
      {/* Soffit: the underside of the eaves is a finished surface, with a drip groove at the edge. */}
      <B s={[roofW - 0.12, 0.03, roofD - 0.12]} p={[0, PLAN.ceiling - 0.012, 0]} m={m.soffit} cast={false} radius={0} />

      {/* Upper volume over the kitchen: the bedrooms, and the silhouette of the house. */}
      <group position={[7, 0, -2.75]}>
        {/* Four real walls, so the bedroom window is a hole with a reveal, not a panel stuck on. */}
        <mesh geometry={upperSouth} material={m.facade} position={[0, upperBase, 4.1]} castShadow receiveShadow />
        <B s={[10, INSIDE_H, 0.3]} p={[0, upperBase + INSIDE_H / 2, -4.1]} m={m.facade} grain="x" radius={0.004} />
        <B s={[0.3, INSIDE_H, 7.9]} p={[-4.85, upperBase + INSIDE_H / 2, 0]} m={m.facade} grain="z" radius={0.004} />
        <B s={[0.3, INSIDE_H, 7.9]} p={[4.85, upperBase + INSIDE_H / 2, 0]} m={m.facade} grain="z" radius={0.004} />
        <FlatRoof w={10.8} d={9.3} p={[0, PLAN.upperCeiling, 0]} plant />
        <B s={[10.7, 0.03, 9.2]} p={[0, PLAN.upperCeiling - 0.012, 0]} m={m.soffit} cast={false} radius={0} />
        {/* Frame and glass set back in the reveal, a stone sill, and sheers behind. */}
        <mesh material={m.glass} position={[-0.6, upperBase + 1.75, 4.04]}>
          <planeGeometry args={[6.4, 1.9]} />
        </mesh>
        <B s={[6.4, 0.05, 0.1]} p={[-0.6, upperBase + 2.675, 4.04]} m={m.frame} />
        <B s={[6.4, 0.05, 0.1]} p={[-0.6, upperBase + 0.825, 4.04]} m={m.frame} />
        <B s={[6.5, 0.035, 0.34]} p={[-0.6, upperBase + 0.79, 4.13]} m={m.deck} />
        {[-3.175, -1.6, 0, 1.6, 3.175].map((x) => (
          <B key={x} s={[0.05, 1.9, 0.1]} p={[x - 0.6, upperBase + 1.75, 4.04]} m={m.frame} />
        ))}
        <Curtain w={6.3} h={1.86} p={[-0.6, upperBase + 1.75, 3.86]} folds={46} />
        <B s={[9.3, INSIDE_H - 0.2, 0.05]} p={[0, upperBase + INSIDE_H / 2, 1.2]} m={m.wall} cast={false} radius={0} />
      </group>
    </group>
  );
}

/* ── Glazing ──────────────────────────────────────────────── */

/** A run of glass in slim frames. Mullions are real posts, so reflections break as they do on site. */
function Glazing({ from, to, z, height = INSIDE_H, base = PLAN.plinth, panel = 2.4 }: { from: number; to: number; z: number; height?: number; base?: number; panel?: number }) {
  const m = useMaterials();
  const length = to - from;
  const count = Math.max(1, Math.round(length / panel));
  const step = length / count;
  const glass = useMemo(() => new THREE.PlaneGeometry(step - 0.06, height - 0.14), [step, height]);

  return (
    <group>
      {Array.from({ length: count }, (_, index) => (
        <mesh key={`g${index}`} geometry={glass} material={m.glass} position={[from + step * (index + 0.5), base + height / 2, z]} />
      ))}
      {Array.from({ length: count + 1 }, (_, index) => (
        <B key={`m${index}`} s={[0.06, height, 0.13]} p={[from + step * index, base + height / 2, z]} m={m.frame} />
      ))}
      {/* Head, and a sill track let into the stone. */}
      <B s={[length, 0.08, 0.15]} p={[from + length / 2, base + height - 0.04, z]} m={m.frame} />
      <B s={[length, 0.05, 0.17]} p={[from + length / 2, base + 0.02, z]} m={m.frame} />
    </group>
  );
}

/** A sheer curtain: a pleated plane. Drawn back in stacks, it frames the view rather than hiding it. */
function Curtain({ w, h, p, folds = 12, r }: { w: number; h: number; p: V3; folds?: number; r?: V3 }) {
  const m = useMaterials();
  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(w, h, folds * 6, 1);
    const position = plane.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const wave = Math.sin((x / w) * folds * Math.PI * 2);
      position.setZ(i, wave * 0.045 + Math.sin(x * 3.1) * 0.012);
    }
    plane.computeVertexNormals();
    return plane;
  }, [w, h, folds]);
  return <mesh geometry={geometry} material={m.curtain} position={p} rotation={r} receiveShadow />;
}

/** Vertical fins: shade the east glass and stripe the light across the floor through the day. */
function Fins() {
  const m = useMaterials();
  const east = finLayout(PLAN.north + 1.2, PLAN.south - 1.2, 0.62);
  return (
    <group>
      {east.map((z, index) => (
        <B key={index} s={[0.42, INSIDE_H + 0.3, 0.1]} p={[PLAN.east + 0.55, PLAN.plinth + (INSIDE_H + 0.3) / 2, z]} m={m.frame} radius={0.004} />
      ))}
    </group>
  );
}

/** The portico: a deep shaded threshold, the liwan the studio is named after. */
function Portico() {
  const m = useMaterials();
  const boards = 8;
  const leaf = 1.62;
  const board = leaf / boards;
  return (
    <group>
      {/* The roof runs on from the main slab's eaves; the floor stops short of a strip of water. */}
      <FlatRoof w={3.9} d={9.5} p={[PLAN.west - 3.45, PLAN.ceiling, -1.2]} />
      <B s={[3.84, 0.03, 9.44]} p={[PLAN.west - 3.45, PLAN.ceiling - 0.012, -1.2]} m={m.soffit} cast={false} radius={0} />
      <B s={[3.5, 0.2, 9.5]} p={[PLAN.west - 1.75, PLAN.plinth - 0.1, -1.2]} m={m.deck} />
      {[-5.6, 3.2].map((z) => (
        <B key={z} s={[0.3, PLAN.ceiling, 0.3]} p={[PLAN.west - 5.1, PLAN.ceiling / 2, z]} m={m.facade} grain="y" />
      ))}

      {/* Entrance door: a pivot leaf of vertical boards, in a metal lining, with a full-height pull. */}
      <group position={[PLAN.west, PLAN.plinth, 1.6]}>
        <B s={[PLAN.wall + 0.04, 2.95, 0.04]} p={[0, 1.475, -0.85]} m={m.frame} />
        <B s={[PLAN.wall + 0.04, 2.95, 0.04]} p={[0, 1.475, 0.85]} m={m.frame} />
        <B s={[PLAN.wall + 0.04, 0.04, 1.74]} p={[0, 2.93, 0]} m={m.frame} />
        {Array.from({ length: boards }, (_, index) => (
          <B key={index} s={[0.06, 2.88, board - 0.006]} p={[-0.02, 1.46, -leaf / 2 + board * (index + 0.5)]} m={m.door} grain="y" radius={0.003} />
        ))}
        <B s={[0.03, 1.5, 0.035]} p={[-0.1, 1.35, 0.52]} m={m.metal} radius={0.01} />
        {[0.7, 2].map((y) => (
          <B key={y} s={[0.06, 0.03, 0.03]} p={[-0.07, y, 0.52]} m={m.metal} />
        ))}
        <B s={[0.5, 0.025, 1.8]} p={[-0.12, 0.012, 0]} m={m.deck} />
      </group>

      {/* A bench along the wall, and a strip of still water that cools the threshold. */}
      <B s={[0.5, 0.08, 3.2]} p={[PLAN.west - 0.55, PLAN.plinth + 0.44, -3.6]} m={m.timber} grain="z" radius={0.01} />
      {[-4.9, -2.3].map((z) => (
        <B key={z} s={[0.44, 0.4, 0.08]} p={[PLAN.west - 0.55, PLAN.plinth + 0.2, z]} m={m.deck} />
      ))}
      <B s={[1.5, 0.12, 4.5]} p={[PLAN.west - 4.3, 0.0, -2.6]} m={m.dark} cast={false} />
      {[-1, 1].map((side) => (
        <B key={side} s={[0.08, 0.16, 4.66]} p={[PLAN.west - 4.3 + side * 0.79, 0.08, -2.6]} m={m.deck} />
      ))}
      {[-1, 1].map((side) => (
        <B key={`e${side}`} s={[1.5, 0.16, 0.08]} p={[PLAN.west - 4.3, 0.08, -2.6 + side * 2.29]} m={m.deck} />
      ))}
      <mesh geometry={mplane(1.5, 4.5)} material={m.water} position={[PLAN.west - 4.3, 0.1, -2.6]} />
      <C rt={0.34} rb={0.26} h={0.62} p={[PLAN.west - 1, PLAN.plinth, 3.9]} m={m.ceramic} />
      <Shrub seed={41} position={[PLAN.west - 1, PLAN.plinth + 0.5, 3.9]} size={[0.5, 0.5, 0.5]} />
    </group>
  );
}

/* ── Interior ─────────────────────────────────────────────── */

function Partitions() {
  const m = useMaterials();
  const foyer = useMemo(() => wallGeometry(8, INSIDE_H, 0.18, [], 'part-foyer'), []);
  const kitchen = useMemo(() => wallGeometry(6, INSIDE_H, 0.18, [], 'part-kitchen'), []);
  const lining = INSIDE_H - 0.06;
  return (
    <group>
      <mesh geometry={foyer} material={m.wall} position={[PLAN.foyerEast, PLAN.plinth, PLAN.north + 4]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow />
      <mesh geometry={kitchen} material={m.wall} position={[PLAN.kitchenWest, PLAN.plinth, PLAN.north + 3]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow />
      {/* Plaster linings to the inside of the stone walls, stopped around the openings. */}
      <B s={[WIDTH - 0.5, 2.3, 0.03]} p={[0, PLAN.plinth + 1.15, PLAN.north + 0.15]} m={m.wall} cast={false} radius={0} />
      <B s={[WIDTH - 0.5, lining - 3.05, 0.03]} p={[0, PLAN.plinth + 3.05 + (lining - 3.05) / 2, PLAN.north + 0.15]} m={m.wall} cast={false} radius={0} />
      <B s={[0.03, lining, 5.6]} p={[PLAN.east - 0.15, PLAN.plinth + lining / 2, -4.1]} m={m.wall} cast={false} radius={0} />
      <B s={[0.03, lining, 6.6]} p={[PLAN.east - 0.15, PLAN.plinth + lining / 2, 3.6]} m={m.wall} cast={false} radius={0} />
      {/* A shadow-gap skirting: a dark 40 mm recess where wall meets floor. */}
      <B s={[WIDTH - 0.6, 0.04, 0.02]} p={[0, PLAN.plinth + 0.02, PLAN.north + 0.175]} m={m.dark} cast={false} radius={0} />
    </group>
  );
}

/** Recessed downlights: small, warm, and in rows. */
function Downlights({ xs, zs }: { xs: number[]; zs: number[] }) {
  const m = useMaterials();
  return (
    <group>
      {xs.map((x) =>
        zs.map((z) => (
          <group key={`${x}:${z}`} position={[x, PLAN.ceiling - 0.088, z]}>
            <mesh geometry={mcyl(0.05, 0.05, 0.008, 20)} material={m.lamp} />
            <mesh geometry={mcyl(0.062, 0.062, 0.006, 20)} material={m.dark} position={[0, 0.004, 0]} />
          </group>
        )),
      )}
    </group>
  );
}

/** A seat: plinth, base, seat and back cushions with soft edges, and arms. */
function Sofa({ length, seats, arms = [true, true] }: { length: number; seats: number; arms?: [boolean, boolean] }) {
  const m = useMaterials();
  const depth = 1.02;
  const arm = 0.2;
  const inner = length - (arms[0] ? arm : 0) - (arms[1] ? arm : 0);
  const start = -length / 2 + (arms[0] ? arm : 0);
  const seat = inner / seats;
  return (
    <group>
      <B s={[length - 0.12, 0.1, depth - 0.14]} p={[0, 0.05, 0]} m={m.dark} cast={false} />
      <B s={[length, 0.24, depth]} p={[0, 0.22, 0]} m={m.sofa} radius={0.04} />
      <B s={[length, 0.5, 0.2]} p={[0, 0.58, -depth / 2 + 0.1]} m={m.sofa} radius={0.06} />
      {arms.map((has, index) => has && <B key={index} s={[arm, 0.34, depth]} p={[(index ? 1 : -1) * (length / 2 - arm / 2), 0.5, 0]} m={m.sofa} radius={0.06} />)}
      {Array.from({ length: seats }, (_, index) => (
        <group key={index}>
          <B s={[seat - 0.015, 0.17, depth - 0.24]} p={[start + seat * (index + 0.5), 0.42, 0.09]} m={m.sofa} radius={0.07} />
          <B s={[seat - 0.03, 0.44, 0.2]} p={[start + seat * (index + 0.5), 0.7, -depth / 2 + 0.3]} r={[-0.16, 0, 0]} m={m.sofa} radius={0.09} />
        </group>
      ))}
    </group>
  );
}

function Armchair({ p, r }: { p: V3; r: number }) {
  const m = useMaterials();
  return (
    <group position={p} rotation={[0, r, 0]}>
      {[-0.32, 0.32].map((x) =>
        [-0.3, 0.3].map((z) => <C key={`${x}${z}`} rt={0.016} rb={0.011} h={0.3} p={[x, 0, z]} m={m.metal} />),
      )}
      <B s={[0.78, 0.16, 0.78]} p={[0, 0.38, 0]} m={m.cushion} radius={0.07} />
      <B s={[0.78, 0.5, 0.14]} p={[0, 0.66, -0.34]} r={[-0.2, 0, 0]} m={m.cushion} radius={0.07} />
      {[-0.36, 0.36].map((x) => (
        <B key={x} s={[0.08, 0.3, 0.7]} p={[x, 0.52, -0.02]} m={m.timber} grain="z" radius={0.02} />
      ))}
    </group>
  );
}

function Living({ fine }: { fine: boolean }) {
  const m = useMaterials();

  return (
    <group position={[-2.6, PLAN.plinth, 2.4]}>
      {/* A wool rug with a real thickness, so it throws a line of shadow onto the floor. */}
      <B s={[6.4, 0.018, 4.4]} p={[0, 0.01, 0.2]} m={m.rug} radius={0.008} cast={false} />

      {/* One large canvas on the plaster, hung low the way galleries hang. */}
      <group position={[-4.29, 0, -3]} rotation={[0, Math.PI / 2, 0]}>
        <B s={[2.6, 1.7, 0.035]} p={[0, 1.75, 0]} m={m.timber} grain="x" />
        <B s={[2.5, 1.6, 0.02]} p={[0, 1.75, 0.02]} m={m.art} cast={false} />
        <B s={[0.9, 1.1, 0.006]} p={[-0.5, 1.7, 0.034]} m={m.book} cast={false} radius={0} />
        <B s={[1, 0.34, 0.006]} p={[0.45, 1.34, 0.035]} m={m.dark} cast={false} radius={0} />
      </group>

      <group position={[0, 0, -1.1]}>
        <Sofa length={4.2} seats={3} />
        {fine && (
          <>
            <B s={[0.5, 0.46, 0.14]} p={[-1.55, 0.7, 0.1]} r={[-0.3, 0.2, 0.06]} m={m.cushion} radius={0.06} />
            <B s={[0.44, 0.4, 0.13]} p={[1.5, 0.68, 0.12]} r={[-0.34, -0.25, -0.05]} m={m.timber} radius={0.06} />
          </>
        )}
      </group>
      <group position={[2.45, 0, 1.2]} rotation={[0, -Math.PI / 2, 0]}>
        <Sofa length={2.3} seats={2} arms={[false, true]} />
      </group>
      <Armchair p={[-2.7, 0, 1.45]} r={Math.PI / 2 + 0.25} />

      {/* Coffee table: two stone blocks of different heights, with the things a table collects. */}
      <B s={[1.5, 0.3, 0.9]} p={[-0.1, 0.15, 0.85]} m={m.deck} radius={0.015} />
      <B s={[0.7, 0.4, 0.7]} p={[0.95, 0.2, 1.05]} m={m.timber} radius={0.015} grain="x" />
      {fine && (
        <>
          <B s={[0.36, 0.035, 0.27]} p={[-0.4, 0.318, 0.8]} r={[0, 0.2, 0]} m={m.book} radius={0.004} />
          <B s={[0.3, 0.03, 0.22]} p={[-0.4, 0.35, 0.8]} r={[0, 0.05, 0]} m={m.art} radius={0.004} />
          <C rt={0.16} rb={0.07} h={0.09} p={[0.2, 0.3, 0.95]} m={m.ceramic} />
          <C rt={0.05} rb={0.07} h={0.24} p={[0.95, 0.4, 1.05]} m={m.ceramic} />
        </>
      )}

      {/* Floor lamp: a thin stem and a linen drum that glows. */}
      <group position={[-2.95, 0, -0.9]}>
        <C rt={0.15} h={0.02} p={[0, 0, 0]} m={m.metal} />
        <C rt={0.012} h={1.55} p={[0, 0.02, 0]} m={m.metal} />
        <mesh geometry={mcyl(0.2, 0.23, 0.3, 32)} material={m.shade} position={[0, 1.68, 0]} />
      </group>

      {/* A tall plant in a stone pot: the one soft silhouette in the room. */}
      <group position={[3.75, 0, -1.7]}>
        <C rt={0.3} rb={0.22} h={0.55} p={[0, 0, 0]} m={m.ceramic} />
        <C rt={0.27} h={0.02} p={[0, 0.5, 0]} m={m.soil} cast={false} />
        <C rt={0.025} rb={0.035} h={1.1} p={[0, 0.5, 0]} m={m.trunk} />
        <Shrub seed={7} position={[0, 1.15, 0]} size={[0.5, 0.7, 0.5]} />
      </group>

      {/* Sideboard against the partition: four doors, a shadow line under the top. */}
      <group position={[-4.06, 0, -3]} rotation={[0, Math.PI / 2, 0]}>
        <B s={[2.56, 0.1, 0.4]} p={[0, 0.05, 0]} m={m.dark} cast={false} />
        <B s={[2.6, 0.56, 0.46]} p={[0, 0.39, 0]} m={m.dark} />
        {[-0.975, -0.325, 0.325, 0.975].map((x) => (
          <B key={x} s={[0.642, 0.55, 0.02]} p={[x, 0.39, 0.235]} m={m.cabinet} grain="x" radius={0.002} />
        ))}
        <B s={[2.64, 0.03, 0.5]} p={[0, 0.7, 0]} m={m.counter} radius={0.004} />
        {fine && (
          <>
            <C rt={0.07} rb={0.11} h={0.34} p={[-0.8, 0.715, 0]} m={m.ceramic} />
            <C rt={0.12} rb={0.05} h={0.12} p={[-0.45, 0.715, 0.05]} m={m.dark} />
            <B s={[0.34, 0.1, 0.25]} p={[0.7, 0.765, 0]} r={[0, 0.12, 0]} m={m.book} radius={0.004} />
          </>
        )}
      </group>
    </group>
  );
}

function Chair({ p, r, soft }: { p: V3; r: number; soft: THREE.Material }) {
  const m = useMaterials();
  return (
    <group position={p} rotation={[0, r, 0]}>
      {[-0.2, 0.2].map((x) =>
        [-0.19, 0.19].map((z) => <C key={`${x}${z}`} rt={0.017} rb={0.011} h={0.44} p={[x, 0, z]} m={m.timber} />),
      )}
      <B s={[0.48, 0.06, 0.46]} p={[0, 0.47, 0]} m={soft} radius={0.028} />
      <B s={[0.46, 0.34, 0.035]} p={[0, 0.76, -0.22]} r={[-0.12, 0, 0]} m={soft} radius={0.017} />
      {[-0.2, 0.2].map((x) => (
        <C key={x} rt={0.014} h={0.42} p={[x, 0.44, -0.2]} m={m.timber} r={[-0.1, 0, 0]} />
      ))}
    </group>
  );
}

function Dining({ fine }: { fine: boolean }) {
  const m = useMaterials();
  return (
    <group position={[1.1, PLAN.plinth, -2.2]}>
      <B s={[2.8, 0.045, 1.1]} p={[0, 0.735, 0]} m={m.timber} grain="x" radius={0.012} />
      {[-1.05, 1.05].map((x) => (
        <B key={x} s={[0.08, 0.71, 0.8]} p={[x, 0.355, 0]} m={m.timber} grain="y" radius={0.01} />
      ))}
      {[-0.9, 0, 0.9].map((x) =>
        [-0.82, 0.82].map((z) => <Chair key={`${x}${z}`} p={[x, 0, z]} r={z > 0 ? Math.PI : 0} soft={m.cushion} />),
      )}
      {fine && <C rt={0.2} rb={0.09} h={0.1} p={[0.2, 0.758, 0]} m={m.ceramic} />}
      {/* Three small pendants on a line over the table. */}
      {[-0.8, 0, 0.8].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <C rt={0.004} h={INSIDE_H - 0.1 - 1.72} p={[0, 1.72, 0]} m={m.dark} cast={false} />
          <mesh geometry={mcyl(0.035, 0.11, 0.16, 28)} material={m.metal} position={[0, 1.66, 0]} castShadow />
          <mesh geometry={mcyl(0.095, 0.095, 0.006, 24)} material={m.lamp} position={[0, 1.582, 0]} />
        </group>
      ))}
    </group>
  );
}

/** A bank of cabinet fronts over a dark carcass: the 4 mm gaps between doors are what read as joinery. */
function Fronts({ from, to, y, h, z, count, grain = 'y' }: { from: number; to: number; y: number; h: number; z: number; count: number; grain?: Axis }) {
  const m = useMaterials();
  const w = (to - from) / count;
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <B key={index} s={[w - 0.004, h, 0.02]} p={[from + w * (index + 0.5), y, z]} m={m.cabinet} grain={grain} radius={0.0018} />
      ))}
    </>
  );
}

function Kitchen({ fine }: { fine: boolean }) {
  const m = useMaterials();

  return (
    <group position={[7.4, PLAN.plinth, -1.2]}>
      {/* Island: fronts on a recessed plinth, under a stone top that folds down both ends. */}
      <group position={[0, 0, 1.9]}>
        <B s={[3.4, 0.1, 0.96]} p={[0, 0.05, 0]} m={m.dark} cast={false} />
        <B s={[3.56, 0.76, 1.08]} p={[0, 0.48, 0]} m={m.dark} />
        <Fronts from={-1.78} to={1.78} y={0.47} h={0.74} z={-0.55} count={6} />
        <Fronts from={-1.78} to={1.78} y={0.47} h={0.74} z={0.55} count={3} grain="x" />
        <B s={[3.72, 0.04, 1.24]} p={[0, 0.9, 0]} m={m.counter} radius={0.004} />
        {[-1, 1].map((side) => (
          <B key={side} s={[0.04, 0.88, 1.24]} p={[side * 1.84, 0.44, 0]} m={m.counter} radius={0.004} grain="z" />
        ))}
        {/* Undermounted sink and a single tap. */}
        <B s={[0.72, 0.012, 0.42]} p={[-0.9, 0.916, -0.08]} m={m.dark} cast={false} radius={0} />
        <C rt={0.016} h={0.3} p={[-0.9, 0.92, -0.38]} m={m.metal} />
        <B s={[0.024, 0.024, 0.24]} p={[-0.9, 1.22, -0.27]} m={m.metal} radius={0.01} />
        {fine && (
          <>
            <C rt={0.17} rb={0.08} h={0.09} p={[0.7, 0.92, 0.1]} m={m.ceramic} />
            <B s={[0.42, 0.025, 0.28]} p={[1.25, 0.932, -0.1]} r={[0, 0.3, 0]} m={m.timber} radius={0.006} />
          </>
        )}
        {/* Stools on the living side. */}
        {[-1.05, 0, 1.05].map((x) => (
          <group key={x} position={[x, 0, 1]}>
            <B s={[0.38, 0.05, 0.36]} p={[0, 0.66, 0]} m={m.cushion} radius={0.024} />
            <B s={[0.36, 0.2, 0.03]} p={[0, 0.8, 0.17]} m={m.timber} grain="x" radius={0.012} />
            {[-0.16, 0.16].map((lx) => [-0.15, 0.15].map((lz) => <C key={`${lx}${lz}`} rt={0.014} rb={0.01} h={0.64} p={[lx, 0, lz]} m={m.metal} />))}
            <B s={[0.34, 0.014, 0.014]} p={[0, 0.22, -0.15]} m={m.metal} />
          </group>
        ))}
        {/* A linear pendant over the island. */}
        <B s={[2.6, 0.035, 0.05]} p={[0, 2.08, 0]} m={m.metal} radius={0.006} />
        <B s={[2.56, 0.004, 0.03]} p={[0, 2.06, 0]} m={m.lamp} cast={false} radius={0} />
        {[-1.1, 1.1].map((x) => (
          <C key={x} rt={0.003} h={INSIDE_H - 0.1 - 2.1} p={[x, 2.1, 0]} m={m.dark} cast={false} />
        ))}
      </group>

      {/* The run along the north wall: base units and hob, a stone upstand, and a tall bank with ovens. */}
      <group position={[-0.9, 0, -4.2]}>
        <B s={[5, 0.1, 0.52]} p={[0, 0.05, 0.02]} m={m.dark} cast={false} />
        <B s={[5.2, 0.74, 0.6]} p={[0, 0.47, 0]} m={m.dark} />
        <Fronts from={-2.6} to={2.6} y={0.455} h={0.71} z={0.31} count={8} />
        <B s={[5.24, 0.04, 0.66]} p={[0, 0.88, 0.02]} m={m.counter} radius={0.004} />
        <B s={[5.24, 0.07, 0.025]} p={[0, 0.935, -0.29]} m={m.counter} radius={0.002} />
        <B s={[0.82, 0.008, 0.52]} p={[-0.6, 0.904, 0.02]} m={m.appliance} cast={false} radius={0.002} />
        {/* A flush extractor in the ceiling above the hob. */}
        <B s={[1, 0.02, 0.5]} p={[-0.6, INSIDE_H - 0.1, 0.05]} m={m.frame} cast={false} />
        {/* One long open shelf, lit from beneath. */}
        <B s={[1.8, 0.04, 0.26]} p={[-1.65, 1.72, -0.16]} m={m.timber} grain="x" radius={0.006} />
        <B s={[1.7, 0.004, 0.02]} p={[-1.65, 1.698, -0.06]} m={m.lamp} cast={false} radius={0} />
        {fine && (
          <>
            {[-2.35, -2.12, -1.9].map((x, index) => (
              <C key={x} rt={0.07} rb={0.055} h={0.1 + index * 0.03} p={[x, 1.74, -0.16]} m={m.ceramic} />
            ))}
            <C rt={0.06} rb={0.09} h={0.26} p={[-1.05, 1.74, -0.16]} m={m.dark} />
            <B s={[0.3, 0.2, 0.18]} p={[-1.5, 1.84, -0.16]} m={m.book} radius={0.004} />
          </>
        )}
      </group>
      <group position={[3.05, 0, -4.2]}>
        <B s={[2.6, 0.1, 0.56]} p={[0, 0.05, 0]} m={m.dark} cast={false} />
        <B s={[2.7, 2.72, 0.64]} p={[0, 1.46, 0]} m={m.dark} />
        <Fronts from={-1.35} to={0.45} y={1.46} h={2.7} z={0.33} count={3} />
        <Fronts from={1.05} to={1.35} y={1.46} h={2.7} z={0.33} count={1} />
        {/* Oven and combi-steam, stacked, behind black glass. */}
        <B s={[0.596, 0.78, 0.02]} p={[0.75, 0.5, 0.33]} m={m.cabinet} grain="y" radius={0.0018} />
        <B s={[0.596, 0.59, 0.02]} p={[0.75, 1.19, 0.33]} m={m.appliance} radius={0.003} />
        <B s={[0.596, 0.45, 0.02]} p={[0.75, 1.715, 0.33]} m={m.appliance} radius={0.003} />
        <B s={[0.596, 0.865, 0.02]} p={[0.75, 2.377, 0.33]} m={m.cabinet} grain="y" radius={0.0018} />
        {[1.43, 1.9].map((y) => (
          <B key={y} s={[0.46, 0.014, 0.025]} p={[0.75, y, 0.355]} m={m.metal} radius={0.005} />
        ))}
      </group>
    </group>
  );
}

/** An open stair to the upper floor: treads cantilevered off a single blade wall, and a handrail. */
function Stair() {
  const m = useMaterials();
  const treads = 12;
  return (
    <group position={[2.2, PLAN.plinth, -5.1]}>
      <B s={[0.16, INSIDE_H, 3.4]} p={[-0.9, INSIDE_H / 2, 0]} m={m.wall} radius={0.004} />
      {Array.from({ length: treads }, (_, index) => (
        <B key={index} s={[1.5, 0.07, 0.3]} p={[-0.1, 0.28 + index * 0.28, 1.35 - index * 0.25]} m={m.timber} grain="x" radius={0.008} />
      ))}
      <B s={[0.03, 0.03, 3.6]} p={[0.62, 2.62, 0]} r={[0.84, 0, 0]} m={m.metal} radius={0.012} />
    </group>
  );
}

function Foyer() {
  const m = useMaterials();
  return (
    <group position={[-9.6, PLAN.plinth, -3]}>
      <B s={[1.8, 0.05, 0.42]} p={[0, 0.82, -3.62]} m={m.timber} grain="x" radius={0.008} />
      {[-0.82, 0.82].map((x) => (
        <B key={x} s={[0.05, 0.8, 0.4]} p={[x, 0.4, -3.62]} m={m.timber} grain="y" radius={0.006} />
      ))}
      <C rt={0.09} rb={0.13} h={0.42} p={[-0.4, 0.845, -3.62]} m={m.ceramic} />
      <mesh geometry={mcyl(0.55, 0.55, 0.02, 48)} material={m.metal} position={[0.2, 1.75, -3.8]} rotation={[Math.PI / 2, 0, 0]} />
      <B s={[2.6, 0.015, 1.7]} p={[0, 0.009, 1.2]} m={m.rug} radius={0.006} cast={false} />
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

      {/* Coping: a stone lip that oversails the basin, with an eased nose. */}
      {[-1, 1].map((side) => (
        <B key={`c${side}`} s={[0.6, 0.06, parts.length + 1.2]} p={[(side * (parts.width + 0.54)) / 2, 0.03, 0]} m={m.deck} radius={0.015} grain="z" />
      ))}
      {[-1, 1].map((side) => (
        <B key={`s${side}`} s={[parts.width + 1.2, 0.06, 0.6]} p={[0, 0.03, (side * (parts.length + 0.54)) / 2]} m={m.deck} radius={0.015} />
      ))}
      {/* Submerged steps at the shallow end. */}
      {[0, 1, 2].map((index) => (
        <B key={index} s={[3.2, 0.38, 0.5]} p={[-parts.width / 2 + 2.2, -0.19 - index * 0.38, parts.length / 2 - 0.45 - index * 0.5]} m={m.poolBed} cast={false} />
      ))}
    </group>
  );
}

function Lounger({ p, r }: { p: V3; r: number }) {
  const m = useMaterials();
  return (
    <group position={p} rotation={[0, r, 0]}>
      <B s={[2, 0.05, 0.72]} p={[0, 0.27, 0]} m={m.timber} grain="x" radius={0.01} />
      {[-0.85, 0.85].map((x) => (
        <B key={x} s={[0.06, 0.25, 0.64]} p={[x, 0.125, 0]} m={m.timber} grain="z" radius={0.008} />
      ))}
      <B s={[1.3, 0.09, 0.66]} p={[0.32, 0.345, 0]} m={m.cushion} radius={0.04} />
      <B s={[0.68, 0.09, 0.66]} p={[-0.62, 0.5, 0]} r={[0, 0, -0.5]} m={m.cushion} radius={0.04} />
    </group>
  );
}

const SITE = { x0: -36, x1: 32, z0: -22, z1: 38, wall: 3 };

/** The boundary wall. A Saudi house begins at its wall: privacy first, then the garden. */
function Boundary() {
  const m = useMaterials();
  const { x0, x1, z0, z1, wall } = SITE;
  const w = x1 - x0;
  const d = z1 - z0;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const t = 0.3;
  const gate = { z: 1.6, width: 4.2 };
  const westA = gate.z - gate.width / 2 - z0;
  const westB = z1 - (gate.z + gate.width / 2);
  const run = (s: V3, p: V3) => (
    <group key={p.join(':')}>
      <B s={s} p={p} m={m.boundary} radius={0.01} />
      <B s={[s[0] + 0.08, 0.05, s[2] + 0.08]} p={[p[0], wall + 0.025, p[2]]} m={m.deck} radius={0.008} />
    </group>
  );
  return (
    <group>
      {run([w, wall, t], [cx, wall / 2, z0])}
      {run([w, wall, t], [cx, wall / 2, z1])}
      {run([t, wall, d], [x1, wall / 2, cz])}
      {run([t, wall, westA], [x0, wall / 2, z0 + westA / 2])}
      {run([t, wall, westB], [x0, wall / 2, z1 - westB / 2])}
      {/* The gate: vertical metal slats between two piers. */}
      {[-1, 1].map((side) => (
        <B key={side} s={[0.5, wall + 0.2, 0.5]} p={[x0, (wall + 0.2) / 2, gate.z + side * (gate.width / 2 + 0.1)]} m={m.facade} grain="y" />
      ))}
      {Array.from({ length: 34 }, (_, index) => (
        <B key={index} s={[0.04, 2.5, 0.085]} p={[x0, 1.3, gate.z - gate.width / 2 + 0.2 + index * 0.117]} m={m.frame} radius={0.004} />
      ))}
      {/* The path from the gate to the portico. */}
      <B s={[20.5, 0.06, 2.6]} p={[x0 + 10.25, 0.01, gate.z]} m={m.deck} radius={0.01} />
    </group>
  );
}

const DRIFTS: { seed: number; from: V3; to: V3; count: number }[] = [
  { seed: 3, from: [-34.5, 0, -2], to: [-20, 0, -0.4], count: 22 },
  { seed: 5, from: [-34.5, 0, 5.4], to: [-20, 0, 3.8], count: 22 },
  { seed: 9, from: [-13, 0, 20.2], to: [13, 0, 20.2], count: 40 },
  { seed: 12, from: [15.4, 0, 8], to: [15.4, 0, 19], count: 16 },
  { seed: 14, from: [-15.4, 0, 8], to: [-15.4, 0, 19], count: 16 },
];

function Landscape({ fine }: { fine: boolean }) {
  const m = useMaterials();

  return (
    <group>
      {/* Ground: washed gravel across the site, so the house sits in a garden, not on a page. */}
      <mesh geometry={groundGeometry()} material={m.gravel} position={[0, -0.02, 0]} receiveShadow />
      {/* Terrace deck, cut around the pool so the water reads as a basin in the stone. */}
      <mesh geometry={deckGeometry()} material={m.deck} receiveShadow />
      {/* Lawn beyond the pool, inside a stone kerb. */}
      <mesh geometry={mplane(34, 13)} material={m.lawn} position={[0, 0.012, 28]} receiveShadow />
      <B s={[34.3, 0.08, 0.15]} p={[0, 0.02, 21.45]} m={m.deck} cast={false} />

      <Boundary />
      {/* The neighbourhood: other houses beyond the wall, as plain masses in the haze. */}
      {(
        [
          [-52, 4, -30, 16, 8, 14],
          [4, 3.6, -40, 20, 7.2, 12],
          [48, 4.4, -18, 14, 8.8, 18],
          [54, 3.5, 22, 15, 7, 16],
          [-58, 3.8, 18, 16, 7.6, 15],
        ] as number[][]
      ).map(([x, y, z, w, h, d]) => (
        <B key={`${x}:${z}`} s={[w, h, d]} p={[x, y, z]} m={m.boundary} radius={0.02} />
      ))}

      {/* One long step from the terrace up to the plinth. */}
      <B s={[9, 0.09, 0.5]} p={[-1, 0.045, PLAN.south + 0.7 + 0.25]} m={m.deck} radius={0.012} />

      {/* Raised planters edging the terrace, planted rather than capped in green. */}
      {(
        [
          [-12.2, 10.8, 3.4],
          [12.6, 10.8, 3.4],
          [-12.2, 16.2, 2.6],
        ] as V3[]
      ).map(([x, z, d], index) => (
        <group key={index} position={[x, 0, z]}>
          {[-1, 1].map((side) => (
            <B key={`a${side}`} s={[1.5, 0.5, 0.08]} p={[0, 0.25, (side * (d - 0.08)) / 2]} m={m.deck} />
          ))}
          {[-1, 1].map((side) => (
            <B key={`b${side}`} s={[0.08, 0.5, d - 0.16]} p={[side * 0.71, 0.25, 0]} m={m.deck} />
          ))}
          <mesh geometry={mplane(1.34, d - 0.16)} material={m.soil} position={[0, 0.42, 0]} receiveShadow />
          <Shrub seed={20 + index} position={[0, 0.42, -d / 4]} size={[0.6, 0.45, 0.7]} />
          <Shrub seed={30 + index} position={[0.1, 0.42, d / 4]} size={[0.55, 0.38, 0.65]} />
        </group>
      ))}

      {DRIFTS.slice(0, fine ? 5 : 3).map((drift) => (
        <GrassDrift key={drift.seed} {...drift} spread={0.9} />
      ))}

      {/* Date palms mark the approach; olives hold the corners of the garden. */}
      <Palm seed={1} position={[-30, 0, -2.2]} height={7.4} />
      <Palm seed={2} position={[-24, 0, 5.6]} height={6.6} />
      <Palm seed={3} position={[-19.5, 0, -2.6]} height={8} />
      <Palm seed={4} position={[-17.5, 0, 23.5]} height={7} />
      {fine && <Palm seed={5} position={[-31, 0, 25]} height={7.8} />}
      {fine && <Palm seed={6} position={[22, 0, -14]} height={8.4} />}

      <Olive seed={1} position={[-28, 0, 13.5]} scale={1.15} />
      <Olive seed={2} position={[19.5, 0, 9]} rotation={1.3} />
      <Olive seed={3} position={[-10, 0, 27.5]} scale={1.25} rotation={2.2} />
      <Olive seed={4} position={[13, 0, 29]} rotation={0.6} />
      {fine && <Olive seed={5} position={[-25, 0, -13]} scale={1.1} rotation={4} />}
      {fine && <Olive seed={6} position={[24, 0, 27]} scale={0.95} rotation={3} />}

      {/* Terrace furniture: two loungers by the water, and a table under the eaves. */}
      <Lounger p={[-6.4, 0, 11.4]} r={Math.PI / 2} />
      <Lounger p={[-6.4, 0, 13.6]} r={Math.PI / 2} />
      <B s={[0.45, 0.4, 0.45]} p={[-6.2, 0.2, 12.5]} m={m.deck} radius={0.012} />
      <group position={[9.4, 0, 8.9]}>
        <B s={[2.2, 0.05, 0.95]} p={[0, 0.72, 0]} m={m.timber} grain="x" radius={0.01} />
        {[-0.9, 0.9].map((x) => (
          <B key={x} s={[0.06, 0.7, 0.8]} p={[x, 0.35, 0]} m={m.frame} radius={0.006} />
        ))}
        {[-0.6, 0.6].map((x) => [-0.78, 0.78].map((z) => <Chair key={`${x}${z}`} p={[x, 0, z]} r={z > 0 ? Math.PI : 0} soft={m.timber} />))}
      </group>
    </group>
  );
}

/* ── Interior light ───────────────────────────────────────── */

/** Lamps inside the house, so the interior is lit even when the camera is outside. */
// Downlights are real cones of light: they leave pools on the floor and scallops on the walls.
const SPOTS: V3[] = [
  [-3.9, PLAN.ceiling - 0.1, 1.9],
  [6.4, PLAN.ceiling - 0.1, 0],
];

function InteriorLight() {
  const spec = useSpec();
  const colour = spec.light === 'warm' ? '#ffdcb8' : '#f3f4f5';
  return (
    <group>
      {SPOTS.map((p) => (
        <Downcone key={p.join(':')} p={p} colour={colour} />
      ))}
      <pointLight position={[-9.4, 2.4, -1]} color={colour} intensity={2.4} distance={9} decay={2} />
      {/* The floor lamp. */}
      <pointLight position={[-5.55, 1.75, 1.5]} color={colour} intensity={1.6} distance={6} decay={2} />
      {/* Daylight arriving through the south glass, as a wide soft panel rather than a bulb.
          This is what a deep plan actually gets, and it is what stops the inside going muddy. */}
      <rectAreaLight position={[2, 2, PLAN.south - 0.35]} rotation={[0, 0, 0]} width={17} height={3.2} intensity={2.3} color="#f6f1e8" />
    </group>
  );
}

function Downcone({ p, colour }: { p: V3; colour: string }) {
  const target = useMemo(() => {
    const object = new THREE.Object3D();
    object.position.set(p[0], 0, p[2]);
    return object;
  }, [p]);
  return (
    <>
      <primitive object={target} />
      <spotLight position={p} target={target} color={colour} intensity={16} distance={8} angle={0.95} penumbra={0.85} decay={2} />
    </>
  );
}

/* ── The residence ────────────────────────────────────────── */

export function Villa({ detail = 'high' }: { detail?: 'high' | 'low' }) {
  const fine = detail === 'high';
  const stack = 1.5;
  return (
    <group>
      {/* Everything static is baked into one mesh per material. The pool surface animates and the
          lights must be seen by the renderer, so both stay outside. */}
      <Batch>
        <Landscape fine={fine} />
        <Pool />
        <Slabs />
        <Envelope />
        <Portico />
        <Partitions />
        {/* South face: glass from the living room to the kitchen. */}
        <Glazing from={PLAN.foyerEast} to={PLAN.east} z={PLAN.south} />
        {/* Sheers, drawn back into stacks at the ends and the middle of the glass. */}
        <Curtain w={stack} h={INSIDE_H - 0.12} p={[PLAN.foyerEast + 0.2 + stack / 2, PLAN.plinth + INSIDE_H / 2, PLAN.south - 0.3]} folds={11} />
        <Curtain w={stack} h={INSIDE_H - 0.12} p={[PLAN.east - 0.2 - stack / 2, PLAN.plinth + INSIDE_H / 2, PLAN.south - 0.3]} folds={11} />
        <Curtain w={stack} h={INSIDE_H - 0.12} p={[2.6, PLAN.plinth + INSIDE_H / 2, PLAN.south - 0.3]} folds={11} />
        <Fins />
        <Living fine={fine} />
        <Dining fine={fine} />
        <Kitchen fine={fine} />
        <Foyer />
        {fine && <Stair />}
        {fine && <Downlights xs={[-5.2, -2.6, 0]} zs={[0.4, 3.4]} />}
        {fine && <Downlights xs={[5, 7.4, 9.8]} zs={[-3.2, 2.6]} />}
      </Batch>
      <Water />
      <InteriorLight />
    </group>
  );
}
