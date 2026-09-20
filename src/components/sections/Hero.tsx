'use client';

import { useEffect, useRef, useState } from 'react';
import { hero } from '@/content/site';
import { setPathProgress } from '@/lib/villa/camera';
import { useReducedMotion } from '@/lib/device';

/**
 * The opening film. The section is four screens tall and the house is fixed behind it; as you
 * scroll, the camera runs the path — wide, approach, threshold, living, kitchen, pool, out.
 * The type is pinned to the first screen and steps aside once the camera is inside.
 */

const CHAPTERS = [
  { at: 0.06, label: 'The residence', note: 'Single storey, 24 by 14 metres, facing the pool' },
  { at: 0.3, label: 'The threshold', note: 'Four metres of glass, and a roof that oversails by one and a half' },
  { at: 0.52, label: 'Living', note: 'One room, north lit through the slots, south open to the terrace' },
  { at: 0.7, label: 'Kitchen', note: 'Island in stone, cabinetry in oak, both specified by you' },
  { at: 0.86, label: 'The terrace', note: 'Twelve-metre pool, laid along the evening sun' },
];

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const reduced = useReducedMotion();

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
      if (onScreen) setPathProgress(reduced ? Math.round(value * 6) / 6 : value);
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
    };
  }, [reduced]);

  // The headline holds the first screen, then hands over to the house.
  const titleOut = Math.min(1, progress / 0.14);
  const chapter = [...CHAPTERS].reverse().find((item) => progress >= item.at);

  return (
    <section ref={section} id="top" className="relative h-[420svh]" aria-label="The residence, in film">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between overflow-hidden pb-8 pt-[var(--nav)]">
        {/* Opening titles */}
        <div
          className="container-x flex flex-1 flex-col justify-center transition-[opacity,transform] duration-300"
          style={{ opacity: 1 - titleOut, transform: `translateY(${titleOut * -40}px)`, pointerEvents: titleOut > 0.6 ? 'none' : 'auto' }}
        >
          <p className="label text-bronze">{hero.kicker}</p>
          <h1 className="display-xl mt-6 max-w-[15ch]">
            {hero.line1}
            <span className="block text-stone">{hero.line2}</span>
          </h1>
          <p className="mt-8 max-w-[46ch] text-lg leading-relaxed text-stone sm:text-xl">{hero.text}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="#residence" className="label border border-paper bg-paper px-7 py-4 text-ink transition-colors hover:border-bronze hover:bg-bronze">
              {hero.primary}
            </a>
            <a href="#projects" className="label border border-line px-7 py-4 text-paper transition-colors hover:border-paper">
              {hero.secondary}
            </a>
          </div>
        </div>

        {/* Chapter marks, which double as a position indicator inside the film */}
        <div className="container-x flex items-end justify-between gap-6">
          <div className="min-h-[3.5rem]">
            {chapter && (
              <div key={chapter.label} className="animate-[fade_900ms_var(--ease-out)_both]">
                <p className="label text-bronze">{chapter.label}</p>
                <p className="mt-2 max-w-[38ch] text-sm text-stone">{chapter.note}</p>
              </div>
            )}
            {!chapter && <p className="label text-stone/70">{hero.scroll}</p>}
          </div>

          <div className="hidden w-64 shrink-0 items-center gap-3 sm:flex" aria-hidden="true">
            <div className="h-px flex-1 bg-line">
              <div className="h-px origin-left bg-bronze transition-transform duration-200 ease-linear" style={{ transform: `scaleX(${progress})` }} />
            </div>
            <span className="label tabular-nums text-stone">{String(Math.round(progress * 100)).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* A soft floor under the titles, so white type never has to sit on bright sky. It
          clears as soon as the camera starts moving and the type is gone. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-700"
        style={{
          opacity: 1 - titleOut,
          background: 'linear-gradient(105deg, rgba(14,15,16,0.92) 0%, rgba(14,15,16,0.7) 38%, rgba(14,15,16,0.12) 68%, transparent 88%)',
        }}
      />
    </section>
  );
}
