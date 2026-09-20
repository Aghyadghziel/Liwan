'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { setFilmShift, setPathProgress } from '@/lib/villa/camera';
import { useReducedMotion } from '@/lib/device';
import { cn } from '@/lib/cn';

/**
 * The opening film. The section is four screens tall and the house is fixed behind it; as you
 * scroll, the camera runs the path — wide, approach, threshold, living, kitchen, pool, out.
 * The type is pinned to the first screen and steps aside once the camera is inside.
 */

export function Hero() {
  const { t, dir } = useLocale();
  const hero = t.hero;
  const section = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [entered, setEntered] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const element = section.current;
    if (!element) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const value = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      setProgress(value);
      // Hand the camera over once the film has left the screen.
      const onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
      if (onScreen) {
        setPathProgress(reduced ? Math.round(value * 6) / 6 : value);
        // The house stands opposite the titles, and returns to centre as they leave.
        const away = 1 - Math.min(1, value / 0.14);
        setFilmShift((dir === 'rtl' ? -1 : 1) * away);
      } else {
        setFilmShift(0);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
      setFilmShift(0);
    };
  }, [reduced, dir]);

  // The headline holds the first screen, then hands over to the house.
  const titleOut = Math.min(1, progress / 0.14);
  const chapter = [...hero.chapters].reverse().find((item) => progress >= item.at);

  // Each line of the opening rises into place behind a mask, a beat apart.
  const rise = (delay: number) => ({
    className: cn('block transition-[transform,opacity] duration-[1500ms] ease-[var(--ease-out)]', !entered && !reduced && 'translate-y-[105%] opacity-0'),
    style: { transitionDelay: `${delay}ms` },
  });
  const fade = (delay: number) => ({
    className: cn('transition-[transform,opacity] duration-[1400ms] ease-[var(--ease-out)]', !entered && !reduced && 'translate-y-4 opacity-0'),
    style: { transitionDelay: `${delay}ms` },
  });

  return (
    <section ref={section} id="top" className="relative h-[420svh]" aria-label={hero.aria}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between overflow-hidden pb-8 pt-[var(--nav)]">
        {/* Opening titles */}
        <div
          className="container-x flex flex-1 flex-col justify-center transition-[opacity,transform] duration-300"
          style={{ opacity: 1 - titleOut, transform: `translateY(${titleOut * -40}px)`, pointerEvents: titleOut > 0.6 ? 'none' : 'auto' }}
        >
          <p {...fade(200)} className={cn('label text-bronze', fade(200).className)}>
            {hero.kicker}
          </p>
          <h1 className="display-xl mt-6 max-w-[15ch] rtl:max-w-[13ch]">
            <span className="block overflow-hidden pb-[0.12em] rtl:pb-[0.3em]">
              <span {...rise(320)}>{hero.line1}</span>
            </span>
            <span className="-mt-[0.12em] block overflow-hidden pb-[0.12em] text-stone rtl:-mt-[0.3em] rtl:pb-[0.3em]">
              <span {...rise(460)}>{hero.line2}</span>
            </span>
          </h1>
          <p {...fade(760)} className={cn('mt-8 max-w-[46ch] text-lg leading-relaxed text-stone sm:text-xl rtl:max-w-[40ch] rtl:leading-[1.9]', fade(760).className)}>
            {hero.text}
          </p>
          <div {...fade(900)} className={cn('mt-10 flex flex-wrap items-center gap-4', fade(900).className)}>
            <a href="#residence" className="label border border-paper bg-paper px-7 py-4 text-ink transition-colors duration-500 hover:border-bronze hover:bg-bronze">
              {hero.primary}
            </a>
            <a href="#projects" className="label border border-line px-7 py-4 text-paper transition-colors duration-500 hover:border-paper">
              {hero.secondary}
            </a>
          </div>
        </div>

        {/* Chapter marks, which double as a position indicator inside the film */}
        <div className="container-x flex items-end justify-between gap-6">
          <div className="min-h-[4rem]">
            {chapter && (
              <div key={chapter.label} className="animate-[fade_900ms_var(--ease-out)_both]">
                <p className="label text-bronze">{chapter.label}</p>
                <p className="mt-2 max-w-[38ch] text-sm text-paper/85 [text-shadow:0_1px_18px_rgba(14,15,16,0.55)]">{chapter.note}</p>
              </div>
            )}
            {!chapter && <p className="label text-stone/80">{hero.scroll}</p>}
          </div>

          <div className="hidden w-64 shrink-0 items-center gap-3 sm:flex" aria-hidden="true">
            <div className="h-px flex-1 bg-line">
              <div className="h-px bg-bronze transition-transform duration-200 ease-linear ltr:origin-left rtl:origin-right" style={{ transform: `scaleX(${progress})` }} />
            </div>
            <span lang="en" className="label latin tabular-nums text-stone">
              {String(Math.round(progress * 100)).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* A soft floor under the titles, so light type never has to sit on bright sky. It lies on
          the reading side and clears as soon as the camera starts moving. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-700"
        style={{
          opacity: 1 - titleOut,
          background: `linear-gradient(${dir === 'rtl' ? '255deg' : '105deg'}, rgba(14,15,16,0.92) 0%, rgba(14,15,16,0.72) 36%, rgba(14,15,16,0.14) 66%, transparent 86%)`,
        }}
      />
      {/* A lasting shade at the foot of the frame for the chapter notes. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-[30svh] bg-[linear-gradient(to_top,rgba(14,15,16,0.6),transparent)]" style={{ opacity: titleOut }} />
    </section>
  );
}
