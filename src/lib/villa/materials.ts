'use client';

import * as THREE from 'three';
import { boardConcrete, cladding, fabric, grassTuft, gravel, lawn, leafSpray, marble, palmFrond, paving, plaster, ripple, stone, wood, type Pair } from './textures';
import type { Spec } from './config';

/**
 * One library of physical materials, created once and mutated in place. Changing a finish
 * never rebuilds the scene: the map is swapped and the colour is eased over a few frames.
 *
 * Every map is laid at its real size — textures know how many metres they cover, and all
 * geometry carries UVs in metres — so a plank is 200 mm wide whether it is on the floor or on
 * a stair tread.
 */

type Tweened = THREE.MeshPhysicalMaterial & { __target?: THREE.Color };

const FACADE = {
  white: { hex: '#ebe7df', rough: 0.9, texture: () => plaster('#ebe7df'), bump: 0.012 },
  'warm-stone': { hex: '#ffffff', rough: 0.82, texture: () => cladding('limestone'), bump: 0.02 },
  sand: { hex: '#d9c6a6', rough: 0.92, texture: () => plaster('#d9c6a6'), bump: 0.014 },
  charcoal: { hex: '#ffffff', rough: 0.78, texture: () => boardConcrete(), bump: 0.03 },
} as const;

const FLOOR = {
  'light-oak': { rough: 0.5, clearcoat: 0.06, texture: () => wood('light-oak', { planks: true }), bump: 0.006 },
  'dark-oak': { rough: 0.48, clearcoat: 0.08, texture: () => wood('dark-oak', { planks: true }), bump: 0.006 },
  marble: { rough: 0.16, clearcoat: 0.5, texture: () => marble('white'), bump: 0.002 },
  travertine: { rough: 0.5, clearcoat: 0.04, texture: () => paving('travertine'), bump: 0.008 },
} as const;

const CABINET = {
  white: { hex: '#e9e6e0', rough: 0.55, texture: null },
  walnut: { hex: '#ffffff', rough: 0.46, texture: () => wood('walnut') },
  charcoal: { hex: '#37383b', rough: 0.62, texture: null },
  'natural-oak': { hex: '#ffffff', rough: 0.5, texture: () => wood('natural-oak') },
} as const;

const COUNTER = {
  'white-marble': { rough: 0.18, texture: () => marble('white') },
  'beige-stone': { rough: 0.3, texture: () => marble('beige') },
  'dark-stone': { rough: 0.42, texture: () => marble('dark') },
} as const;

const DECK = {
  travertine: () => paving('travertine'),
  limestone: () => paving('limestone'),
  'dark-stone': () => paving('dark-stone'),
} as const;

const SOFA = {
  beige: { hex: '#c9b79c', sheen: 0.5, rough: 0.92, leather: false },
  cream: { hex: '#e2d9c8', sheen: 0.7, rough: 0.95, leather: false },
  charcoal: { hex: '#4d4b48', sheen: 0.4, rough: 0.9, leather: false },
  brown: { hex: '#6b4a36', sheen: 0.1, rough: 0.5, leather: true },
} as const;

const METAL = {
  black: { hex: '#232426', rough: 0.5, metal: 0.55 },
  steel: { hex: '#b2b6bb', rough: 0.34, metal: 1 },
  bronze: { hex: '#8c6b45', rough: 0.4, metal: 1 },
} as const;

const DOOR = {
  walnut: { hex: '#ffffff', rough: 0.5, metal: 0, texture: () => wood('walnut') },
  oak: { hex: '#ffffff', rough: 0.55, metal: 0, texture: () => wood('natural-oak') },
  bronze: { hex: '#77593a', rough: 0.46, metal: 1, texture: null },
  charcoal: { hex: '#2d2e30', rough: 0.58, metal: 0.4, texture: null },
} as const;

