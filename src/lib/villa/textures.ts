import * as THREE from 'three';

/**
 * Every surface in the residence is drawn here, in code — no downloaded texture packs.
 * Each generator returns a colour map and a bump map, so light catches grain, veins and
 * pores the way it does on a real material. Canvases are made once and cached.
 */

const cache = new Map<string, THREE.Texture>();

/** Deterministic value noise: the same seed always draws the same stone. */
function makeNoise(seed: number) {
  const rand = (x: number, y: number) => {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed) * 43758.5453;
    return n - Math.floor(n);
  };
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = smooth(x - xi);
    const yf = smooth(y - yi);
    const a = rand(xi, yi);
    const b = rand(xi + 1, yi);
    const c = rand(xi, yi + 1);
    const d = rand(xi + 1, yi + 1);
    return a * (1 - xf) * (1 - yf) + b * xf * (1 - yf) + c * (1 - xf) * yf + d * xf * yf;
  };
}

/** Layered noise — the difference between a flat tint and a material. */
function fbm(noise: (x: number, y: number) => number, x: number, y: number, octaves = 5) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise(x * frequency, y * frequency);
    frequency *= 2.07;
    amplitude *= 0.5;
  }
  return value;
}

function canvas(size: number) {
  const el = document.createElement('canvas');
  el.width = size;
  el.height = size;
  return { el, ctx: el.getContext('2d')! };
}

function toTexture(el: HTMLCanvasElement, { srgb = true, repeat = 1 }: { srgb?: boolean; repeat?: number } = {}) {
  const texture = new THREE.CanvasTexture(el);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.anisotropy = 8;
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

type Pair = { map: THREE.Texture; bump: THREE.Texture };

function build(key: string, size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void, drawBump: (ctx: CanvasRenderingContext2D, size: number) => void): Pair {
  const mapKey = `${key}:map`;
  const bumpKey = `${key}:bump`;
  if (!cache.has(mapKey)) {
    const a = canvas(size);
    draw(a.ctx, size);
    cache.set(mapKey, toTexture(a.el));
    const b = canvas(size);
    drawBump(b.ctx, size);
    cache.set(bumpKey, toTexture(b.el, { srgb: false }));
  }
  return { map: cache.get(mapKey)!, bump: cache.get(bumpKey)! };
}

/* ── Wood ──────────────────────────────────────────────────
   Growth rings bent around a knot line, then a fine open pore. */
export function wood(tone: 'light-oak' | 'dark-oak' | 'walnut' | 'natural-oak'): Pair {
  const palette = {
    'light-oak': ['#d6c3a5', '#c2ab88', '#a98f6a'],
    'natural-oak': ['#c9ad85', '#b2946b', '#95784f'],
    'dark-oak': ['#6d5844', '#5a4735', '#453527'],
    walnut: ['#5c4234', '#4a3327', '#38241b'],
  }[tone];

  return build(
    `wood-${tone}`,
    1024,
    (ctx, size) => {
      const noise = makeNoise(tone.length * 17);
      ctx.fillStyle = palette[0];
      ctx.fillRect(0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size);
      const base = new THREE.Color(palette[0]);
      const mid = new THREE.Color(palette[1]);
      const dark = new THREE.Color(palette[2]);
      const c = new THREE.Color();
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const u = x / size;
          const v = y / size;
          // Rings run along the plank and wander, so the grain never looks printed.
          const wander = fbm(noise, u * 3, v * 11, 4) * 0.35;
          const rings = Math.sin((v * 26 + wander * 18) * Math.PI) * 0.5 + 0.5;
          const fine = fbm(noise, u * 240, v * 18, 2);
          const t = Math.pow(rings, 2.2) * 0.75 + fine * 0.25;
          c.copy(base).lerp(mid, t);
          if (t > 0.72) c.lerp(dark, (t - 0.72) * 2.4);
          const i = (y * size + x) * 4;
          data.data[i] = c.r * 255;
          data.data[i + 1] = c.g * 255;
          data.data[i + 2] = c.b * 255;
          data.data[i + 3] = 255;
        }
      }
      ctx.putImageData(data, 0, 0);
    },
    (ctx, size) => {
      const noise = makeNoise(tone.length * 17);
      const data = ctx.createImageData(size, size);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const u = x / size;
          const v = y / size;
          const wander = fbm(noise, u * 3, v * 11, 4) * 0.35;
          const rings = Math.sin((v * 26 + wander * 18) * Math.PI) * 0.5 + 0.5;
          const pore = fbm(noise, u * 300, v * 22, 2);
          const g = (1 - Math.pow(rings, 3) * 0.55 - pore * 0.3) * 255;
          const i = (y * size + x) * 4;
          data.data[i] = data.data[i + 1] = data.data[i + 2] = g;
          data.data[i + 3] = 255;
        }
      }
      ctx.putImageData(data, 0, 0);
    },
  );
}

/* ── Marble ────────────────────────────────────────────────
   A cool white field with veins that branch and fade, as a slab does. */
