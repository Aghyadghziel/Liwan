'use client';

import { useEffect, useState } from 'react';
import { nav, studio } from '@/content/site';
import { cn } from '@/lib/cn';

/** Transparent over the film, then a thin line and a blur once the page starts moving. */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-700', scrolled ? 'border-b border-line bg-ink/70 backdrop-blur-xl' : 'border-b border-transparent')}>
      <div className="container-x flex h-[var(--nav)] items-center justify-between gap-6">
        <a href="#top" className="label text-paper" style={{ letterSpacing: '0.42em' }}>
          {studio.name}
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="label text-stone transition-colors hover:text-paper">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="#contact" className="label hidden border border-line px-5 py-3 text-paper transition-colors hover:border-bronze hover:text-bronze sm:inline-block">
            Start a project
          </a>
          <button type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="grid size-11 place-items-center lg:hidden">
            <span className="relative block h-3 w-6">
              <span className={cn('absolute inset-x-0 top-0 h-px bg-paper transition-transform duration-500', open && 'top-1.5 rotate-45')} />
              <span className={cn('absolute inset-x-0 bottom-0 h-px bg-paper transition-transform duration-500', open && 'bottom-1.5 -rotate-45')} />
            </span>
          </button>
        </div>
      </div>

      {/* Full-screen menu on phones: one column, large type, nothing else. */}
      <div className={cn('fixed inset-0 top-[var(--nav)] z-40 bg-ink transition-opacity duration-500 lg:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')}>
        <nav aria-label="Primary" className="container-x flex flex-col gap-2 pt-10">
          {nav.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="display-md border-b border-line py-5 text-paper transition-colors hover:text-bronze"
              style={{ transitionDelay: `${index * 40}ms` }}
            >
              {item.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)} className="label mt-6 border border-bronze px-6 py-4 text-center text-bronze">
            Start a project
          </a>
        </nav>
      </div>
    </header>
  );
}