const WALL = { 'warm-white': '#eee9df', sand: '#d9cbb5', grey: '#bcbab5' } as const;
const FRAME = { charcoal: '#2c2d2f', bronze: '#735637' } as const;
/** A pool takes its colour from the plaster it is lined with, not from the water. */
const POOL_BED = { light: '#cfe9ee', deep: '#2f93ad' } as const;

function physical(options: THREE.MeshPhysicalMaterialParameters): Tweened {
  const material = new THREE.MeshPhysicalMaterial(options) as Tweened;
  material.__target = material.color.clone();
  return material;
}

/** Stands in wherever a finish has no texture, so a cross-fading material always has a map. */
const WHITE = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
WHITE.colorSpace = THREE.SRGBColorSpace;
WHITE.needsUpdate = true;

type Fade = { uPrevMap: { value: THREE.Texture }; uPrevScale: { value: THREE.Vector2 }; uMix: { value: number }; progress: number };

/**
 * Lets a material dissolve from its previous map into its new one. A finish that snaps from
 * oak to marble in one frame reads as software; one that turns over in under a second reads
 * as a sample being laid over another.
 */
function crossfade(material: THREE.MeshPhysicalMaterial) {
  const fade: Fade = { uPrevMap: { value: WHITE }, uPrevScale: { value: new THREE.Vector2(1, 1) }, uMix: { value: 1 }, progress: 1 };
  material.userData.fade = fade;
  material.map = WHITE;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uPrevMap = fade.uPrevMap;
    shader.uniforms.uPrevScale = fade.uPrevScale;
    shader.uniforms.uMix = fade.uMix;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <map_pars_fragment>', '#include <map_pars_fragment>\nuniform sampler2D uPrevMap;\nuniform vec2 uPrevScale;\nuniform float uMix;')
      .replace(
        '#include <map_fragment>',
        `#ifdef USE_MAP
          vec4 texelNew = texture2D( map, vMapUv );
          vec4 texelOld = texture2D( uPrevMap, vMapUv * uPrevScale );
          diffuseColor *= mix( texelOld, texelNew, uMix );
        #endif`,
      );
  };
  material.customProgramCacheKey = () => 'liwan-crossfade';
  return material;
}

function setMap(material: THREE.MeshPhysicalMaterial, pair: Pair | null, bumpScale = 0.01, { stretch = 1, immediate = true }: { stretch?: number; immediate?: boolean } = {}) {
  const fade = material.userData.fade as Fade | undefined;
  const previous = material.map;
  const previousRepeat = previous && previous !== WHITE ? previous.repeat.x : 1;

  let map: THREE.Texture = WHITE;
  let bump: THREE.Texture | null = null;
  let repeat = 1;
  if (pair) {
    // Each surface needs its own repeat, so the shared canvas is cloned per use.
    repeat = 1 / (pair.tile * stretch);
    map = pair.map.clone();
    map.repeat.set(repeat, repeat);
    map.needsUpdate = true;
    bump = pair.bump.clone();
    bump.repeat.set(repeat, repeat);
    bump.needsUpdate = true;
  }

  if (fade && previous && !immediate) {
    // Keep the outgoing map alive for the length of the dissolve.
    const stale = fade.uPrevMap.value;
    if (stale !== WHITE && stale !== previous) stale.dispose();
    fade.uPrevMap.value = previous;
    fade.uPrevScale.value.setScalar(previousRepeat / repeat);
    fade.uMix.value = 0;
    fade.progress = 0;
  } else if (previous && previous !== WHITE) {
    previous.dispose();
  }

  material.bumpMap?.dispose();
  const hadBump = Boolean(material.bumpMap);
  material.map = fade || pair ? map : null;
  material.bumpMap = bump;
  material.bumpScale = bumpScale;
  // Only a change in which maps exist needs a recompile; swapping one for another does not.
  if (hadBump !== Boolean(bump) || Boolean(previous) !== Boolean(material.map)) material.needsUpdate = true;
}