export function marble(tone: 'white' | 'beige' | 'dark'): Pair {
  const palette = {
    white: { base: '#f2f0ec', vein: '#b9b4ac', deep: '#8d887f' },
    beige: { base: '#e3d8c6', vein: '#bda98a', deep: '#93805f' },
    dark: { base: '#2e2f31', vein: '#5b5e63', deep: '#84888e' },
  }[tone];

  const drawVeins = (ctx: CanvasRenderingContext2D, size: number, colour: string, deep: string) => {
    const noise = makeNoise(tone.length * 31 + 5);
    for (let v = 0; v < 26; v++) {
      const startY = (v / 26) * size + (fbm(noise, v, 0, 3) - 0.5) * 60;
      const width = 0.6 + fbm(noise, v * 3, 7, 2) * 3.4;
      ctx.beginPath();
      ctx.moveTo(-20, startY);
      let y = startY;
      for (let x = -20; x < size + 20; x += 12) {
        y += (fbm(noise, x * 0.02, v * 4, 4) - 0.5) * 22;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = v % 5 === 0 ? deep : colour;
      ctx.globalAlpha = 0.12 + (v % 5 === 0 ? 0.22 : 0.1);
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      ctx.stroke();
      // A soft halo either side, the way a vein bleeds into the stone.
      ctx.globalAlpha = 0.05;
      ctx.lineWidth = width * 4;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  return build(
    `marble-${tone}`,
    1024,
    (ctx, size) => {
      const noise = makeNoise(tone.length * 31);
      ctx.fillStyle = palette.base;
      ctx.fillRect(0, 0, size, size);
      // Cloudy ground so the white is never flat.
      const data = ctx.getImageData(0, 0, size, size);
      const base = new THREE.Color(palette.base);
      const soft = new THREE.Color(palette.vein);
      const c = new THREE.Color();
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = fbm(noise, (x / size) * 4, (y / size) * 4, 5) * 0.5;
          c.copy(base).lerp(soft, t * 0.35);
          const i = (y * size + x) * 4;
          data.data[i] = c.r * 255;
          data.data[i + 1] = c.g * 255;
          data.data[i + 2] = c.b * 255;
          data.data[i + 3] = 255;
        }
      }
      ctx.putImageData(data, 0, 0);
      drawVeins(ctx, size, palette.vein, palette.deep);
    },
    (ctx, size) => {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, size, size);
      drawVeins(ctx, size, '#6a6a6a', '#4f4f4f');
    },
  );
}

/* ── Travertine and limestone ──────────────────────────────
   Banded sediment with open pores; the pores carry the light. */
export function stone(tone: 'travertine' | 'limestone' | 'dark-stone' | 'concrete'): Pair {
  const palette = {
    travertine: ['#d9cbb4', '#c6b499', '#a8947a'],
    limestone: ['#ddd8cd', '#c8c2b5', '#aaa294'],
    'dark-stone': ['#4a4845', '#3b3936', '#2c2b29'],
    concrete: ['#bdbab4', '#aeaba5', '#97948e'],
  }[tone];
  const banded = tone === 'travertine';

  const shade = (ctx: CanvasRenderingContext2D, size: number, colours: string[], contrast: number) => {
    const noise = makeNoise(tone.length * 13);
    const data = ctx.createImageData(size, size);
    const a = new THREE.Color(colours[0]);
    const b = new THREE.Color(colours[1]);
    const d = new THREE.Color(colours[2]);
    const c = new THREE.Color();
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = (x / size) * 6;
        const v = (y / size) * 6;
        let t = fbm(noise, u, v, 5);
        if (banded) t = t * 0.7 + (Math.sin(v * 5 + fbm(noise, u * 0.5, v, 3) * 4) * 0.5 + 0.5) * 0.3;
        // Pores: rare, small, dark.
        const pore = fbm(noise, u * 26, v * 26, 2);
        c.copy(a).lerp(b, t * contrast);
        if (pore > 0.74) c.lerp(d, (pore - 0.74) * 3);
        const i = (y * size + x) * 4;
        data.data[i] = c.r * 255;
        data.data[i + 1] = c.g * 255;
        data.data[i + 2] = c.b * 255;
        data.data[i + 3] = 255;
      }
    }
    ctx.putImageData(data, 0, 0);
  };

  return build(
    `stone-${tone}`,
    1024,
    (ctx, size) => shade(ctx, size, palette, 1),
    (ctx, size) => shade(ctx, size, ['#9a9a9a', '#8a8a8a', '#3d3d3d'], 1.1),
  );
}

/* ── Plaster ───────────────────────────────────────────────
   Hand-floated lime: a fine tooth, no pattern. */
