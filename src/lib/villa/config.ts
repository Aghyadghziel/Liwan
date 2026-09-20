'use client';

import { useSyncExternalStore } from 'react';

/**
 * The residence specification. Only choices an architect would actually offer are here:
 * a short, curated list per surface, not a paint chart.
 */

export type Choice = { id: string; label: string; note: string; swatch: string };

export type Group = {
  id: keyof Spec;
  room: 'exterior' | 'landscape' | 'living' | 'kitchen';
  label: string;
  question: string;
  choices: Choice[];
};

export type Spec = {
  facade: 'white' | 'warm-stone' | 'sand' | 'charcoal';
  frames: 'charcoal' | 'bronze';
  water: 'light' | 'deep';
  deck: 'travertine' | 'limestone' | 'dark-stone';
  floor: 'light-oak' | 'dark-oak' | 'marble' | 'travertine';
  cabinet: 'white' | 'walnut' | 'charcoal' | 'natural-oak';
  counter: 'white-marble' | 'beige-stone' | 'dark-stone';
  accent: 'black' | 'steel' | 'bronze';
  sofa: 'beige' | 'cream' | 'charcoal' | 'brown';
  walls: 'warm-white' | 'sand' | 'grey';
  light: 'warm' | 'neutral';
};

export const DEFAULT_SPEC: Spec = {
  facade: 'warm-stone',
  frames: 'charcoal',
  water: 'deep',
  deck: 'travertine',
  floor: 'light-oak',
  cabinet: 'natural-oak',
  counter: 'white-marble',
  accent: 'bronze',
  sofa: 'beige',
  walls: 'warm-white',
  light: 'warm',
};

