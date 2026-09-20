'use client';

import * as THREE from 'three';
import { fabric, marble, paving, plaster, ripple, stone, wood } from './textures';
import type { Spec } from './config';

/**
 * One library of physical materials, created once and mutated in place. Changing a finish
 * never rebuilds the scene: the map is swapped and the colour is tweened over a few frames,
 * with a brief sheen across the surface so the change reads as deliberate.
 */

type Tweened = THREE.MeshPhysicalMaterial & { __target?: THREE.Color; __pulse?: number };

const FACADE = {
  white: { hex: '#e8e4dc', rough: 0.82, texture: () => plaster('#e8e4dc'), repeat: 0.35 },
  'warm-stone': { hex: '#c6b193', rough: 0.76, texture: () => stone('limestone'), repeat: 0.22 },
  sand: { hex: '#d8c4a3', rough: 0.85, texture: () => plaster('#d8c4a3'), repeat: 0.35 },
  charcoal: { hex: '#3a3a38', rough: 0.72, texture: () => stone('concrete'), repeat: 0.25 },
} as const;

const FLOOR = {
  'light-oak': { hex: '#cdb693', rough: 0.45, clearcoat: 0.18, texture: () => wood('light-oak'), repeat: [1.6, 0.22] },
  'dark-oak': { hex: '#7a6248', rough: 0.42, clearcoat: 0.2, texture: () => wood('dark-oak'), repeat: [1.6, 0.22] },
  marble: { hex: '#f1efeb', rough: 0.08, clearcoat: 0.85, texture: () => marble('white'), repeat: [0.14, 0.14] },
  travertine: { hex: '#d3c4a9', rough: 0.55, clearcoat: 0.12, texture: () => stone('travertine'), repeat: [0.2, 0.2] },
} as const;

const CABINET = {
  white: { hex: '#e9e6e0', rough: 0.5, texture: () => plaster('#e9e6e0'), repeat: 0.5 },
  walnut: { hex: '#5a4133', rough: 0.4, texture: () => wood('walnut'), repeat: 0.6 },
  charcoal: { hex: '#35363a', rough: 0.55, texture: () => plaster('#35363a'), repeat: 0.5 },
  'natural-oak': { hex: '#b2946b', rough: 0.45, texture: () => wood('natural-oak'), repeat: 0.6 },
} as const;

const COUNTER = {
  'white-marble': { hex: '#f2f0ec', rough: 0.09, texture: () => marble('white'), repeat: 0.35 },
  'beige-stone': { hex: '#ded2bd', rough: 0.2, texture: () => marble('beige'), repeat: 0.35 },
  'dark-stone': { hex: '#33343a', rough: 0.3, texture: () => marble('dark'), repeat: 0.35 },
} as const;

const DECK = {
  travertine: { hex: '#cbbb9f', texture: () => paving('travertine') },
  limestone: { hex: '#d2cdc1', texture: () => paving('limestone') },
  'dark-stone': { hex: '#44423f', texture: () => paving('dark-stone') },
} as const;

const SOFA = {
  beige: { hex: '#c9b79c', sheen: 0.6, rough: 0.85 },
  cream: { hex: '#e4dccc', sheen: 0.8, rough: 0.9 },
  charcoal: { hex: '#4a4845', sheen: 0.5, rough: 0.8 },
  brown: { hex: '#6f4f3a', sheen: 0.15, rough: 0.45 },
} as const;

const METAL = {
  black: { hex: '#1f2022', rough: 0.45, metal: 0.6 },
  steel: { hex: '#b4b8bd', rough: 0.3, metal: 1 },
  bronze: { hex: '#8a6a44', rough: 0.35, metal: 1 },
} as const;

const WALL = { 'warm-white': '#efeae1', sand: '#d9cbb5', grey: '#bcbab5' } as const;
const FRAME = { charcoal: '#2e2f31', bronze: '#7a5c3a' } as const;
const WATER = { light: '#a9dee7', deep: '#3f97ad' } as const;
/** A pool takes its colour from the plaster it is lined with, not from the water. */
const POOL_BED = { light: '#cfe9ee', deep: '#2f93ad' } as const;

function physical(options: THREE.MeshPhysicalMaterialParameters): Tweened {
  const material = new THREE.MeshPhysicalMaterial(options) as Tweened;
  material.__target = material.color.clone();
  material.__pulse = 0;
  return material;
}

