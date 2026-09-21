'use client';

import { useSyncExternalStore } from 'react';
import type { T } from '@/lib/i18n';

const L = (ar: string, en: string): T => ({ ar, en });

/**
 * The residence specification. Only choices an architect would actually offer are here:
 * a short, curated list per surface, not a paint chart.
 */

export type Choice = { id: string; label: T; note: T; swatch: string };

export type Group = {
  id: keyof Spec;
  room: 'exterior' | 'landscape' | 'living' | 'kitchen';
  label: T;
  question: T;
  /** Where the camera should go to see this surface, when it is not the room's own shot. */
  shot?: 'entrance';
  /** A closer shot used only by the phone panel, where the room shot leaves the surface too small. */
  phoneShot?: 'floor';
  choices: Choice[];
};

export type Spec = {
  facade: 'white' | 'warm-stone' | 'sand' | 'charcoal';
  frames: 'charcoal' | 'bronze';
  door: 'walnut' | 'oak' | 'bronze' | 'charcoal';
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
  door: 'walnut',
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
    label: L('الواجهة', 'Facade'),
    question: L('تشطيب الجدران الخارجية', 'Exterior wall finish'),
    choices: [
      { id: 'white', label: L('أبيض', 'White'), note: L('لياسة جيرية', 'Lime render'), swatch: '#e8e4dc' },
      { id: 'warm-stone', label: L('حجر دافئ', 'Warm stone'), note: L('حجر جيري منشور', 'Sawn limestone'), swatch: '#c6b193' },
      { id: 'sand', label: L('رملي', 'Sand'), note: L('لياسة معدنية', 'Mineral render'), swatch: '#d8c4a3' },
      { id: 'charcoal', label: L('فحمي داكن', 'Dark charcoal'), note: L('خرسانة ظاهرة', 'Board-marked concrete'), swatch: '#3a3a38' },
    ],
  },
  {
    id: 'frames',
    room: 'exterior',
    label: L('الإطارات', 'Frames'),
    question: L('لون إطارات النوافذ', 'Window frame colour'),
    choices: [
      { id: 'charcoal', label: L('فحمي', 'Charcoal'), note: L('ألمنيوم مؤكسد', 'Anodised aluminium'), swatch: '#2e2f31' },
      { id: 'bronze', label: L('برونزي', 'Bronze'), note: L('برونز معتّق', 'Patinated bronze'), swatch: '#7a5c3a' },
    ],
  },
  {
    id: 'door',
    room: 'exterior',
    shot: 'entrance',
    label: L('الباب', 'Door'),
    question: L('تشطيب باب المدخل', 'Entrance door finish'),
    choices: [
      { id: 'walnut', label: L('جوز', 'Walnut'), note: L('ألواح رأسية مزيّتة', 'Vertical boards, oiled'), swatch: '#4a3327' },
      { id: 'oak', label: L('بلوط', 'Oak'), note: L('بلوط طبيعي مزيّت', 'Natural oak, oiled'), swatch: '#b2946b' },
      { id: 'bronze', label: L('برونز', 'Bronze'), note: L('كسوة برونزية معتّقة', 'Patinated bronze cladding'), swatch: '#6f5535' },
      { id: 'charcoal', label: L('فحمي', 'Charcoal'), note: L('فولاذ مطلي مطفي', 'Matt coated steel'), swatch: '#2b2c2e' },
    ],
  },
  {
    id: 'water',
    room: 'landscape',
    label: L('المسبح', 'Pool'),
    question: L('لون الماء', 'Water'),
    choices: [
      { id: 'light', label: L('أزرق فاتح', 'Light blue'), note: L('بطانة فاتحة', 'Pale plaster bed'), swatch: '#79b7c4' },
      { id: 'deep', label: L('أزرق عميق', 'Deep blue'), note: L('بطانة داكنة', 'Dark plaster bed'), swatch: '#1e5f74' },
    ],
  },
  {
    id: 'deck',
    room: 'landscape',
    label: L('الشرفة', 'Terrace'),
    question: L('بلاط الشرفة', 'Paving'),
    choices: [
      { id: 'travertine', label: L('ترافرتين', 'Travertine'), note: L('مقطوع مع العرق، مطفي', 'Vein cut, honed'), swatch: '#cbbb9f' },
      { id: 'limestone', label: L('حجر جيري', 'Limestone'), note: L('مدقوق', 'Bush hammered'), swatch: '#d2cdc1' },
      { id: 'dark-stone', label: L('حجر داكن', 'Dark stone'), note: L('بازلت ملهّب', 'Flamed basalt'), swatch: '#44423f' },
    ],
  },
  {
    id: 'floor',
    room: 'living',
    phoneShot: 'floor',
    label: L('الأرضية', 'Floor'),
    question: L('الأرضية الداخلية', 'Interior flooring'),
    choices: [
      { id: 'light-oak', label: L('بلوط فاتح', 'Light oak'), note: L('ألواح عريضة مزيّتة', 'Wide plank, oiled'), swatch: '#c9b18d' },
      { id: 'dark-oak', label: L('بلوط داكن', 'Dark oak'), note: L('مدخَّن ومفرَّش', 'Smoked, brushed'), swatch: '#6b5540' },
      { id: 'marble', label: L('رخام', 'Marble'), note: L('ألواح متقابلة العروق', 'Book matched slab'), swatch: '#eceae5' },
      { id: 'travertine', label: L('ترافرتين', 'Travertine'), note: L('مملوء ومطفي', 'Filled and honed'), swatch: '#cbbb9f' },
    ],
  },
  {
    id: 'walls',
    room: 'living',
    label: L('الجدران', 'Walls'),
    question: L('لون الجدران الداخلية', 'Interior wall colour'),
    choices: [
      { id: 'warm-white', label: L('أبيض دافئ', 'Warm white'), note: L('دهان جيري', 'Lime wash'), swatch: '#efeae1' },
      { id: 'sand', label: L('رملي', 'Sand'), note: L('لياسة طينية', 'Clay plaster'), swatch: '#d9cbb5' },
      { id: 'grey', label: L('رمادي', 'Grey'), note: L('دهان سيليكات معدني', 'Mineral silicate'), swatch: '#b8b6b1' },
    ],
  },
  {
    id: 'sofa',
    room: 'living',
    label: L('الكنب', 'Sofa'),
    question: L('قماش الكنب', 'Upholstery'),
    choices: [
      { id: 'beige', label: L('بيج', 'Beige'), note: L('كتّان بلجيكي', 'Belgian linen'), swatch: '#c9b79c' },
      { id: 'cream', label: L('كريمي', 'Cream'), note: L('صوف بوكليه', 'Bouclé wool'), swatch: '#e4dccc' },
      { id: 'charcoal', label: L('فحمي', 'Charcoal'), note: L('قطن مفرَّش', 'Brushed cotton'), swatch: '#4a4845' },
      { id: 'brown', label: L('بنّي', 'Brown'), note: L('جلد أنيلين', 'Aniline leather'), swatch: '#6f4f3a' },
    ],
  },
  {
    id: 'light',
    room: 'living',
    label: L('الإضاءة', 'Light'),
    question: L('حرارة الإضاءة', 'Lighting temperature'),
    choices: [
      { id: 'warm', label: L('دافئة', 'Warm'), note: L('2700 كلفن', '2700K'), swatch: '#f0c68a' },
      { id: 'neutral', label: L('محايدة', 'Neutral'), note: L('3500 كلفن', '3500K'), swatch: '#e6e6e2' },
    ],
  },
  {
    id: 'cabinet',
    room: 'kitchen',
    label: L('الخزائن', 'Cabinets'),
    question: L('تشطيب خزائن المطبخ', 'Kitchen cabinet finish'),
    choices: [
      { id: 'white', label: L('أبيض', 'White'), note: L('لاكيه مطفي', 'Matt lacquer'), swatch: '#e9e6e0' },
      { id: 'walnut', label: L('جوز', 'Walnut'), note: L('قشرة جوز', 'Crown cut veneer'), swatch: '#4a3327' },
      { id: 'charcoal', label: L('فحمي', 'Charcoal'), note: L('سطح فينيكس مطفي', 'Fenix laminate'), swatch: '#35363a' },
      { id: 'natural-oak', label: L('بلوط طبيعي', 'Natural oak'), note: L('منشور طوليًا', 'Rift sawn'), swatch: '#b2946b' },
    ],
  },
  {
    id: 'counter',
    room: 'kitchen',
    label: L('سطح العمل', 'Countertop'),
    question: L('سطح العمل', 'Countertop'),
    choices: [
      { id: 'white-marble', label: L('رخام أبيض', 'White marble'), note: L('كالاكاتا، 20 مم', 'Calacatta, 20mm'), swatch: '#f0eeea' },
      { id: 'beige-stone', label: L('حجر بيج', 'Beige stone'), note: L('بريشيا مطفي', 'Breccia, honed'), swatch: '#ded2bd' },
      { id: 'dark-stone', label: L('حجر داكن', 'Dark stone'), note: L('أسود بملمس جلدي', 'Nero, leathered'), swatch: '#33343a' },
    ],
  },
  {
    id: 'accent',
    room: 'kitchen',
    label: L('المعادن', 'Metal'),
    question: L('لون التفاصيل المعدنية', 'Metal accents'),
    choices: [
      { id: 'black', label: L('أسود', 'Black'), note: L('طلاء بودرة', 'Powder coat'), swatch: '#1f2022' },
      { id: 'steel', label: L('فولاذ مصقول', 'Brushed steel'), note: L('ستانلس ساتان', 'Stainless, satin'), swatch: '#a9adb2' },
      { id: 'bronze', label: L('برونز', 'Bronze'), note: L('تشطيب حيّ يتعتّق', 'Living finish'), swatch: '#8a6a44' },
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
  { id: 'residence', label: L('المسكن', 'Residence'), hint: L('البيت كاملًا', 'The whole house') },
  { id: 'exterior', label: L('الواجهات', 'Exterior'), hint: L('الجدران والإطارات والباب', 'Walls, frames, door') },
  { id: 'living', label: L('المعيشة', 'Living'), hint: L('الأرضية والجدران والكنب', 'Floor, walls, sofa') },
  { id: 'kitchen', label: L('المطبخ', 'Kitchen'), hint: L('الخزائن والحجر والمعادن', 'Cabinets, stone, metal') },
  { id: 'landscape', label: L('المسبح', 'Pool'), hint: L('الماء وبلاط الشرفة', 'Water and paving') },
] as const;

export type RoomId = (typeof ROOMS)[number]['id'];
