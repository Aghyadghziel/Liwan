'use client';

import { useEffect } from 'react';

/** Smooth scrolling, but only where it is wanted: it is what makes the camera path glide. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let lenis: { raf: (time: number) => void; destroy: () => void } | undefined;
    let frame = 0;
    let cancelled = false;
    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    });
    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);
  return null;
}