export type Library = ReturnType<typeof createLibrary>;

export function createLibrary(quality: 'high' | 'low') {
  // Glass on site is never invisible: it carries a faint green-grey body and a full reflection
  // of the sky. Refraction is kept for capable devices only.
  const glass = physical({
    color: '#ffffff',
    roughness: 0.03,
    metalness: 0,
    transmission: quality === 'high' ? 1 : 0,
    thickness: 0.03,
    ior: 1.52,
    attenuationColor: new THREE.Color('#cfdcd6'),
    attenuationDistance: 0.6,
    transparent: quality !== 'high',
    opacity: quality === 'high' ? 1 : 0.24,
    side: THREE.DoubleSide,
    envMapIntensity: 0.85,
    specularIntensity: 1,
  });

  const water = physical({
    color: '#27343a',
    transparent: true,
    opacity: 0.88,
    ior: 1.33,
    normalMap: ripple(),
    roughness: 0.06,
    normalScale: new THREE.Vector2(0.2, 0.2),
    envMapIntensity: 1.2,
  });
  if (water.normalMap) water.normalMap.repeat.set(3, 3);

  const cut = (map: THREE.Texture, colour = '#ffffff') =>
    physical({ color: colour, map, alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.78, metalness: 0, envMapIntensity: 0.35, shadowSide: THREE.DoubleSide });

  const library = {
    facade: physical({ color: '#ffffff', roughness: 0.82, envMapIntensity: 0.5 }),
    boundary: physical({ color: '#ffffff', roughness: 0.94, envMapIntensity: 0.4 }),
    soffit: physical({ color: '#ffffff', roughness: 0.92, envMapIntensity: 0.4 }),
    concrete: physical({ color: '#ffffff', roughness: 0.84, envMapIntensity: 0.45 }),
    roofTop: physical({ color: '#ffffff', roughness: 1, envMapIntensity: 0.2 }),
    frame: physical({ color: FRAME.charcoal, roughness: 0.42, metalness: 0.85, envMapIntensity: 0.9 }),
    glass,
    water,
    deck: physical({ color: '#ffffff', roughness: 0.7, envMapIntensity: 0.5 }),
    floor: physical({ color: '#ffffff', roughness: 0.5, clearcoat: 0.06, clearcoatRoughness: 0.5, envMapIntensity: 0.45 }),
    wall: physical({ color: '#ffffff', roughness: 0.94, envMapIntensity: 0.25 }),
    ceiling: physical({ color: '#ffffff', roughness: 0.96, envMapIntensity: 0.22 }),
    cabinet: physical({ color: '#ffffff', roughness: 0.5, envMapIntensity: 0.6 }),
    counter: physical({ color: '#ffffff', roughness: 0.18, clearcoat: 0.25, clearcoatRoughness: 0.3, envMapIntensity: 0.8 }),
    metal: physical({ color: METAL.bronze.hex, roughness: 0.4, metalness: 1, envMapIntensity: 1 }),
    sofa: physical({ color: '#ffffff', roughness: 0.92, sheen: 0.5, sheenColor: new THREE.Color('#fff6e8'), sheenRoughness: 0.7, envMapIntensity: 0.4 }),
    cushion: physical({ color: '#ffffff', roughness: 0.95, sheen: 0.6, sheenColor: new THREE.Color('#ffffff'), sheenRoughness: 0.7, envMapIntensity: 0.4 }),
    timber: physical({ color: '#ffffff', roughness: 0.5, envMapIntensity: 0.6 }),
    door: physical({ color: '#ffffff', roughness: 0.5, envMapIntensity: 0.7 }),
    curtain: physical({ color: '#efeae0', roughness: 1, transparent: true, opacity: 0.8, side: THREE.DoubleSide, sheen: 0.5, sheenColor: new THREE.Color('#ffffff'), envMapIntensity: 0.3, depthWrite: false }),
    // Acid-etched glass for the street side: it passes light and keeps the house private.
    frosted: physical({ color: '#e3e9ea', roughness: 0.55, emissive: new THREE.Color('#cfdbe2'), emissiveIntensity: 0.55, envMapIntensity: 0.5, side: THREE.DoubleSide }),
    appliance: physical({ color: '#141516', roughness: 0.12, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1 }),
    lamp: physical({ color: '#fff3df', emissive: new THREE.Color('#ffd9a6'), emissiveIntensity: 2.4, roughness: 0.6, toneMapped: true }),
    shade: physical({ color: '#ece4d4', roughness: 0.95, emissive: new THREE.Color('#ffdcae'), emissiveIntensity: 0.5, side: THREE.DoubleSide }),
    ceramic: physical({ color: '#e7e1d5', roughness: 0.55, envMapIntensity: 0.6 }),
    book: physical({ color: '#8d8272', roughness: 0.85 }),
    trunk: physical({ color: '#6f6250', roughness: 0.97, envMapIntensity: 0.3 }),
    palmTrunk: physical({ color: '#7a6a55', roughness: 1, envMapIntensity: 0.25 }),
    olive: cut(leafSpray('olive')),
    shrub: cut(leafSpray('shrub')),
    frond: cut(palmFrond()),
    grass: cut(grassTuft()),
    gravel: physical({ color: '#ffffff', roughness: 1, envMapIntensity: 0.3 }),
    soil: physical({ color: '#4d4337', roughness: 1 }),
    poolBed: physical({ color: POOL_BED.deep, roughness: 0.6 }),
    lawn: physical({ color: '#ffffff', roughness: 1, envMapIntensity: 0.25 }),
    rug: physical({ color: '#ffffff', roughness: 1, sheen: 0.5, sheenColor: new THREE.Color('#ffffff'), envMapIntensity: 0.3 }),
    art: physical({ color: '#ffffff', roughness: 0.9 }),
    dark: physical({ color: '#1e1e20', roughness: 0.7, envMapIntensity: 0.4 }),
  };

  // Surfaces that never change still need a material, not a tint.
  setMap(library.concrete, stone('concrete'), 0.012);
  setMap(library.roofTop, gravel(), 0.04, { stretch: 0.6 });
  setMap(library.gravel, gravel(), 0.05);
  setMap(library.lawn, lawn(), 0.03);
  setMap(library.boundary, plaster('#ddd3c0'), 0.014);
  setMap(library.soffit, plaster('#e6e0d4'), 0.008);
  setMap(library.ceiling, plaster('#f1eee8'), 0.006);
  setMap(library.rug, fabric('#c9bfad'), 0.02, { stretch: 1.6 });
  setMap(library.cushion, fabric('#ddd3c1'), 0.012);
  setMap(library.art, fabric('#cfc4b0'), 0.01, { stretch: 2 });
  setMap(library.timber, wood('walnut'), 0.004);
  library.roofTop.color.set('#aaa69c');

  // The finishes a visitor can change dissolve from one to the next.
  for (const material of [library.facade, library.deck, library.floor, library.wall, library.cabinet, library.counter, library.door, library.sofa]) crossfade(material);

  /** Applied once at build time and whenever a choice changes. */
  let last: Spec | null = null;

  function apply(spec: Spec, { immediate = false } = {}) {
    const previous = last;
    last = spec;
    // Only the surfaces whose choice changed are touched; the rest keep their maps.
    const changed = (key: keyof Spec) => immediate || !previous || previous[key] !== spec[key];

    const target = (material: Tweened, hex: string) => {
      material.__target = new THREE.Color(hex);
      if (immediate) material.color.copy(material.__target);
    };

    if (changed('facade')) {
      const facade = FACADE[spec.facade];
      setMap(library.facade, facade.texture(), facade.bump, { immediate });
      library.facade.roughness = facade.rough;
      target(library.facade, facade.hex);
    }

    if (changed('frames')) {
      target(library.frame, FRAME[spec.frames]);
      library.frame.metalness = spec.frames === 'bronze' ? 1 : 0.85;
    }

    if (changed('door')) {
      const door = DOOR[spec.door];
      setMap(library.door, door.texture ? door.texture() : null, 0.004, { immediate });
      library.door.roughness = door.rough;
      library.door.metalness = door.metal;
      target(library.door, door.hex);
    }

    target(library.poolBed, POOL_BED[spec.water]);

    if (changed('deck')) {
      setMap(library.deck, DECK[spec.deck](), 0.012, { immediate });
      target(library.deck, '#ffffff');
    }

    if (changed('floor')) {
      const floor = FLOOR[spec.floor];
      setMap(library.floor, floor.texture(), floor.bump, { immediate });
      library.floor.roughness = floor.rough;
      library.floor.clearcoat = floor.clearcoat;
      target(library.floor, '#ffffff');
    }

    if (changed('walls')) {
      setMap(library.wall, plaster(WALL[spec.walls]), 0.006, { immediate });
      target(library.wall, '#ffffff');
    }

    if (changed('cabinet')) {
      const cabinet = CABINET[spec.cabinet];
      setMap(library.cabinet, cabinet.texture ? cabinet.texture() : null, 0.003, { immediate });
      library.cabinet.roughness = cabinet.rough;
      target(library.cabinet, cabinet.hex);
    }

    if (changed('counter')) {
      const counter = COUNTER[spec.counter];
      setMap(library.counter, counter.texture(), 0.002, { immediate });
      library.counter.roughness = counter.rough;
      target(library.counter, '#ffffff');
    }

    const metal = METAL[spec.accent];
    library.metal.roughness = metal.rough;
    library.metal.metalness = metal.metal;
    target(library.metal, metal.hex);

    if (changed('sofa')) {
      const sofa = SOFA[spec.sofa];
      setMap(library.sofa, sofa.leather ? null : fabric(sofa.hex), 0.012, { immediate });
      library.sofa.sheen = sofa.sheen;
      library.sofa.roughness = sofa.rough;
      library.sofa.clearcoat = sofa.leather ? 0.25 : 0;
      library.sofa.clearcoatRoughness = 0.55;
      target(library.sofa, sofa.leather ? sofa.hex : '#ffffff');
    }

    const warm = spec.light === 'warm';
    library.lamp.emissive.set(warm ? '#ffd39a' : '#f4f1ea');
    library.shade.emissive.set(warm ? '#ffdcae' : '#f3f0e8');
  }

  /** Called every frame: eases colours toward their target and advances any dissolve. */
  function update(delta: number) {
    const ease = 1 - Math.pow(0.001, delta);
    for (const material of Object.values(library) as Tweened[]) {
      if (material.__target && !material.color.equals(material.__target)) material.color.lerp(material.__target, ease);
      const fade = material.userData.fade as Fade | undefined;
      if (fade && fade.progress < 1) {
        fade.progress = Math.min(1, fade.progress + delta / 0.85);
        const t = fade.progress;
        fade.uMix.value = t * t * (3 - 2 * t);
        if (fade.progress === 1 && fade.uPrevMap.value !== WHITE) {
          fade.uPrevMap.value.dispose();
          fade.uPrevMap.value = WHITE;
        }
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
    () => wood('dark-oak', { planks: true }),
    () => wood('natural-oak'),
    () => marble('beige'),
    () => marble('dark'),
    () => paving('limestone'),
    () => paving('dark-stone'),
    () => boardConcrete(),
    () => plaster('#ebe7df'),
    () => plaster('#d9c6a6'),
  ];
  const run = () => {
    const job = jobs.shift();
    if (!job) return;
    job();
    idle(run);
  };
  idle(run);
}