export const GROUPS: Group[] = [
  {
    id: 'facade',
    room: 'exterior',
    label: 'Facade',
    question: 'Wall finish',
    choices: [
      { id: 'white', label: 'White', note: 'Lime render', swatch: '#e8e4dc' },
      { id: 'warm-stone', label: 'Warm stone', note: 'Sawn limestone', swatch: '#c6b193' },
      { id: 'sand', label: 'Sand', note: 'Mineral plaster', swatch: '#d8c4a3' },
      { id: 'charcoal', label: 'Dark charcoal', note: 'Board-marked concrete', swatch: '#3a3a38' },
    ],
  },
  {
    id: 'frames',
    room: 'exterior',
    label: 'Frames',
    question: 'Window frames',
    choices: [
      { id: 'charcoal', label: 'Charcoal', note: 'Anodised aluminium', swatch: '#2e2f31' },
      { id: 'bronze', label: 'Bronze', note: 'Patinated bronze', swatch: '#7a5c3a' },
    ],
  },
  {
    id: 'water',
    room: 'landscape',
    label: 'Pool',
    question: 'Water',
    choices: [
      { id: 'light', label: 'Light blue', note: 'Pale plaster bed', swatch: '#79b7c4' },
      { id: 'deep', label: 'Deep blue', note: 'Dark plaster bed', swatch: '#1e5f74' },
    ],
  },
  {
    id: 'deck',
    room: 'landscape',
    label: 'Deck',
    question: 'Paving',
    choices: [
      { id: 'travertine', label: 'Travertine', note: 'Vein cut, honed', swatch: '#cbbb9f' },
      { id: 'limestone', label: 'Limestone', note: 'Bush hammered', swatch: '#d2cdc1' },
      { id: 'dark-stone', label: 'Dark stone', note: 'Flamed basalt', swatch: '#44423f' },
    ],
  },
  {
    id: 'floor',
    room: 'living',
    label: 'Floor',
    question: 'Interior floor',
    choices: [
      { id: 'light-oak', label: 'Light oak', note: 'Wide plank, oiled', swatch: '#c9b18d' },
      { id: 'dark-oak', label: 'Dark oak', note: 'Smoked, brushed', swatch: '#6b5540' },
      { id: 'marble', label: 'Marble', note: 'Book matched slab', swatch: '#eceae5' },
      { id: 'travertine', label: 'Travertine', note: 'Filled and honed', swatch: '#cbbb9f' },
    ],
  },
  {
    id: 'walls',
    room: 'living',
    label: 'Walls',
    question: 'Wall tone',
    choices: [
      { id: 'warm-white', label: 'Warm white', note: 'Lime wash', swatch: '#efeae1' },
      { id: 'sand', label: 'Sand', note: 'Clay plaster', swatch: '#d9cbb5' },
      { id: 'grey', label: 'Grey', note: 'Mineral silicate', swatch: '#b8b6b1' },
    ],
  },
  {
    id: 'sofa',
    room: 'living',
    label: 'Sofa',
    question: 'Upholstery',
    choices: [
      { id: 'beige', label: 'Beige', note: 'Belgian linen', swatch: '#c9b79c' },
      { id: 'cream', label: 'Cream', note: 'Bouclé wool', swatch: '#e4dccc' },
      { id: 'charcoal', label: 'Charcoal', note: 'Brushed cotton', swatch: '#4a4845' },
      { id: 'brown', label: 'Brown', note: 'Aniline leather', swatch: '#6f4f3a' },
    ],
  },
  {
    id: 'light',
    room: 'living',
    label: 'Light',
    question: 'Lighting temperature',
    choices: [
      { id: 'warm', label: 'Warm', note: '2700K', swatch: '#f0c68a' },
      { id: 'neutral', label: 'Neutral', note: '3500K', swatch: '#e6e6e2' },
    ],
  },
  {
    id: 'cabinet',
    room: 'kitchen',
    label: 'Cabinets',
    question: 'Cabinet finish',
    choices: [
      { id: 'white', label: 'White', note: 'Matt lacquer', swatch: '#e9e6e0' },
      { id: 'walnut', label: 'Walnut', note: 'Crown cut veneer', swatch: '#4a3327' },
      { id: 'charcoal', label: 'Charcoal', note: 'Fenix laminate', swatch: '#35363a' },
      { id: 'natural-oak', label: 'Natural oak', note: 'Rift sawn', swatch: '#b2946b' },
    ],
  },
  {
    id: 'counter',
    room: 'kitchen',
    label: 'Countertop',
    question: 'Worktop',
    choices: [
      { id: 'white-marble', label: 'White marble', note: 'Calacatta, 20mm', swatch: '#f0eeea' },
      { id: 'beige-stone', label: 'Beige stone', note: 'Breccia, honed', swatch: '#ded2bd' },
      { id: 'dark-stone', label: 'Dark stone', note: 'Nero, leathered', swatch: '#33343a' },
    ],
  },
  {
    id: 'accent',
    room: 'kitchen',
    label: 'Accents',
    question: 'Metal',
    choices: [
      { id: 'black', label: 'Black', note: 'Powder coat', swatch: '#1f2022' },
      { id: 'steel', label: 'Brushed steel', note: 'Stainless, satin', swatch: '#a9adb2' },
      { id: 'bronze', label: 'Bronze', note: 'Living finish', swatch: '#8a6a44' },
    ],
  },
];

/* ── Store ────────────────────────────────────────────────
   Deliberately tiny: the 3D scene subscribes without re-rendering React. */

type Listener = () => void;

let spec: Spec = { ...DEFAULT_SPEC };
const listeners = new Set<Listener>();

export function setOption<K extends keyof Spec>(key: K, value: Spec[K]) {
  if (spec[key] === value) return;
  spec = { ...spec, [key]: value };
  for (const listener of listeners) listener();
}

export function resetSpec() {
  spec = { ...DEFAULT_SPEC };
  for (const listener of listeners) listener();
}

export function getSpec() {
  return spec;
}

export function subscribeSpec(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSpec() {
  return useSyncExternalStore(subscribeSpec, getSpec, () => DEFAULT_SPEC);
}

/** Rooms the camera can be taken to, in the order the tour visits them. */
export const ROOMS = [
  { id: 'residence', label: 'Residence', hint: 'The whole house' },
  { id: 'exterior', label: 'Exterior', hint: 'Facade and frames' },
  { id: 'living', label: 'Living', hint: 'Floor, walls, sofa' },
  { id: 'kitchen', label: 'Kitchen', hint: 'Cabinets, stone, metal' },
  { id: 'landscape', label: 'Pool', hint: 'Water and paving' },
] as const;

export type RoomId = (typeof ROOMS)[number]['id'];
