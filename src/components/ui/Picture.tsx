'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useLocale } from '@/components/providers/LocaleProvider';
import type { Photo } from '@/content/media';
import { useInView, useReducedMotion } from '@/lib/device';
import { cn } from '@/lib/cn';

/**
 * Every photograph on the site arrives the same way: a mask opens from the foot of the frame
 * while the image settles back from a slight enlargement — the way a print is uncovered, not
 * the way a slide flies in. With `drift`, the image also moves a few percent slower than the
 * page, which is all the parallax an architectural photograph can take.
 */
export function Picture({
  photo,
  ratio,
  sizes,
  priority,
  drift = false,
  caption,
  className,
  imageClassName,
}: {
  photo: Photo;
  /** CSS aspect-ratio for the frame, e.g. "3/2". Defaults to the photograph's own. */
  ratio?: string;
  sizes: string;
  priority?: boolean;
  drift?: boolean;
  caption?: string;
  className?: string;
  imageClassName?: string;
}) {
  const { locale, t } = useLocale();
  // The mask is watched from the OUTSIDE: an element clipped to nothing by its own clip-path
  // reports zero intersection, so watching the clipped element itself would never open it.
  const outer = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const inView = useInView(outer, { amount: 0.05 });
  const reduced = useReducedMotion();
  const shown = inView || reduced || priority;

  useEffect(() => {
    if (!drift || reduced) return;
    const element = frame.current;
    const target = inner.current;
    if (!element || !target) return;
    let cleanup = () => {};
    let cancelled = false;
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const tween = gsap.fromTo(target, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [drift, reduced]);

  const note = caption ?? (photo.render ? t.projectPage.modelImage : undefined);

  return (
    <figure ref={outer} className={className}>
      <div
        ref={frame}
        className={cn('relative w-full overflow-hidden bg-ink-3 transition-[clip-path] duration-[1700ms] ease-[var(--ease-out)]', shown ? '[clip-path:inset(0_0_0_0)]' : '[clip-path:inset(100%_0_0_0)]')}
        style={{ aspectRatio: ratio ?? `${photo.w}/${photo.h}` }}
      >
        <div ref={inner} className={cn('absolute inset-x-0', drift && !reduced ? '-inset-y-[6%]' : 'inset-y-0')}>
          <Image
            src={photo.src}
            alt={photo.alt[locale]}
            fill
            sizes={sizes}
            priority={priority}
            placeholder={photo.blur ? 'blur' : 'empty'}
            blurDataURL={photo.blur}
            className={cn('object-cover transition-transform duration-[2400ms] ease-[var(--ease-out)]', shown ? 'scale-100' : 'scale-[1.12]', imageClassName)}
            style={{ objectPosition: photo.focus ?? 'center' }}
          />
        </div>
      </div>
      {note && <figcaption className="mt-3 text-xs text-stone/60">{note}</figcaption>}
    </figure>
  );
}
