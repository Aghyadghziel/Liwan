'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * What this device can reasonably render, and whether it wants motion at all. Both are read
 * through useSyncExternalStore rather than an effect, so the server renders a known value and
 * the client swaps to the real one without a second render pass.
 */

let measured: 'high' | 'low' | null = null;

function measure(): 'high' | 'low' {
  if (measured) return measured;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = window.innerWidth < 1024;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  measured = coarse || small || cores <= 4 || memory <= 4 ? 'low' : 'high';
  return measured;
}

/** Nothing to subscribe to: the measurement is taken once, on the client. */
const noSubscribe = () => () => {};

export function useQuality(): 'high' | 'low' | 'pending' {
  return useSyncExternalStore<'high' | 'low' | 'pending'>(noSubscribe, measure, () => 'pending');
}

const motionQuery = () => window.matchMedia('(prefers-reduced-motion: reduce)');

export function useReducedMotion() {
  return useSyncExternalStore(
    (listener) => {
      const query = motionQuery();
      query.addEventListener('change', listener);
      return () => query.removeEventListener('change', listener);
    },
    () => motionQuery().matches,
    () => false,
  );
}

/** True once the element has been on screen, so sections reveal only when reached. */
export function useInView<T extends HTMLElement>(ref: React.RefObject<T | null>, { once = true, amount = 0.25 } = {}) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) setInView(false);
      },
      { threshold: amount },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, once, amount]);

  return inView;
}
