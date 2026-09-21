/**
 * The texture recipes, as pure arithmetic: no three.js, no DOM. That is what lets them run in
 * a Web Worker, so painting a dozen megapixels of stone and timber never blocks the page.
 *
 * Three rules keep the results from reading as computer graphics:
 *  · every texture tiles without a seam, because a seam across a wall is the first thing the
 *    eye finds;
 *  · every texture has a physical size in metres (TILE), and all geometry carries UVs in
 *    metres, so grain, joints and pores are the size they are on site;
 *  · nothing is uniform — boards, slabs and panels each take a slightly different tone, the
 *    way a delivered pallet does.
 */

/** Physical size of one tile of each texture, in metres. */
export const TILE = { wood: 2.4, marble: 3, stone: 3, cladding: 2.4, boards: 2.4, plaster: 3, fabric: 0.6, paving: 2.4, gravel: 2, lawn: 3 } as const;

type RGB = [number, number, number];
/** '#rrggbb' → sRGB bytes. The textures are authored and stored in sRGB. */
const rgb = (hex: string): RGB => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

/** Deterministic value noise that repeats every `px` by `py` lattice cells. */
function makeNoise(seed: number) {
  const rand = (x: number, y: number) => {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed * 13.37) * 43758.5453;
    return n - Math.floor(n);
  };
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const wrap = (value: number, period: number) => ((value % period) + period) % period;
  return (x: number, y: number, px: number, py: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = smooth(x - xi);
    const yf = smooth(y - yi);
    const x0 = wrap(xi, px);
    const x1 = wrap(xi + 1, px);
    const y0 = wrap(yi, py);
    const y1 = wrap(yi + 1, py);
    const a = rand(x0, y0);
    const b = rand(x1, y0);
    const c = rand(x0, y1);
    const d = rand(x1, y1);
    return a * (1 - xf) * (1 - yf) + b * xf * (1 - yf) + c * (1 - xf) * yf + d * xf * yf;
  };
}
type Noise = ReturnType<typeof makeNoise>;

/** Layered noise over the unit square, tiling at the edges. `fx`/`fy` are whole numbers. */
function fbm(noise: Noise, u: number, v: number, fx: number, fy: number, octaves = 4) {
  let value = 0;
  let amplitude = 0.5;
  let total = 0;
  for (let i = 0; i < octaves; i++) {
    const scale = 1 << i;
    value += amplitude * noise(u * fx * scale, v * fy * scale, fx * scale, fy * scale);
    total += amplitude;
    amplitude *= 0.5;
  }
  return value / total;
}

/** A stable random number for a cell — a plank, a slab, a panel. */
const cell = (a: number, b: number, seed: number) => {
  const n = Math.sin(a * 91.7 + b * 47.3 + seed * 7.1) * 24634.6345;
  return n - Math.floor(n);
};

type Sample = { colour: RGB; height: number };
type Recipe = { size: number; tile: number; shade: (u: number, v: number) => Sample };
const recipe = (size: number, tile: number, shade: Recipe['shade']): Recipe => ({ size, tile, shade });

/* ── Wood ──────────────────────────────────────────────────
   Rift-sawn: straight, fine grain along U, with tone drifting slowly across the width. With
   `planks`, the tile is laid as a floor: 200 mm boards, staggered ends, each its own tone. */
type WoodTone = 'light-oak' | 'dark-oak' | 'walnut' | 'natural-oak';

function wood(tone: WoodTone, { planks = false }: { planks?: boolean } = {}): Recipe {
  const palette = {
    'light-oak': ['#d9c7a8', '#c9b38f', '#b39a74'],
    'natural-oak': ['#c8ad85', '#b6986e', '#9c7e55'],
    'dark-oak': ['#77604a', '#65503c', '#52402f'],
    walnut: ['#6a4c3a', '#573b2c', '#432c20'],
  }[tone].map(rgb) as [RGB, RGB, RGB];
  const seed = tone.length * 17 + (planks ? 5 : 0);
  const noise = makeNoise(seed);
  const rows = 12;

  return recipe(planks ? 1024 : 512, TILE.wood, (u, v) => {
    let uu = u;
    let lift = 0;
    let joint = 0;
    if (planks) {
      const row = Math.floor(v * rows);
      // Each board is cut from a different part of a different tree.
      uu = (u + cell(row, 0, seed)) % 1;
      lift = (cell(row, 1, seed) - 0.5) * 0.2;
      const edge = Math.abs(v * rows - Math.round(v * rows)) / rows;
      const end = Math.abs(((u + cell(row, 2, seed)) % 0.5) - 0.25);
      if (edge < 0.0016 || end < 0.0012) joint = 1;
    }
    const drift = fbm(noise, uu, v, 3, 14, 3);
    const grain = fbm(noise, uu, v, 6, 96, 3);
    const pore = fbm(noise, uu, v, 24, 384, 2);
    const t = clamp01(drift * 0.55 + grain * 0.45 + lift);
    let colour = mix(palette[0], palette[1], clamp01(t * 1.25));
    if (t > 0.62) colour = mix(colour, palette[2], (t - 0.62) * 1.6);
    if (pore > 0.66) colour = mix(colour, palette[2], (pore - 0.66) * 1.2);
    if (joint) colour = mix(colour, [38, 30, 24], 0.7);
    return { colour, height: joint ? 0.1 : 0.62 - grain * 0.16 - (pore > 0.66 ? 0.14 : 0) };
  });
}

