import * as THREE from 'three';
import { generate, type Pixels, type TextureKey } from './texture-shaders';

/**
 * Every surface in the residence is drawn in code — no downloaded texture packs. The recipes
 * live in texture-shaders.ts and are painted by Web Workers; this module turns the pixels
 * that come back into GPU textures, once each, and hands them out.
 *
 * Until a texture arrives, its surface wears the recipe's average colour (tintOf), and the
 * texture then dissolves in — so the page never waits, and never freezes, for stone.
 */

export { TILE, tintOf, type TextureKey } from './texture-shaders';

export type Pair = { map: THREE.Texture; bump: THREE.Texture; tile: number };

const ready = new Map<TextureKey, Pair>();
const pending = new Map<TextureKey, Promise<Pair>>();
const cutouts = new Map<string, THREE.Texture>();

function toPair(pixels: Pixels): Pair {
  const finish = (texture: THREE.DataTexture, srgb: boolean) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 8;
    if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  };
  const map = finish(new THREE.DataTexture(new Uint8Array(pixels.colour.buffer), pixels.size, pixels.size, THREE.RGBAFormat), true);
  // Height needs one channel, not four: a quarter of the memory.
  const bump = finish(new THREE.DataTexture(new Uint8Array(pixels.height.buffer), pixels.size, pixels.size, THREE.RedFormat), false);
  return { map, bump, tile: pixels.tile };
}

/* ── Workers ──────────────────────────────────────────────── */

type Job = { id: number; key: TextureKey; resolve: (pixels: Pixels) => void };
let workers: Worker[] | null = null;
let idle: Worker[] = [];
const queue: Job[] = [];
const running = new Map<number, Job>();
let nextId = 1;

function startWorkers() {
  if (workers) return workers;
  workers = [];
  try {
    const count = (navigator.hardwareConcurrency ?? 4) > 4 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const worker = new Worker(new URL('./textures.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (event: MessageEvent<{ id: number; pixels: Pixels }>) => {
        const job = running.get(event.data.id);
        running.delete(event.data.id);
        idle.push(worker);
        job?.resolve(event.data.pixels);
        pump();
      };
      worker.onerror = () => {
        // A worker that cannot start is replaced by slow, polite work on the main thread.
        workers = [];
        idle = [];
        for (const job of [...running.values(), ...queue.splice(0)]) fallback(job);
        running.clear();
      };
      workers.push(worker);
      idle.push(worker);
    }
  } catch {
    workers = [];
  }
  return workers;
}

function fallback(job: Job) {
  const run = () => job.resolve(generate(job.key));
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 3000 });
  else setTimeout(run, 60);
}

function pump() {
  while (idle.length && queue.length) {
    const worker = idle.pop()!;
    const job = queue.shift()!;
    running.set(job.id, job);
    worker.postMessage({ id: job.id, key: job.key });
  }
}

/** The texture for a key, painted once. Resolves at once if it already exists. */
export function load(key: TextureKey): Promise<Pair> {
  const done = ready.get(key);
  if (done) return Promise.resolve(done);
  let promise = pending.get(key);
  if (!promise) {
    promise = new Promise<Pixels>((resolve) => {
      const job: Job = { id: nextId++, key, resolve };
      if (startWorkers().length) {
        queue.push(job);
        pump();
      } else fallback(job);
    }).then((pixels) => {
      const pair = toPair(pixels);
      ready.set(key, pair);
      pending.delete(key);
      return pair;
    });
    pending.set(key, promise);
  }
  return promise;
}

/** The texture if it is already painted, without waiting. */
export const peek = (key: TextureKey) => ready.get(key);

/** A stable random number for a cell. */
const cell = (a: number, b: number, seed: number) => {
  const n = Math.sin(a * 91.7 + b * 47.3 + seed * 7.1) * 24634.6345;
  return n - Math.floor(n);
};

function canvas(width: number, height = width) {
  const el = document.createElement('canvas');
  el.width = width;
  el.height = height;
  return { el, ctx: el.getContext('2d')! };
}

