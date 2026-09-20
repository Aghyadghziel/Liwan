import type { T } from '@/lib/i18n';
import generated from './media.generated.json';

/**
 * Photography. LIWAN is a fictional studio, so its "built work" is illustrated with reference
 * photographs from Unsplash (credited in public/photography/CREDITS.md and on /credits), and
 * the one project that exists only as a model is illustrated with images of that model.
 *
 * Files are prepared by tools/photos/prepare.py, which writes media.generated.json with each
 * file's size and blur placeholder. This module gives each one its role and its words.
 */

export type Photo = {
  src: string;
  w: number;
  h: number;
  alt: T;
  blur?: string;
  /** CSS object-position, when the subject is off centre. */
  focus?: string;
  /** True when the image is a frame of the 3D model rather than a photograph. */
  render?: boolean;
  credit?: { name: string; url: string };
};

export type Role = 'hero' | 'tall' | 'wide' | 'exterior' | 'interior' | 'detail' | 'closing';
export type ProjectMedia = Partial<Record<Role, Photo>>;

type Generated = Record<string, { src: string; w: number; h: number; blur: string; credit?: { name: string; url: string } }>;
const files = generated as Generated;

const L = (ar: string, en: string): T => ({ ar, en });

function photo(key: string, alt: T, extra: Partial<Photo> = {}): Photo | undefined {
  const file = files[key];
  if (!file) return undefined;
  return { ...file, alt, ...extra };
}

function roles(entries: Partial<Record<Role, Photo | undefined>>): ProjectMedia {
  return Object.fromEntries(Object.entries(entries).filter(([, value]) => value)) as ProjectMedia;
}

export const projectMedia: Record<string, ProjectMedia> = {
  'courtyard-house': roles({}),
  'atrium-villa': roles({}),
  'olive-terraces': roles({}),
  'hittin-residence': roles({}),
};

export const materialMedia: Record<string, Photo | undefined> = {};
export const studioMedia: { desk?: Photo; model?: Photo } = {};

export const allPhotos = () =>
  [...Object.values(projectMedia).flatMap((set) => Object.values(set)), ...Object.values(materialMedia), ...Object.values(studioMedia)].filter((item): item is Photo => Boolean(item?.credit));

// Referenced so the helpers are not flagged while a set is still empty.
export const _helpers = { L, photo };
