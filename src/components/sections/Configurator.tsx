'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { GROUPS, resetSpec, ROOMS, setOption, useSpec, type Group, type RoomId, type Spec } from '@/lib/villa/config';
import { flyTo, ROOM_SHOT, setViewLift, type ShotName } from '@/lib/villa/camera';
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
  const spec = useSpec();
  const { locale, t } = useLocale();
  const configure = t.configure;
  // A surface the room's own shot cannot see (the entrance door) takes the camera with it.
  const [detour, setDetour] = useState<ShotName | null>(null);

  // The camera follows the section: it takes the room when you arrive, and lets the film
  // have the camera back when you leave.
  useEffect(() => {
    if (active) flyTo(detour ?? ROOM_SHOT[room], { orbit: true });
  }, [active, room, detour]);

  const groups = GROUPS.filter((group) => (room === 'residence' ? true : group.room === room));
  const chosen = GROUPS.map((group) => ({ group, choice: group.choices.find((item) => item.id === spec[group.id]) }));

  return (
    <section ref={section} id="residence" className="relative h-[150svh]" aria-label={configure.aria}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between pb-6 pt-[calc(var(--nav)+1.5rem)] max-md:pt-[calc(var(--nav)+1rem)]">
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

        <div className="container-x grid grid-cols-1 items-end gap-4 max-md:hidden md:grid-cols-12">
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
          <div className="md:col-span-7 md:col-start-6 lg:col-span-5 lg:col-start-8">
            <div className="border border-line bg-ink/95">
              <div className="max-h-[46svh] overflow-y-auto overscroll-contain px-5 py-5">
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
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
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

        {/* Phones get their own panel: one decision at a time, and short enough to leave the
            house on screen. */}
        <MobilePanel
          active={active}
          room={room}
          groups={groups}
          onRoom={(id) => {
            setRoom(id);
            setDetour(null);
          }}
          onChoose={(group) => setDetour(group.phoneShot ?? group.shot ?? null)}
        />

        {/* Hint that the house can be turned by hand once the camera settles. */}
        <p className="container-x label pointer-events-none mt-3 hidden text-stone/50 md:block">{configure.hint}</p>
      </div>
    </section>
  );
}

/**
 * The phone panel. The old version was a sheet that covered more than half the screen, so
 * whatever the visitor changed was hidden behind the controls that changed it. This one is a
 * third of the screen at most — rooms, then one group of finishes, then the choices as a row
 * of large swatches — and it tells the camera how tall it is, so the house is framed in the
 * part of the screen that is still visible.
 */
function MobilePanel({ active, room, groups, onRoom, onChoose }: { active: boolean; room: RoomId; groups: Group[]; onRoom: (id: RoomId) => void; onChoose: (group: Group) => void }) {
  const { locale, t } = useLocale();
  const spec = useSpec();
  const panel = useRef<HTMLDivElement>(null);
  // The group picked, remembered with the room it was picked in: a new room starts on its first.
  const [pick, setPick] = useState<{ room: RoomId; id: Group['id'] } | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const group = (pick?.room === room && groups.find((item) => item.id === pick.id)) || groups[0];

  // Tell the camera how much of the screen the panel takes. Only on phones, only while here.
  useEffect(() => {
    const element = panel.current;
    if (!element) return;
    const phone = window.matchMedia('(max-width: 767px)');
    const report = () => setViewLift(active && phone.matches ? element.getBoundingClientRect().height / window.innerHeight : 0);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(element);
    window.addEventListener('resize', report);
    phone.addEventListener('change', report);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', report);
      phone.removeEventListener('change', report);
      setViewLift(0);
    };
  }, [active]);

  // The name of what was just chosen, for a moment, so the change is confirmed even when the
  // surface is small on screen.
  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => setFlash(null), 1600);
    return () => window.clearTimeout(id);
  }, [flash]);

  if (!group) return null;
  const current = group.choices.find((choice) => choice.id === spec[group.id]);

  return (
    <div
      ref={panel}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-500 ease-[var(--ease-out)] md:hidden',
        !active && 'pointer-events-none translate-y-full',
      )}
      aria-hidden={!active}
    >
      {/* Rooms */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pt-3">
        {ROOMS.map((item) => {
          const on = item.id === room;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => onRoom(item.id)}
              className={cn('label shrink-0 whitespace-nowrap border px-3.5 py-2 transition-colors duration-300', on ? 'border-bronze/70 bg-[#2a2219] text-paper' : 'border-line text-stone')}
            >
              {item.label[locale]}
            </button>
          );
        })}
      </div>

      {/* Groups in this room */}
      <div className="no-scrollbar mt-2 flex gap-5 overflow-x-auto border-b border-line px-4">
        {groups.map((item) => {
          const on = item.id === group.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setPick({ room, id: item.id });
                onChoose(item);
              }}
              className={cn('relative shrink-0 whitespace-nowrap py-2.5 text-[0.82rem] transition-colors duration-300', on ? 'text-paper' : 'text-stone/70')}
            >
              {item.label[locale]}
              <span aria-hidden="true" className={cn('absolute inset-x-0 -bottom-px h-px bg-bronze transition-transform duration-300', on ? 'scale-x-100' : 'scale-x-0')} />
            </button>
          );
        })}
      </div>

      {/* The choices, large enough to tap and to see */}
      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <p className="text-[0.78rem] text-stone">{group.question[locale]}</p>
        <p className={cn('text-[0.78rem] transition-colors duration-500', flash ? 'text-bronze' : 'text-paper')} aria-live="polite">
          {current?.label[locale]}
        </p>
      </div>
      <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-1 pt-2.5">
        {group.choices.map((choice) => {
          const on = spec[group.id] === choice.id;
          return (
            <button
              key={choice.id}
              type="button"
              aria-pressed={on}
              aria-label={`${choice.label[locale]} — ${choice.note[locale]}`}
              onClick={() => {
                setOption(group.id, choice.id as Spec[typeof group.id]);
                onChoose(group);
                setFlash(choice.id);
                navigator.vibrate?.(8);
              }}
              className={cn('flex w-[4.75rem] shrink-0 flex-col items-center gap-1.5 border p-1.5 pb-2 transition-colors duration-300', on ? 'border-bronze bg-bronze/10' : 'border-line')}
            >
              <span className={cn('block aspect-square w-full border transition-transform duration-300', on ? 'scale-100 border-paper/40' : 'scale-[0.92] border-paper/10')} style={{ background: choice.swatch }} aria-hidden="true" />
              <span className={cn('line-clamp-2 min-h-[2.4em] text-center text-[0.7rem] leading-tight', on ? 'text-paper' : 'text-stone')}>{choice.label[locale]}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 px-4 pt-2.5">
        <a href="#contact" className="label flex-1 border border-paper bg-paper px-4 py-3 text-center text-ink">
          {t.configure.ctaShort}
        </a>
        <button type="button" onClick={resetSpec} aria-label={t.configure.reset} className="grid size-[2.9rem] shrink-0 place-items-center border border-line text-stone">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
