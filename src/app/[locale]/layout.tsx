import '../globals.css';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { LocaleProvider } from '@/components/providers/LocaleProvider';
import { content } from '@/content/site';
import { fontVariables } from '@/lib/fonts';
import { dirOf, isLocale, locales } from '@/lib/i18n';

export const dynamicParams = false;
export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export const viewport: Viewport = { themeColor: '#0e0f10', colorScheme: 'dark', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = content[locale];
  return {
    metadataBase: new URL('https://liwan.studio'),
    title: { default: t.meta.title, template: locale === 'ar' ? '%s — ليوان' : '%s — LIWAN' },
    description: t.meta.description,
    alternates: { canonical: `/${locale}`, languages: { ar: '/ar', en: '/en', 'x-default': '/ar' } },
    openGraph: {
      type: 'website',
      title: t.meta.title,
      description: t.meta.description,
      url: `/${locale}`,
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      alternateLocale: locale === 'ar' ? 'en_US' : 'ar_SA',
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} dir={dirOf(locale)} className={fontVariables}>
      <body>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