/* ── Marble ────────────────────────────────────────────────
   A quiet field, and a few veins that wander, branch and fade, as a slab does. */
function marble(tone: 'white' | 'beige' | 'dark'): Recipe {
  const palette = {
    white: ['#f1efea', '#e2dfd8', '#8f8c88'],
    beige: ['#e2d6c1', '#d2c3a9', '#8d7656'],
    dark: ['#36373c', '#2a2b30', '#9a968e'],
  }[tone].map(rgb) as [RGB, RGB, RGB];
  const noise = makeNoise(tone.length * 29);

  return recipe(512, TILE.marble, (u, v) => {
    const cloud = fbm(noise, u, v, 3, 3, 4);
    // Warp the field so the veins bend instead of running straight.
    const wu = u + (fbm(noise, u, v, 1, 1, 2) - 0.5) * 0.35;
    const wv = v + (fbm(noise, v, u, 1, 1, 2) - 0.5) * 0.35;
    // Veins follow one direction across the slab, broad and soft at the heart, fading out.
    const ridge = 1 - Math.abs(fbm(noise, wu, wv, 1, 2, 3) * 2 - 1);
    const strength = fbm(noise, u, v, 2, 2, 2);
    const vein = Math.pow(clamp01((ridge - 0.9) * 10), 2.2) * clamp01(strength * 1.6 - 0.3);
    const hair = Math.pow(clamp01((1 - Math.abs(fbm(noise, wv, wu, 3, 2, 3) * 2 - 1) - 0.975) * 40), 2) * 0.22;
    let colour = mix(palette[0], palette[1], cloud);
    colour = mix(colour, palette[2], clamp01(vein * 0.55 + hair));
    return { colour, height: 0.7 - vein * 0.12 };
  });
}

/* ── Stone ─────────────────────────────────────────────────
   Travertine is banded and pitted; limestone is even with a fossil speckle; concrete is
   clouded, with pin-holes where air met the form. */
type StoneTone = 'travertine' | 'limestone' | 'dark-stone' | 'concrete';

const STONE: Record<StoneTone, [string, string, string]> = {
  travertine: ['#dccfb9', '#cbbaa0', '#9d8a70'],
  limestone: ['#d6cbb6', '#c7b99f', '#a39378'],
  'dark-stone': ['#4d4b48', '#3e3c39', '#2b2a28'],
  concrete: ['#b9b5ad', '#a9a59d', '#86837c'],
};

function stoneSample(tone: StoneTone, noise: Noise, u: number, v: number) {
  const palette = STONE[tone].map(rgb) as [RGB, RGB, RGB];
  let t = fbm(noise, u, v, 4, 4, 4);
  if (tone === 'travertine') {
    const band = Math.sin((v * 22 + fbm(noise, u, v, 2, 5, 3) * 5) * Math.PI) * 0.5 + 0.5;
    t = t * 0.55 + band * 0.45;
  }
  const pore = fbm(noise, u, v, 96, tone === 'travertine' ? 40 : 96, 2);
  const limit = tone === 'travertine' ? 0.68 : tone === 'concrete' ? 0.78 : 0.74;
  let colour = mix(palette[0], palette[1], t);
  let height = 0.66 + (t - 0.5) * 0.08;
  if (pore > limit) {
    const depth = clamp01((pore - limit) * 5);
    colour = mix(colour, palette[2], depth);
    height -= depth * 0.4;
  }
  return { colour, height };
}

function stone(tone: StoneTone): Recipe {
  const noise = makeNoise(tone.length * 13);
  return recipe(512, TILE.stone, (u, v) => stoneSample(tone, noise, u, v));
}