/* ── Planting: alpha cut-outs ──────────────────────────────── */

function cutout(key: string, width: number, height: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  if (!cutouts.has(key)) {
    const { el, ctx } = canvas(width, height);
    draw(ctx, width, height);
    const texture = new THREE.CanvasTexture(el);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    cutouts.set(key, texture);
  }
  return cutouts.get(key)!;
}

/** A spray of narrow leaves on twigs: olive when grey-green, shrub when deeper. */
export function leafSpray(kind: 'olive' | 'shrub'): THREE.Texture {
  const tones = kind === 'olive' ? ['#7d8a66', '#94a07c', '#5f6b4c', '#a9b18f'] : ['#4f6640', '#64794d', '#3d5232', '#7a8c5a'];
  return cutout(`leaves-${kind}`, 256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    let n = 0;
    const random = () => cell(n++, 3, kind.length);
    for (let twig = 0; twig < 9; twig++) {
      const x0 = w * (0.3 + random() * 0.4);
      const y0 = h * (0.3 + random() * 0.4);
      const angle = random() * Math.PI * 2;
      const length = w * (0.28 + random() * 0.2);
      ctx.strokeStyle = '#5b4f3c';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + Math.cos(angle) * length, y0 + Math.sin(angle) * length);
      ctx.stroke();
      for (let leaf = 0; leaf < 11; leaf++) {
        const along = 0.12 + (leaf / 11) * 0.9;
        const side = leaf % 2 ? 1 : -1;
        const lx = x0 + Math.cos(angle) * length * along;
        const ly = y0 + Math.sin(angle) * length * along;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(angle + side * (0.55 + random() * 0.5));
        ctx.fillStyle = tones[Math.floor(random() * tones.length)];
        ctx.beginPath();
        ctx.ellipse(w * 0.05, 0, w * (0.05 + random() * 0.02), w * (kind === 'olive' ? 0.013 : 0.022), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  });
}

/** One date-palm frond: a rachis with folded leaflets, longest a third of the way out. */
export function palmFrond(): THREE.Texture {
  return cutout('palm-frond', 512, 160, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const mid = h / 2;
    ctx.strokeStyle = '#8e9366';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();
    const count = 120;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const x = t * w;
      const reach = Math.sin(Math.min(1, t * 1.35 + 0.08) * Math.PI) * h * 0.47 * (0.85 + cell(i, 1, 5) * 0.3);
      const lean = w * 0.05 * (0.6 + t);
      for (const side of [-1, 1]) {
        const shade = cell(i, side + 2, 6);
        ctx.strokeStyle = shade > 0.6 ? '#6d7f4d' : shade > 0.25 ? '#5b6e40' : '#4a5c35';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(x, mid);
        ctx.lineTo(x + lean, mid + side * reach);
        ctx.stroke();
      }
    }
  });
}

/** A tuft of fountain grass: blades fanning from one foot, paler at the plume. */
export function grassTuft(): THREE.Texture {
  return cutout('grass-tuft', 256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const spread = (cell(i, 1, 8) - 0.5) * 2;
      const height = h * (0.55 + cell(i, 2, 8) * 0.42);
      const tipX = w / 2 + spread * w * 0.46;
      const tone = cell(i, 3, 8);
      ctx.strokeStyle = tone > 0.7 ? '#b9b07f' : tone > 0.35 ? '#8a915c' : '#6c7847';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w / 2 + spread * w * 0.05, h);
      ctx.quadraticCurveTo(w / 2 + spread * w * 0.16, h - height * 0.7, tipX, h - height + Math.abs(spread) * h * 0.22);
      ctx.stroke();
    }
  });
}

export function disposeTextures() {
  for (const pair of ready.values()) {
    pair.map.dispose();
    pair.bump.dispose();
  }
  for (const texture of cutouts.values()) texture.dispose();
  ready.clear();
  cutouts.clear();
}
