'use client';

import { useRef, type ReactNode } from 'react';
import { useInView, useReducedMotion } from '@/lib/device';
import { cn } from '@/lib/cn';

/** Content arrives from below, slowly. One motion, used everywhere, so the site has a pace. */
export function Reveal({ children, delay = 0, className, as: Tag = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'section' | 'li' | 'figure' }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.18 });
  const reduced = useReducedMotion();

  return (
    <Tag
      ref={ref as never}
      className={cn('transition-[opacity,transform] duration-[1400ms] ease-[var(--ease-out)] will-change-transform', !reduced && !inView && 'translate-y-8 opacity-0', className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/** A rule that draws itself across the page: the studio's one flourish. */
export function Rule({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  return (
    <div ref={ref} className={cn('h-px w-full bg-line ltr:origin-left rtl:origin-right transition-transform duration-[1800ms] ease-[var(--ease-out)]', !inView && 'scale-x-0', className)} />
  );
}