/** Laid stone: slabs in running bond with an open joint, each slab a shade of its own. */
function laid(tone: StoneTone, tile: number, courses: number, perCourse: number, jointWidth: number, variation: number): Recipe {
  const noise = makeNoise(tone.length * 13 + courses);
  return recipe(1024, tile, (u, v) => {
    const row = Math.floor(v * courses);
    const shift = row % 2 ? 0.5 / perCourse : 0;
    const column = Math.floor(((u + shift) % 1) * perCourse);
    // Each slab samples a different part of the block, so the banding never lines up.
    const offset = cell(row, column, 3);
    const sample = stoneSample(tone, noise, (u + offset) % 1, (v + offset * 0.37) % 1);
    const tint = 1 + (cell(row, column, 9) - 0.5) * variation;
    const dv = Math.abs(v * courses - Math.round(v * courses)) / courses;
    const du = Math.abs((u + shift) * perCourse - Math.round((u + shift) * perCourse)) / perCourse;
    const joint = dv < jointWidth || du < jointWidth;
    const colour: RGB = joint ? mix(sample.colour, [60, 55, 48], 0.62) : [sample.colour[0] * tint, sample.colour[1] * tint, sample.colour[2] * tint];
    return { colour, height: joint ? 0.12 : sample.height };
  });
}

/** Terrace paving: 1200 × 600 slabs. */
function paving(tone: 'travertine' | 'limestone' | 'dark-stone'): Recipe {
  return laid(tone, TILE.paving, 4, 2, 0.0022, 0.09);
}

/** Facade cladding: 1200 × 600 sawn panels on a tight joint. */
function cladding(tone: 'limestone'): Recipe {
  return laid(tone, TILE.cladding, 4, 2, 0.0014, 0.07);
}

/** Board-marked concrete: the grain and the lips of 150 mm formwork boards, and the tie holes. */
function boardConcrete(): Recipe {
  const palette = ['#5a5955', '#4b4a47', '#33322f'].map(rgb) as [RGB, RGB, RGB];
  const noise = makeNoise(71);
  const boards = 16;
  return recipe(1024, TILE.boards, (u, v) => {
    const row = Math.floor(v * boards);
    const uu = (u + cell(row, 0, 4)) % 1;
    const cloud = fbm(noise, u, v, 3, 3, 4);
    const grain = fbm(noise, uu, v, 5, 128, 3);
    const tint = (cell(row, 1, 4) - 0.5) * 0.3;
    const lip = Math.abs(v * boards - Math.round(v * boards)) / boards < 0.0015;
    const pin = fbm(noise, u, v, 128, 128, 1) > 0.84;
    // Tie holes on a 600 mm grid.
    const hu = Math.abs(((u * 4) % 1) - 0.5);
    const hv = Math.abs(((v * 4) % 1) - 0.5);
    const hole = hu * hu + hv * hv < 0.00022;
    let colour = mix(palette[0], palette[1], clamp01(cloud * 0.7 + grain * 0.3 + tint));
    if (lip || pin) colour = mix(colour, palette[2], 0.55);
    if (hole) colour = mix(colour, palette[2], 0.9);
    return { colour, height: hole ? 0 : lip ? 0.25 : 0.62 - grain * 0.18 - (pin ? 0.25 : 0) };
  });
}

/* ── Plaster ───────────────────────────────────────────────
   Hand-floated: a fine tooth, and the slow cloud left by the trowel. */
function plaster(hex: string): Recipe {
  const base = rgb(hex);
  const dark: RGB = [base[0] * 0.9, base[1] * 0.89, base[2] * 0.87];
  const noise = makeNoise(hex.charCodeAt(1) + hex.charCodeAt(3));
  return recipe(512, TILE.plaster, (u, v) => {
    const trowel = fbm(noise, u, v, 3, 4, 3);
    const tooth = fbm(noise, u, v, 160, 160, 2);
    return { colour: mix(base, dark, clamp01(trowel * 0.7 + tooth * 0.3)), height: 0.55 + (tooth - 0.5) * 0.5 + (trowel - 0.5) * 0.2 };
  });
}

/* ── Fabric ────────────────────────────────────────────────
   A plain weave with slub: the uneven yarn is what makes linen read as linen. */
function fabric(hex: string): Recipe {
  const base = rgb(hex);
  const dark: RGB = [base[0] * 0.8, base[1] * 0.8, base[2] * 0.8];
  const noise = makeNoise(hex.charCodeAt(2) * 3);
  const threads = 96;
  return recipe(512, TILE.fabric, (u, v) => {
    const warp = Math.sin(u * threads * Math.PI * 2) * 0.5 + 0.5;
    const weft = Math.sin(v * threads * Math.PI * 2) * 0.5 + 0.5;
    const over = (Math.floor(u * threads) + Math.floor(v * threads)) % 2 ? warp : weft;
    const slub = fbm(noise, u, v, 6, 64, 2);
    const t = clamp01(0.75 - over * 0.55 + (slub - 0.5) * 0.5);
    return { colour: mix(base, dark, t), height: over * 0.7 + slub * 0.3 };
  });
}