export function plaster(hex: string): Pair {
  return build(
    `plaster-${hex}`,
    512,
    (ctx, size) => {
      const noise = makeNoise(hex.length * 7);
      const base = new THREE.Color(hex);
      const c = new THREE.Color();
      const data = ctx.createImageData(size, size);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const t = fbm(noise, (x / size) * 9, (y / size) * 9, 4);
          c.copy(base).multiplyScalar(0.94 + t * 0.12);
          const i = (y * size + x) * 4;
          data.data[i] = Math.min(255, c.r * 255);
          data.data[i + 1] = Math.min(255, c.g * 255);
          data.data[i + 2] = Math.min(255, c.b * 255);
          data.data[i + 3] = 255;
        }
      }
      ctx.putImageData(data, 0, 0);
    },
    (ctx, size) => {
      const noise = makeNoise(hex.length * 7);
      const data = ctx.createImageData(size, size);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const g = (0.45 + fbm(noise, (x / size) * 40, (y / size) * 40, 3) * 0.55) * 255;
          const i = (y * size + x) * 4;
          data.data[i] = data.data[i + 1] = data.data[i + 2] = g;
          data.data[i + 3] = 255;
        }
      }
      ctx.putImageData(data, 0, 0);
    },
  );
}

/* ── Upholstery ────────────────────────────────────────────
   A woven tooth, so the sofa reads as cloth under sheen. */
export function fabric(hex: string): Pair {
  return build(
    `fabric-${hex}`,
    512,
    (ctx, size) => {
      const noise = makeNoise(hex.length * 23);
      const base = new THREE.Color(hex);
      const c = new THREE.Color();
      const data = ctx.createImageData(size, size);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const weave = (Math.sin(x * 0.9) * 0.5 + 0.5) * 0.5 + (Math.sin(y * 0.9) * 0.5 + 0.5) * 0.5;
          const slub = fbm(noise, (x / size) * 30, (y / size) * 30, 3);
          c.copy(base).multiplyScalar(0.9 + weave * 0.12 + slub * 0.08);
          const i = (y * size + x) * 4;
          data.data[i] = Math.min(255, c.r * 255);
          data.data[i + 1] = Math.min(255, c.g * 255);
          data.data[i + 2] = Math.min(255, c.b * 255);
          data.data[i + 3] = 255;
        }
      }
      ctx.putImageData(data, 0, 0);
    },
    (ctx, size) => {
      const data = ctx.createImageData(size, size);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const g = ((Math.sin(x * 0.9) * 0.5 + 0.5) * 0.5 + (Math.sin(y * 0.9) * 0.5 + 0.5) * 0.5) * 255;
          const i = (y * size + x) * 4;
          data.data[i] = data.data[i + 1] = data.data[i + 2] = g;
          data.data[i + 3] = 255;
        }
      }
      ctx.putImageData(data, 0, 0);
    },
  );
}

/* ── Paving ────────────────────────────────────────────────
   Large-format slabs with an open joint, laid running bond. */
export function paving(tone: 'travertine' | 'limestone' | 'dark-stone'): Pair {
  const face = stone(tone);
  const key = `paving-${tone}`;
  if (!cache.has(`${key}:map`)) {
    const a = canvas(1024);
    a.ctx.drawImage(face.map.image as HTMLCanvasElement, 0, 0);
    const joints = (ctx: CanvasRenderingContext2D, colour: string) => {
      ctx.strokeStyle = colour;
      ctx.lineWidth = 5;
      for (let row = 0; row <= 4; row++) {
        const y = row * 256;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
        const offset = row % 2 ? 256 : 0;
        for (let col = 0; col <= 2; col++) {
          const x = offset + col * 512;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 256);
          ctx.stroke();
        }
      }
    };
    a.ctx.globalAlpha = 0.5;
    joints(a.ctx, '#6f6a61');
    a.ctx.globalAlpha = 1;
    cache.set(`${key}:map`, toTexture(a.el));

    const b = canvas(1024);
    b.ctx.drawImage(face.bump.image as HTMLCanvasElement, 0, 0);
    joints(b.ctx, '#000000');
    cache.set(`${key}:bump`, toTexture(b.el, { srgb: false }));
  }
  return { map: cache.get(`${key}:map`)!, bump: cache.get(`${key}:bump`)! };
}

/** Water surface ripple, animated by scrolling the two normal maps against each other. */
export function ripple(): THREE.Texture {
  const key = 'ripple';
  if (!cache.has(key)) {
    const size = 512;
    const { el, ctx } = canvas(size);
    const noise = makeNoise(97);
    const data = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = (x / size) * 8;
        const v = (y / size) * 8;
        const h = fbm(noise, u, v, 4);
        const hx = fbm(noise, u + 0.04, v, 4);
        const hy = fbm(noise, u, v + 0.04, 4);
        const i = (y * size + x) * 4;
        // Encode a gentle normal: mostly up, nudged by the height slope.
        data.data[i] = 128 + (h - hx) * 900;
        data.data[i + 1] = 128 + (h - hy) * 900;
        data.data[i + 2] = 255;
        data.data[i + 3] = 255;
      }
    }
    ctx.putImageData(data, 0, 0);
    cache.set(key, toTexture(el, { srgb: false }));
  }
  return cache.get(key)!;
}

export function disposeTextures() {
  for (const texture of cache.values()) texture.dispose();
  cache.clear();
}
