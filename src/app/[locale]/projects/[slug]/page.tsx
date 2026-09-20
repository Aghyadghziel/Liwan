import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { Footer } from '@/components/sections/Editorial';
import { Drawing, drawingTitle } from '@/components/ui/Drawing';
import { Picture } from '@/components/ui/Picture';
import { Reveal, Rule } from '@/components/ui/Reveal';
import { projectMedia } from '@/content/media';
import { content, projectSlugs, studio, type DrawingId } from '@/content/site';
import { backward, isLocale, locales, onward } from '@/lib/i18n';

/**
 * A project reads as an architecture editorial: one large photograph, the facts, the argument
 * — site, concept, outside, inside — then the materials, a drawing and the specification.
 * Photographs change size and side as the page goes, so no two screens are composed alike.
 */

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.flatMap((locale) => projectSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/projects/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = content[locale].projects.find((item) => item.slug === slug);
  if (!project) return {};
  return {
    title: `${project.name} · ${project.location}`,
    description: project.summary,
    alternates: { canonical: `/${locale}/projects/${slug}`, languages: { ar: `/ar/projects/${slug}`, en: `/en/projects/${slug}` } },
  };
}

export default async function ProjectPage({ params }: PageProps<'/[locale]/projects/[slug]'>) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const t = content[locale];
  const copy = t.projectPage;
  const index = t.projects.findIndex((item) => item.slug === slug);
  if (index < 0) notFound();
  const project = t.projects[index];
  const next = t.projects[(index + 1) % t.projects.length];
  const media = projectMedia[project.slug] ?? {};
  const nextMedia = projectMedia[next.slug] ?? {};
  const isModel = project.drawing === 'model';

  const facts = [
    { label: copy.facts.name, value: project.name },
    { label: copy.facts.location, value: project.location },
    { label: copy.facts.type, value: project.type },
    { label: copy.facts.area, value: project.area },
    { label: copy.facts.year, value: isModel ? project.status : project.year },
    { label: copy.facts.scope, value: project.scope, wide: true },
  ];

  return (
    <>
      <SmoothScroll />
      <Nav />
      <main className="relative z-10 bg-ink">
        {/* 1 · Opening */}
        <header className="container-x pb-10 pt-[calc(var(--nav)+3rem)] md:pb-14 md:pt-[calc(var(--nav)+4.5rem)]">
          <Link href={`/${locale}#projects`} className="label inline-flex items-center gap-3 text-stone transition-colors duration-500 hover:text-paper">
            <span aria-hidden="true">{backward(locale)}</span>
            {copy.back}
          </Link>
          <div className="mt-12 grid items-end gap-8 md:mt-16 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="label flex items-center gap-3 text-bronze">
                <span lang="en" className="latin">
                  {project.number}
                </span>
                <span aria-hidden="true" className="h-px w-8 bg-bronze/50" />
                <span className="text-stone">{project.location}</span>
              </p>
              <h1 className="display-xl mt-6">{project.name}</h1>
            </div>
            <p className="editorial text-[clamp(1.25rem,1rem+1vw,1.9rem)] text-stone md:col-span-4 md:col-start-9 md:pb-3">{project.summary}</p>
          </div>
        </header>

        {media.hero && <Picture photo={media.hero} ratio="16/9" sizes="100vw" priority drift className="mx-auto w-full max-w-[120rem] max-md:[&>div]:!aspect-[4/5]" />}

        {/* 2 · Facts */}
        <section className="container-x mt-14 md:mt-20" aria-label={copy.factsAria}>
          <Rule />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-9 py-10 md:grid-cols-12 md:py-12">
            {facts.map((fact) => (
              <div key={fact.label} className={fact.wide ? 'col-span-2 md:col-span-4' : 'md:col-span-2 md:last:col-span-4'}>
                <dt className="label text-stone/70">{fact.label}</dt>
                <dd className="mt-3 leading-relaxed text-paper">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <Rule />
        </section>

        {/* 3 · Concept, beside a tall photograph */}
        <section className="container-x section-y grid gap-x-6 gap-y-12 md:grid-cols-12" aria-labelledby="concept">
          <div className="md:col-span-6 md:col-start-1 md:pt-6">
            <Reveal>
              <h2 id="concept" className="label text-bronze">
                {copy.concept}
              </h2>
            </Reveal>
            <Reveal delay={90}>
              <p className="editorial mt-8 text-[clamp(1.3rem,1rem+1.15vw,2.05rem)] leading-[1.32] rtl:leading-[1.75]">{project.concept}</p>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-10 max-w-[44ch] border-s border-line ps-5 text-stone">{project.plan}</p>
            </Reveal>
          </div>
          {media.tall && <Picture photo={media.tall} ratio="4/5" sizes="(min-width: 768px) 38vw, 100vw" drift className="md:col-span-5 md:col-start-8" />}
        </section>

        {/* 4 · Outside: a wide frame, with its paragraph tucked under one end */}
        <section className="container-x grid gap-x-6 gap-y-8 md:grid-cols-12" aria-labelledby="exterior">
          {(media.exterior ?? media.wide) && <Picture photo={(media.exterior ?? media.wide)!} ratio="3/2" sizes="(min-width: 768px) 70vw, 100vw" drift className="md:col-span-9" />}
          <Reveal className="md:col-span-3 md:self-end">
            <h2 id="exterior" className="label text-bronze">
              {copy.exterior}
            </h2>
            <p className="mt-5 text-stone">{project.exterior}</p>
          </Reveal>
        </section>

        {/* 5 · Inside: the mirror of it, smaller, with a detail beside */}
        <section className="container-x section-y grid gap-x-6 gap-y-8 md:grid-cols-12" aria-labelledby="interior">
          <Reveal className="md:col-span-3 md:col-start-1 md:row-start-1 md:self-start md:pt-2">
            <h2 id="interior" className="label text-bronze">
              {copy.interior}
            </h2>
            <p className="mt-5 text-stone">{project.interior}</p>
          </Reveal>
          {media.interior && <Picture photo={media.interior} ratio="4/3" sizes="(min-width: 768px) 46vw, 100vw" drift className="max-md:order-first md:col-span-6 md:col-start-4 md:row-start-1" />}
          {media.detail && <Picture photo={media.detail} ratio="3/4" sizes="(min-width: 768px) 22vw, 60vw" className="max-md:w-3/5 md:col-span-3 md:col-start-10 md:row-start-1 md:mt-[28%]" />}
        </section>

        {/* 6 · Materials */}
        <section className="bg-ink-2 section-y" aria-labelledby="materials-used">
          <div className="container-x grid gap-x-6 gap-y-10 md:grid-cols-12">
            <Reveal className="md:col-span-4">
              <h2 id="materials-used" className="display-md">
                {copy.materials}
              </h2>
            </Reveal>
            <ul className="md:col-span-7 md:col-start-6">
              {project.materials.map((material, materialIndex) => (
                <Reveal as="li" key={material.name} delay={materialIndex * 60}>
                  <div className="grid items-baseline gap-x-6 gap-y-1 border-t border-line py-6 sm:grid-cols-12">
                    <span lang="en" className="label latin text-bronze sm:col-span-1">
                      {String(materialIndex + 1).padStart(2, '0')}
                    </span>
                    <p className="display-md text-[1.35rem] sm:col-span-5">{material.name}</p>
                    <p className="text-stone sm:col-span-6">{material.note}</p>
                  </div>
                </Reveal>
              ))}
              <li className="border-t border-line" />
            </ul>
          </div>
        </section>

        {/* 7 · Drawing and specification */}
        <section className="section-y" aria-labelledby="drawings">
          <div className="container-x grid gap-x-6 gap-y-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <Reveal>
                <h2 id="drawings" className="display-md">
                  {copy.drawings}
                </h2>
                <p className="label mt-6 text-stone/70">{drawingTitle[project.drawing as DrawingId][locale]}</p>
              </Reveal>
              <Reveal delay={100}>
                <h3 className="label mt-14 text-bronze">{copy.specs}</h3>
                <dl className="mt-5">
                  {project.specs.map((spec) => (
                    <div key={spec.label} className="grid grid-cols-5 gap-4 border-t border-line py-4 text-[0.95rem]">
                      <dt className="col-span-2 text-stone/70">{spec.label}</dt>
                      <dd className="col-span-3 text-paper">{spec.value}</dd>
                    </div>
                  ))}
                  <div className="border-t border-line" />
                </dl>
              </Reveal>
            </div>
            <Reveal delay={120} className="md:col-span-7 md:col-start-6">
              <Drawing id={project.drawing as DrawingId} locale={locale} />
              <p className="mt-4 text-xs text-stone/60">{isModel ? copy.modelNote : copy.drawingNote}</p>
            </Reveal>
          </div>
        </section>

        {/* 8 · A last, full photograph */}
        {(media.closing ?? media.wide) && <Picture photo={(media.closing ?? media.wide)!} ratio="21/9" sizes="100vw" drift className="mx-auto w-full max-w-[120rem] max-md:[&>div]:!aspect-[4/3]" />}

        {/* 9 · The model */}
        <section className="container-x section-y" aria-labelledby="model">
          <div className="grid gap-8 border border-line p-8 sm:p-14 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="label text-bronze">{copy.model.label}</p>
              <h2 id="model" className="display-lg mt-5 max-w-[16ch]">
                {isModel ? copy.model.title : copy.model.titleOther}
              </h2>
            </div>
            <div className="md:col-span-4 md:col-start-9 md:self-end">
              <p className="text-stone">{copy.model.text}</p>
              <Link href={`/${locale}#residence`} className="label mt-8 inline-block border border-paper bg-paper px-8 py-4 text-ink transition-colors duration-500 hover:border-bronze hover:bg-bronze">
                {copy.model.cta}
              </Link>
            </div>
          </div>
        </section>

        {/* 10 · Next */}
        <Link href={`/${locale}/projects/${next.slug}`} className="group block border-t border-line">
          <div className="container-x grid items-center gap-8 py-16 md:grid-cols-12 md:py-24">
            <div className="md:col-span-6">
              <p className="label text-stone">{copy.next}</p>
              <p className="display-lg mt-4 transition-colors duration-700 group-hover:text-bronze">{next.name}</p>
              <p className="mt-3 flex items-center gap-3 text-stone">
                {next.location}
                <span aria-hidden="true" className="text-bronze transition-transform duration-700 ease-[var(--ease-out)] ltr:group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5">
                  {onward(locale)}
                </span>
              </p>
            </div>
            {nextMedia.hero && <Picture photo={nextMedia.hero} ratio="16/9" sizes="(min-width: 768px) 42vw, 100vw" imageClassName="group-hover:!scale-[1.03]" className="md:col-span-5 md:col-start-8" />}
          </div>
        </Link>

        {/* 11 · Contact */}
        <section className="container-x section-y border-t border-line text-center" aria-label={copy.contact.label}>
          <p className="label text-bronze">{copy.contact.label}</p>
          <h2 className="display-lg mx-auto mt-6 max-w-[16ch]">{copy.contact.title}</h2>
          <a href={`mailto:${studio.email}`} lang="en" className="label latin mt-10 inline-block border border-line px-8 py-4 text-paper transition-colors duration-500 hover:border-bronze hover:text-bronze">
            {studio.email}
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
