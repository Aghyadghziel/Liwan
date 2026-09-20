'use client';

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { createLibrary, prewarm, type Library } from '@/lib/villa/materials';
import { getSpec, subscribeSpec } from '@/lib/villa/config';

const MaterialContext = createContext<Library | null>(null);

export function useMaterials() {
  const library = useContext(MaterialContext);
  if (!library) throw new Error('useMaterials must be used inside <Materials>');
  return library;
}

/**
 * Builds the material library once for the canvas, then keeps it in step with the
 * specification. Changing a finish mutates a material; it never remounts the scene.
 */
export function Materials({ quality, children }: { quality: 'high' | 'low'; children: ReactNode }) {
  const library = useMemo(() => {
    const created = createLibrary(quality);
    created.apply(getSpec(), { immediate: true });
    return created;
  }, [quality]);

  useEffect(() => {
    prewarm();
    return subscribeSpec(() => library.apply(getSpec()));
  }, [library]);

  useEffect(() => () => library.dispose(), [library]);

  useFrame((_, delta) => library.update(Math.min(delta, 0.05)));

  return <MaterialContext.Provider value={library}>{children}</MaterialContext.Provider>;
}
