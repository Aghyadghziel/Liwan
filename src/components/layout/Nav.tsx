'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { studio } from '@/content/site';
import { otherLocale } from '@/lib/i18n';
import { cn } from '@/lib/cn';

/** Transparent over the film, then a thin line and a blur once the page starts moving. */
export function Nav() {
  const { locale, t } = useLocale();
  const pathname = usePathname() ?? `/${locale}`;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const home = pathname === `/${locale}`;
  // Section links are plain anchors on the home page and full links from anywhere else.
  const to = (hash: string) => (home ? hash : `/${locale}${hash}`);
  // The same page in the other language.
  const other = otherLocale(locale);
  const switchHref = `/${other}${pathname.slice(locale.length + 1)}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > (home ? window.innerHeight * 0.6 : 24));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [home]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const switcher = (className?: string) => (
    <Link
      href={switchHref}
      lang={other}
      hrefLang={other}
      aria-label={t.nav.switchLabel}
      className={cn('label text-stone transition-colors hover:text-paper', other === 'ar' ? '[font-family:var(--font-alexandria)] !text-[0.85rem] !tracking-normal' : 'latin', className)}
    >
      {t.nav.switchTo}
    </Link>
  );

  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-700', scrolled || open ? 'border-b border-line bg-ink/75 backdrop-blur-xl' : 'border-b border-transparent')}>
      <div className="container-x flex h-[var(--nav)] items-center justify-between gap-6">
        <a href={to('#top')} className="flex items-baseline gap-3 text-paper" aria-label={locale === 'ar' ? studio.nameAr : studio.name}>
          <span lang="en" className="label latin" style={{ letterSpacing: '0.42em' }}>
            {studio.name}
          </span>
          {locale === 'ar' && <span className="hidden text-[0.95rem] text-stone [font-family:var(--font-head)] sm:inline">{studio.nameAr}</span>}
        </a>

        <nav aria-label={t.nav.primary} className="hidden items-center gap-8 lg:flex">
          {t.nav.items.map((item) => (
            <a key={item.href} href={to(item.href)} className="label group relative py-2 text-stone transition-colors duration-500 hover:text-paper">
              {item.label}
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px scale-x-0 bg-bronze transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-x-100 ltr:origin-left rtl:origin-right" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          {switcher('hidden sm:inline-block')}
          <a href={to('#contact')} className="label hidden border border-line px-5 py-3 text-paper transition-colors duration-500 hover:border-bronze hover:text-bronze sm:inline-block">
            {t.nav.cta}
          </a>
          <button type="button" aria-label={open ? t.nav.close : t.nav.open} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="grid size-11 place-items-center lg:hidden">
            <span className="relative block h-3 w-6">
              <span className={cn('absolute inset-x-0 top-0 h-px bg-paper transition-transform duration-500', open && 'top-1.5 rotate-45')} />
              <span className={cn('absolute inset-x-0 bottom-0 h-px bg-paper transition-transform duration-500', open && 'bottom-1.5 -rotate-45')} />
            </span>
          </button>
        </div>
      </div>

      {/* Full-screen menu on phones: one column, large type, and the language at the foot. */}
      <div className={cn('fixed inset-x-0 bottom-0 top-[var(--nav)] z-40 h-[calc(100dvh-var(--nav))] overflow-y-auto bg-ink transition-opacity duration-500 lg:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')}>
        <nav aria-label={t.nav.primary} className="container-x flex min-h-full flex-col pb-10 pt-6">
          {t.nav.items.map((item, index) => (
            <a
              key={item.href}
              href={to(item.href)}
              onClick={() => setOpen(false)}
              className={cn('display-md border-b border-line py-5 text-paper transition-[color,opacity,transform] duration-700 ease-[var(--ease-out)] hover:text-bronze', !open && 'translate-y-3 opacity-0')}
              style={{ transitionDelay: open ? `${80 + index * 45}ms` : '0ms' }}
            >
              {item.label}
            </a>
          ))}
          <div className="mt-auto flex items-center justify-between gap-4 pt-10">
            {switcher('border border-line px-5 py-4 !text-paper')}
            <a href={to('#contact')} onClick={() => setOpen(false)} className="label flex-1 border border-bronze px-6 py-4 text-center text-bronze">
              {t.nav.cta}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
