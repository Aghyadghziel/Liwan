'use client';

import * as THREE from 'three';
import { useSyncExternalStore } from 'react';
import type { RoomId } from './config';

/**
 * Every camera move in the site is a named shot. The hero runs a path through them; the
 * configurator flies between them. Nothing in the UI sets raw coordinates.
 */

export type Shot = { position: [number, number, number]; target: [number, number, number]; fov?: number };

export const SHOTS = {
  /** Opening frame: the house across the pool, late afternoon. */
  wide: { position: [29, 13, 33], target: [0, 3.2, 3], fov: 38 },
  approach: { position: [15, 4.4, 24], target: [2, 2.6, 6], fov: 40 },
  /** At the glass, about to step in. */
  threshold: { position: [3.5, 2.05, 12.2], target: [-1.5, 2, 1.5], fov: 48 },
  living: { position: [-0.4, 1.78, 5.4], target: [-5.8, 1.62, -1.6], fov: 52 },
  kitchen: { position: [4.4, 1.82, 2.4], target: [9.6, 1.5, -2.6], fov: 50 },
  pool: { position: [-8.5, 3.2, 9.6], target: [6, 0.2, 14.5], fov: 44 },
  /** The west portico, where the entrance is. */
  entrance: { position: [-26, 4.2, 12], target: [-12.5, 2.1, 0.5], fov: 42 },
  /** Return frame, a touch lower and closer than the opening. */
  ending: { position: [-22, 8.5, 27], target: [0, 3, 2], fov: 40 },
  /** Configurator homes. */
  residence: { position: [24, 10, 26], target: [0, 3, 2], fov: 40 },
  exterior: { position: [-23, 8, 21], target: [-2, 2.8, 2], fov: 42 },
  landscape: { position: [-9, 6.5, 25], target: [4, 0.3, 13], fov: 42 },
  /** Phones only: looking down at the living-room floor, so a new floor is actually seen. */
  floor: { position: [-0.2, 2.5, 5.6], target: [-4.4, 0.1, 0.4], fov: 50 },
} satisfies Record<string, Shot>;

export type ShotName = keyof typeof SHOTS;

/** The cinematic order the hero scrolls through. */
export const HERO_PATH: ShotName[] = ['wide', 'approach', 'threshold', 'living', 'kitchen', 'pool', 'ending'];

/** Which shot each configurator room belongs to. */
export const ROOM_SHOT: Record<RoomId, ShotName> = {
  residence: 'residence',
  exterior: 'exterior',
  living: 'living',
  kitchen: 'kitchen',
  landscape: 'landscape',
};

type Mode = { kind: 'path'; progress: number } | { kind: 'shot'; name: ShotName; orbit: boolean };

type Listener = () => void;

let mode: Mode = { kind: 'path', progress: 0 };
const listeners = new Set<Listener>();
const emit = () => {
  for (const listener of listeners) listener();
};

/** When a shot is pinned (the render bench), scrolling no longer moves the camera. */
let pinned = false;
export function pinShot(name: ShotName) {
  pinned = true;
  mode = { kind: 'shot', name, orbit: false };
  emit();
}

export function setPathProgress(progress: number) {
  if (pinned) return;
  mode = { kind: 'path', progress };
  emit();
}

export function flyTo(name: ShotName, { orbit = true } = {}) {
  if (pinned) return;
  mode = { kind: 'shot', name, orbit };
  emit();
}

export function getCameraMode() {
  return mode;
}

export function subscribeCamera(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Where the subject sits in the frame, from -1 (pushed left) to 1 (pushed right). The opening
 * titles sit on the reading side of the screen, so the house moves to the other one: right in
 * English, left in Arabic. This is a lens shift, as on a view camera — verticals stay true.
 */
let filmShift = 0;
export function setFilmShift(value: number) {
  filmShift = value;
}
export function getFilmShift() {
  return filmShift;
}

/**
 * Whether any part of the canvas is on screen. The house sits behind solid reading sections
 * for most of the page; while it is covered there is nothing to draw, so the loop stops.
 */
let sceneVisible = true;
const visibilityListeners = new Set<Listener>();
export function setSceneVisible(value: boolean) {
  if (sceneVisible === value) return;
  sceneVisible = value;
  for (const listener of visibilityListeners) listener();
}
export function getSceneVisible() {
  return sceneVisible;
}
export function subscribeSceneVisible(listener: Listener) {
  visibilityListeners.add(listener);
  return () => {
    visibilityListeners.delete(listener);
  };
}

/**
 * How much of the screen, from the bottom, is covered by the phone configurator panel (0–1).
 * The camera frames the house in what is left above it instead of behind it.
 */
let viewLift = 0;
export function setViewLift(value: number) {
  viewLift = Math.max(0, Math.min(0.6, value));
}
export function getViewLift() {
  return viewLift;
}

const SERVER_MODE: Mode = { kind: 'path', progress: 0 };
export function useCameraMode() {
  return useSyncExternalStore(subscribeCamera, getCameraMode, () => SERVER_MODE);
}

/**
 * Smooth curves through the hero shots. Sampling a curve rather than stepping between shots
 * is what makes the move feel like a camera on a dolly instead of a slideshow.
 */
export function heroCurves() {
  const positions = HERO_PATH.map((name) => new THREE.Vector3(...SHOTS[name].position));
  const targets = HERO_PATH.map((name) => new THREE.Vector3(...SHOTS[name].target));
  return {
    position: new THREE.CatmullRomCurve3(positions, false, 'catmullrom', 0.12),
    target: new THREE.CatmullRomCurve3(targets, false, 'catmullrom', 0.12),
    fov: HERO_PATH.map((name) => SHOTS[name].fov ?? 42),
  };
}

/** Field of view interpolated along the same path, so the lens breathes with the move. */
export function sampleFov(fovs: number[], t: number) {
  const scaled = t * (fovs.length - 1);
  const index = Math.min(fovs.length - 2, Math.floor(scaled));
  const local = scaled - index;
  return THREE.MathUtils.lerp(fovs[index], fovs[index + 1], local);
}
