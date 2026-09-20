import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/sections/Editorial';
import { allPhotos } from '@/content/media';
import { backward, isLocale } from '@/lib/i18n';

/** Who took the photographs. LIWAN is a concept; the pictures are other people's real work. */

const copy = {
  ar: {
    title: 'قائمة المصوّرين',
    text: 'ليوان استوديو تخيّلي. الصور المستخدمة لتوضيح المشاريع والمواد صور مرجعية من موقع Unsplash، التقطها المصوّرون المذكورون أدناه لمبانٍ حقيقية لا علاقة لها بهذا الاستوديو. أما صور «مسكن حطين» فمأخوذة من النموذج ثلاثي الأبعاد في هذا الموقع.',
    back: 'العودة إلى الرئيسية',
    by: 'تصوير',
  },
  en: {
    title: 'Photo credits',
    text: 'LIWAN is a fictional studio. The photographs used to illustrate its projects and materials are reference images from Unsplash, taken by the photographers below of real buildings that have no connection to this studio. The Hittin Residence images are frames of the 3D model on this site.',
    back: 'Back to the home page',
    by: 'Photograph by',
  },
};

export const metadata: Metadata = { robots: { index: false } };

export default async function CreditsPage({ params }: PageProps<'/[locale]/credits'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = copy[locale];
  const photos = allPhotos();

  return (
    <>
      <Nav />
      <main className="relative z-10 bg-ink">
        <div className="container-x pb-24 pt-[calc(var(--nav)+4rem)]">
          <Link href={`/${locale}`} className="label inline-flex items-center gap-3 text-stone transition-colors hover:text-paper">
            <span aria-hidden="true">{backward(locale)}</span>
            {c.back}
          </Link>
          <h1 className="display-lg mt-12">{c.title}</h1>
          <p className="mt-8 max-w-[68ch] text-lg text-stone">{c.text}</p>
          <ul className="mt-14 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <li key={photo.src} className="border-t border-line py-4 text-sm">
                <p className="text-paper">{photo.alt[locale]}</p>
                <p className="mt-1 text-stone">
                  {c.by}{' '}
                  <a href={photo.credit!.url} target="_blank" rel="noreferrer" lang="en" className="latin underline underline-offset-4 transition-colors hover:text-paper">
                    {photo.credit!.name}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