function setMap(material: THREE.MeshPhysicalMaterial, pair: { map: THREE.Texture; bump: THREE.Texture }, repeat: number | [number, number], bumpScale: number) {
  const [rx, ry] = Array.isArray(repeat) ? repeat : [repeat, repeat];
  // Each surface needs its own repeat, so the shared canvas is cloned per use.
  const map = pair.map.clone();
  map.needsUpdate = true;
  map.repeat.set(rx, ry);
  const bump = pair.bump.clone();
  bump.needsUpdate = true;
  bump.repeat.set(rx, ry);
  material.map?.dispose();
  material.bumpMap?.dispose();
  material.map = map;
  material.bumpMap = bump;
  // The same greyscale drives roughness, so polished veins and open pores catch light
  // differently. It is the cheapest step from "tinted plastic" to "material".
  material.roughnessMap = bump;
  material.bumpScale = bumpScale;
  material.needsUpdate = true;
}

export type Library = ReturnType<typeof createLibrary>;

export function createLibrary(quality: 'high' | 'low') {
  const glass = physical({
    color: '#ffffff',
    roughness: 0.02,
    metalness: 0,
    transmission: quality === 'high' ? 0.96 : 0,
    thickness: 0.02,
    ior: 1.5,
    transparent: quality !== 'high',
    opacity: quality === 'high' ? 1 : 0.22,
    side: THREE.DoubleSide,
    envMapIntensity: 1.4,
  });

  const water = physical({
    color: WATER.deep,
    metalness: 0,
    transmission: 0,
    transparent: true,
    opacity: 0.62,
    ior: 1.33,
    normalMap: ripple(),
    roughness: 0.075,
    normalScale: new THREE.Vector2(0.26, 0.26),
    envMapIntensity: 1.5,
  });
  if (water.normalMap) {
    water.normalMap.wrapS = water.normalMap.wrapT = THREE.RepeatWrapping;
    water.normalMap.repeat.set(4, 4);
  }

  const library = {
    facade: physical({ color: FACADE['warm-stone'].hex, roughness: 0.76 }),
    soffit: physical({ color: '#e8e2d6', roughness: 0.88 }),
    concrete: physical({ color: '#c3beb4', roughness: 0.8 }),
    frame: physical({ color: FRAME.charcoal, roughness: 0.35, metalness: 0.9 }),
    glass,
    water,
    deck: physical({ color: DECK.travertine.hex, roughness: 0.62 }),
    floor: physical({ color: FLOOR['light-oak'].hex, roughness: 0.45, clearcoat: 0.18, clearcoatRoughness: 0.4 }),
    wall: physical({ color: WALL['warm-white'], roughness: 0.92 }),
    ceiling: physical({ color: '#f4f1eb', roughness: 0.95 }),
    cabinet: physical({ color: CABINET['natural-oak'].hex, roughness: 0.45 }),
    counter: physical({ color: COUNTER['white-marble'].hex, roughness: 0.09, clearcoat: 0.6 }),
    metal: physical({ color: METAL.bronze.hex, roughness: 0.35, metalness: 1, envMapIntensity: 1.3 }),
    sofa: physical({ color: SOFA.beige.hex, roughness: 0.85, sheen: 0.6, sheenColor: new THREE.Color('#ffffff'), sheenRoughness: 0.6 }),
    timber: physical({ color: '#4a3327', roughness: 0.4 }),
    foliage: physical({ color: '#56674f', roughness: 0.95, side: THREE.DoubleSide }),
    trunk: physical({ color: '#6b5f4e', roughness: 0.95 }),
    gravel: physical({ color: '#8f887c', roughness: 1 }),
    poolBed: physical({ color: POOL_BED.deep, roughness: 0.55 }),
    lawn: physical({ color: '#6c7d59', roughness: 1 }),
    rug: physical({ color: '#ddd3c2', roughness: 0.95, sheen: 0.4 }),
    dark: physical({ color: '#26262a', roughness: 0.6 }),
  };

  // Surfaces that never change still need a material, not a tint.
  setMap(library.concrete, stone('concrete'), 0.16, 0.03);
  setMap(library.gravel, stone('concrete'), 26, 0.06);
  setMap(library.soffit, plaster('#e8e2d6'), 0.3, 0.02);
  setMap(library.ceiling, plaster('#f4f1eb'), 0.25, 0.012);
  setMap(library.rug, fabric('#ddd3c2'), 4, 0.03);
  setMap(library.timber, wood('walnut'), 1.2, 0.02);

  /** Applied once at build time and whenever a choice changes. */
  function apply(spec: Spec, { immediate = false } = {}) {
    const target = (material: Tweened, hex: string) => {
      material.__target = new THREE.Color(hex);
      if (immediate) material.color.copy(material.__target);
      else material.__pulse = 1;
    };

    const facade = FACADE[spec.facade];
    setMap(library.facade, facade.texture(), facade.repeat, 0.04);
    library.facade.roughness = facade.rough;
    target(library.facade, facade.hex);

    target(library.frame, FRAME[spec.frames]);
    library.frame.metalness = spec.frames === 'bronze' ? 1 : 0.9;

    target(library.water, WATER[spec.water]);
    target(library.poolBed, POOL_BED[spec.water]);

    const deck = DECK[spec.deck];
    setMap(library.deck, deck.texture(), 0.25, 0.05);
    target(library.deck, deck.hex);

    const floor = FLOOR[spec.floor];
    setMap(library.floor, floor.texture(), floor.repeat as [number, number], floor.clearcoat > 0.5 ? 0.008 : 0.02);
    library.floor.roughness = floor.rough;
    library.floor.clearcoat = floor.clearcoat;
    target(library.floor, floor.hex);

    setMap(library.wall, plaster(WALL[spec.walls]), 0.3, 0.015);
    target(library.wall, WALL[spec.walls]);

    const cabinet = CABINET[spec.cabinet];
    setMap(library.cabinet, cabinet.texture(), cabinet.repeat, 0.02);
    library.cabinet.roughness = cabinet.rough;
    target(library.cabinet, cabinet.hex);

    const counter = COUNTER[spec.counter];
    setMap(library.counter, counter.texture(), counter.repeat, 0.006);
    library.counter.roughness = counter.rough;
    target(library.counter, counter.hex);

    const metal = METAL[spec.accent];
    library.metal.roughness = metal.rough;
    library.metal.metalness = metal.metal;
    target(library.metal, metal.hex);

    const sofa = SOFA[spec.sofa];
    setMap(library.sofa, fabric(sofa.hex), 3, 0.02);
    library.sofa.sheen = sofa.sheen;
    library.sofa.roughness = sofa.rough;
    library.sofa.clearcoat = spec.sofa === 'brown' ? 0.35 : 0;
    target(library.sofa, sofa.hex);
  }

  /** Called every frame: eases colours toward their target and fades the change sheen. */
  function update(delta: number) {
    const ease = 1 - Math.pow(0.001, delta);
    for (const material of Object.values(library) as Tweened[]) {
      if (material.__target && !material.color.equals(material.__target)) material.color.lerp(material.__target, ease);
      if (material.__pulse && material.__pulse > 0) {
        material.__pulse = Math.max(0, material.__pulse - delta * 1.6);
        const value = Math.sin(material.__pulse * Math.PI) * 0.05;
        material.emissive.setRGB(value, value * 0.95, value * 0.85);
      }
    }
  }

  function dispose() {
    for (const material of Object.values(library)) {
      material.map?.dispose();
      material.bumpMap?.dispose();
      material.dispose();
    }
  }

  return { ...library, apply, update, dispose };
}

/** Warms the alternatives after first paint, so switching a finish never stutters. */
export function prewarm() {
  const idle = (callback: () => void) => ('requestIdleCallback' in window ? window.requestIdleCallback(callback, { timeout: 4000 }) : setTimeout(callback, 1200));
  const jobs: (() => void)[] = [
    () => wood('dark-oak'),
    () => wood('walnut'),
    () => wood('light-oak'),
    () => marble('beige'),
    () => marble('dark'),
    () => stone('travertine'),
    () => stone('concrete'),
    () => paving('limestone'),
    () => paving('dark-stone'),
  ];
  const run = () => {
    const job = jobs.shift();
    if (!job) return;
    job();
    idle(run);
  };
  idle(run);
}
