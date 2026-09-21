'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { GROUPS, resetSpec, ROOMS, setOption, useSpec, type RoomId, type Spec } from '@/lib/villa/config';
import { flyTo, ROOM_SHOT } from '@/lib/villa/camera';
import { useInView } from '@/lib/device';
import { cn } from '@/lib/cn';

/**
 * Configure your residence.
 *
 * The house stays on screen; only the controls move. Choosing a room flies the camera there
 * and narrows the options to what that room actually decides — four finishes, not forty.
 */

export function Configurator() {
  const section = useRef<HTMLElement>(null);
  const active = useInView(section, { once: false, amount: 0.3 });
  const [room, setRoom] = useState<RoomId>('residence');
  const [sheet, setSheet] = useState(false);
  const spec = useSpec();
  const { locale, t } = useLocale();
  const configure = t.configure;
  // A surface the room's own shot cannot see (the entrance door) takes the camera with it.
  const [detour, setDetour] = useState<'entrance' | null>(null);

  // The camera follows the section: it takes the room when you arrive, and lets the film
  // have the camera back when you leave.
  useEffect(() => {
    if (active) flyTo(detour ?? ROOM_SHOT[room], { orbit: true });
  }, [active, room, detour]);

  const groups = GROUPS.filter((group) => (room === 'residence' ? true : group.room === room));
  const chosen = GROUPS.map((group) => ({ group, choice: group.choices.find((item) => item.id === spec[group.id]) }));

  return (
    <section ref={section} id="residence" className="relative h-[150svh]" aria-label={configure.aria}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between pb-6 pt-[calc(var(--nav)+1.5rem)] max-md:pb-[4.75rem]">
        {/* A light scrim at the top and bottom, so controls and type stay readable whatever
            the camera is looking at. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38svh] bg-[linear-gradient(to_bottom,rgba(14,15,16,0.82),transparent)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[52svh] bg-[linear-gradient(to_top,rgba(14,15,16,0.86),transparent)]" />

        {/* Title, top left, small — the house is the subject here. */}
        <div className="container-x pointer-events-none">
          <p className="label text-bronze">{configure.label}</p>
          <h2 className="display-md mt-3 max-w-[18ch]">{configure.title}</h2>
          <p className="mt-4 hidden max-w-[40ch] text-sm leading-relaxed text-stone xl:block">{configure.text}</p>
        </div>

        <div className="container-x grid grid-cols-1 items-end gap-4 md:grid-cols-12">
          {/* Rooms */}
          <div className="min-w-0 md:col-span-5 lg:col-span-4">
            <div className="no-scrollbar -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] md:mx-0 md:flex-col md:px-0">
              {ROOMS.map((item) => {
                const current = item.id === room;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setRoom(item.id);
                      setDetour(null);
                      setSheet(true);
                    }}
                    aria-pressed={current}
                    className={cn(
                      'group flex shrink-0 items-center justify-between gap-6 border px-4 py-3 text-start transition-colors duration-500 md:w-full md:px-5 md:py-4',
                      current ? 'border-bronze/70 bg-[#2a2219]/90 text-paper' : 'border-line bg-ink/80 text-stone hover:border-paper/30 hover:text-paper',
                    )}
                  >
                    <span className="label whitespace-nowrap">{item.label[locale]}</span>
                    <span className="hidden text-xs text-stone/70 md:block">{item.hint[locale]}</span>
                  </button>
                );
              })}
            </div>

            <button type="button" onClick={resetSpec} className="label mt-3 hidden text-stone underline-offset-4 transition-colors hover:text-paper hover:underline md:block">
              {configure.reset}
            </button>
          </div>

          {/* Options: a floating panel on desktop, a sheet on phones. */}
          <div className={cn('md:col-span-7 md:col-start-6 lg:col-span-5 lg:col-start-8', 'max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-40 max-md:transition-transform max-md:duration-500', !sheet && active && 'max-md:translate-y-[calc(100%-3.5rem)]', !active && 'max-md:invisible max-md:translate-y-full')}>
            <div className="border border-line bg-ink/95">
              <button type="button" onClick={() => setSheet((value) => !value)} className="flex w-full items-center justify-between gap-4 border-b border-line px-5 py-4 md:hidden">
                <span className="label text-paper">{ROOMS.find((item) => item.id === room)?.label[locale]}</span>
                <span className="label text-bronze">{sheet ? configure.close : configure.open}</span>
              </button>

              <div className="max-h-[34svh] overflow-y-auto overscroll-contain px-5 py-5 md:max-h-[46svh]">
                {groups.map((group) => (
                  <fieldset key={group.id} className="mb-6 last:mb-0">
                    <legend className="label text-stone">{group.question[locale]}</legend>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.choices.map((choice) => {
                        const current = spec[group.id] === choice.id;
                        return (
                          <button
                            key={choice.id}
                            type="button"
                            aria-pressed={current}
                            onClick={() => {
                              setOption(group.id, choice.id as Spec[typeof group.id]);
                              setDetour(group.shot ?? null);
                            }}
                            className={cn(
                              'group flex items-center gap-2.5 border py-2 pe-4 ps-2 transition-colors duration-500',
                              current ? 'border-bronze bg-bronze/10' : 'border-line hover:border-paper/40',
                            )}
                          >
                            <span className="size-6 border border-paper/15" style={{ background: choice.swatch }} aria-hidden="true" />
                            <span className="text-start">
                              <span className={cn('block text-[0.82rem] leading-tight', current ? 'text-paper' : 'text-stone group-hover:text-paper')}>{choice.label[locale]}</span>
                              <span className="block text-[0.68rem] leading-tight text-stone/60 rtl:text-[0.72rem] rtl:leading-snug">{choice.note[locale]}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>

              {/* Specification summary */}
              <div className="border-t border-line px-5 py-3 md:py-4">
                <p className="label text-stone">{configure.summary}</p>
                <ul className="mt-2 hidden flex-wrap gap-x-4 gap-y-1 md:flex">
                  {chosen.map(({ group, choice }) => (
                    <li key={group.id} className="text-[0.72rem] text-stone">
                      <span className="text-stone/55">{group.label[locale]}:</span> <span className="text-paper">{choice?.label[locale]}</span>
                    </li>
                  ))}
                </ul>
                <a href="#contact" className="label mt-4 block border border-paper bg-paper px-5 py-3 text-center text-ink transition-colors hover:border-bronze hover:bg-bronze">
                  {configure.cta}
                </a>
                <p className="mt-2 text-[0.68rem] text-stone/60">{configure.note}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hint that the house can be turned by hand once the camera settles. */}
        <p className="container-x label pointer-events-none mt-3 hidden text-stone/50 md:block">{configure.hint}</p>
      </div>
    </section>
  );
}
