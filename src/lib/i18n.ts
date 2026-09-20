export type Locale = 'ar' | 'en';
export type T = { ar: string; en: string };

/** Arabic is the default language: `/` redirects to `/ar`. */
export const defaultLocale: Locale = 'ar';
export const locales: Locale[] = ['ar', 'en'];
export const isLocale = (value: string): value is Locale => (locales as string[]).includes(value);
export const dirOf = (locale: Locale) => (locale === 'ar' ? 'rtl' : 'ltr');
export const otherLocale = (locale: Locale): Locale => (locale === 'ar' ? 'en' : 'ar');

/** Locale-prefixed path: href('en', '/projects/atrium-villa') → '/en/projects/atrium-villa'. */
export const href = (locale: Locale, path = '') => `/${locale}${path}`;

/** The arrow that points "onward" in the reading direction. */
export const onward = (locale: Locale) => (locale === 'ar' ? '←' : '→');
export const backward = (locale: Locale) => (locale === 'ar' ? '→' : '←');
