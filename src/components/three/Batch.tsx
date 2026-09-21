'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * The house is written as several hundred small meshes — a board, a cushion, a coping —
 * because that is how it is thought about. The GPU should not have to think about it that way:
 * every mesh is a draw call, in every pass. Nothing here ever moves, so once the children have
 * mounted they are baked into one mesh per material, and the originals are switched off.
 * Materials are shared by reference, so changing a finish still changes the merged house.
 *
 * Lights must stay outside a Batch: a light inside a hidden group is not collected.
 */

type Baked = { key: string; geometry: THREE.BufferGeometry; material: THREE.Material; cast: boolean; receive: boolean };

const KEEP = ['position', 'normal', 'uv'];

export function Batch({ children }: { children: ReactNode }) {
  const source = useRef<THREE.Group>(null);
  const [baked, setBaked] = useState<Baked[] | null>(null);

  useLayoutEffect(() => {
    const group = source.current;
    if (!group) return;
    group.updateWorldMatrix(true, true);
    const toLocal = new THREE.Matrix4().copy(group.matrixWorld).invert();
    const matrix = new THREE.Matrix4();
    const buckets = new Map<string, { material: THREE.Material; cast: boolean; receive: boolean; parts: THREE.BufferGeometry[] }>();

    group.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh || Array.isArray(mesh.material)) return;
      const key = `${mesh.material.uuid}:${mesh.castShadow ? 1 : 0}${mesh.receiveShadow ? 1 : 0}`;
      const part = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      for (const name of Object.keys(part.attributes)) if (!KEEP.includes(name)) part.deleteAttribute(name);
      if (!part.attributes.uv) part.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(part.attributes.position.count * 2), 2));
      part.applyMatrix4(matrix.multiplyMatrices(toLocal, mesh.matrixWorld));
      const bucket = buckets.get(key) ?? { material: mesh.material, cast: mesh.castShadow, receive: mesh.receiveShadow, parts: [] };
      bucket.parts.push(part);
      buckets.set(key, bucket);
    });

    const result: Baked[] = [];
    for (const [key, bucket] of buckets) {
      const geometry = mergeGeometries(bucket.parts, false);
      for (const part of bucket.parts) part.dispose();
      if (geometry) result.push({ key, geometry, material: bucket.material, cast: bucket.cast, receive: bucket.receive });
    }
    setBaked(result);
    return () => {
      for (const item of result) item.geometry.dispose();
    };
  }, []);

  return (
    <>
      <group ref={source} visible={!baked}>
        {children}
      </group>
      {baked?.map((item) => (
        <mesh key={item.key} geometry={item.geometry} material={item.material} castShadow={item.cast} receiveShadow={item.receive} />
      ))}
    </>
  );
}