/* ── Ground ────────────────────────────────────────────────── */

/** Washed desert gravel: many small stones in four tones, no two alike. */
function gravel(): Recipe {
  const tones = ['#b5a990', '#9d917a', '#c7bca6', '#857a66'].map(rgb) as RGB[];
  const noise = makeNoise(211);
  return recipe(512, TILE.gravel, (u, v) => {
    const grid = 72;
    const gx = Math.floor(u * grid);
    const gy = Math.floor(v * grid);
    // Nearest pebble centre among this cell and its neighbours.
    let best = 9;
    let pick = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cx = (gx + dx + grid) % grid;
        const cy = (gy + dy + grid) % grid;
        const px = gx + dx + cell(cx, cy, 1);
        const py = gy + dy + cell(cx, cy, 2);
        const d = (u * grid - px) ** 2 + (v * grid - py) ** 2;
        if (d < best) {
          best = d;
          pick = cell(cx, cy, 3);
        }
      }
    }
    const dust = fbm(noise, u, v, 4, 4, 3);
    const edge = clamp01(best * 1.6);
    const colour = mix(mix(tones[Math.floor(pick * 4) % 4], tones[1], dust * 0.4), [70, 62, 50], edge * 0.55);
    return { colour, height: 0.85 - edge * 0.7 };
  });
}

/** Mown lawn: uneven green, drier in patches, as irrigated grass is in this climate. */
function lawn(): Recipe {
  const tones = ['#6d7850', '#5d6945', '#858a5c'].map(rgb) as [RGB, RGB, RGB];
  const noise = makeNoise(307);
  return recipe(512, TILE.lawn, (u, v) => {
    const patch = fbm(noise, u, v, 3, 3, 4);
    const blade = fbm(noise, u, v, 200, 200, 2);
    let colour = mix(tones[0], tones[1], blade);
    colour = mix(colour, tones[2], clamp01((patch - 0.55) * 2.4));
    return { colour, height: blade };
  });
}

/* ── Keys ──────────────────────────────────────────────────
   A texture is named by a string, so the request can cross to the worker and back:
   "wood|light-oak|planks", "marble|white", "plaster|#ebe7df", "gravel". */

export type TextureKey = string;

function resolve(key: TextureKey): Recipe {
  const [kind, a, b] = key.split('|');
  switch (kind) {
    case 'wood':
      return wood(a as WoodTone, { planks: b === 'planks' });
    case 'marble':
      return marble(a as 'white' | 'beige' | 'dark');
    case 'stone':
      return stone(a as StoneTone);
    case 'paving':
      return paving(a as 'travertine' | 'limestone' | 'dark-stone');
    case 'cladding':
      return cladding('limestone');
    case 'boards':
      return boardConcrete();
    case 'plaster':
      return plaster(a);
    case 'fabric':
      return fabric(a);
    case 'gravel':
      return gravel();
    case 'lawn':
      return lawn();
    default:
      throw new Error(`Unknown texture: ${key}`);
  }
}

export type Pixels = { key: TextureKey; size: number; tile: number; colour: Uint8ClampedArray; height: Uint8ClampedArray };

/** Paints one texture: RGBA colour, and a single-channel height map. */
export function generate(key: TextureKey): Pixels {
  const { size, tile, shade } = resolve(key);
  const colour = new Uint8ClampedArray(size * size * 4);
  const height = new Uint8ClampedArray(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sample = shade(x / size, y / size);
      const i = y * size + x;
      colour[i * 4] = sample.colour[0];
      colour[i * 4 + 1] = sample.colour[1];
      colour[i * 4 + 2] = sample.colour[2];
      colour[i * 4 + 3] = 255;
      height[i] = clamp01(sample.height) * 255;
    }
  }
  return { key, size, tile, colour, height };
}

/**
 * The colour a surface wears until its texture arrives: the average of a coarse 12 × 12
 * sampling of the recipe itself, so the house is the right colours from its first frame.
 */
export function tintOf(key: TextureKey): string {
  const { shade } = resolve(key);
  const n = 12;
  let r = 0;
  let g = 0;
  let b = 0;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const sample = shade((x + 0.37) / n, (y + 0.61) / n);
      r += sample.colour[0];
      g += sample.colour[1];
      b += sample.colour[2];
    }
  }
  const hex = (value: number) => Math.round(value / (n * n)).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}
