'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { Picture } from '@/components/ui/Picture';
import { Reveal, Rule } from '@/components/ui/Reveal';
import { materialMedia, projectMedia, studioMedia, type Photo } from '@/content/media';
import { studio, type Project } from '@/content/site';
import { GROUPS, useSpec } from '@/lib/villa/config';
import { onward } from '@/lib/i18n';
import { cn } from '@/lib/cn';

/**
 * The reading half of the site: everything that is not the house. These sections carry a
 * solid ground, which is also what hides the canvas behind them.
 */

/* ── The idea ─────────────────────────────────────────────── */

export function Statement() {
  const { t } = useLocale();
  const statement = t.statement;
  return (
    <section className="relative bg-ink section-y" aria-labelledby="idea">
      <div className="container-x">
        <Reveal>
          <p className="label text-bronze">{statement.label}</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 id="idea" className="editorial mt-8 max-w-[22ch] text-[clamp(2rem,1rem+4.4vw,5.25rem)] rtl:max-w-[20ch] rtl:text-[clamp(1.9rem,1rem+3.4vw,4.2rem)]">
            {statement.lead}
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-8 md:mt-20 md:grid-cols-12">
          {statement.body.map((paragraph, index) => (
            <Reveal key={paragraph} delay={160 + index * 90} className={cn('text-lg leading-relaxed text-stone rtl:leading-[2]', index === 0 ? 'md:col-span-5 md:col-start-3' : 'md:col-span-5')}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Why the model exists ─────────────────────────────────── */

export function Experience() {
  const { t } = useLocale();
  const experience = t.experience;
  return (
    <section id="experience" className="relative bg-ink-2 section-y" aria-labelledby="experience-title">
      <div className="container-x">
        <Reveal>
          <p className="label text-bronze">{experience.label}</p>
        </Reveal>
        <div className="mt-8 grid gap-10 md:grid-cols-12">
          <Reveal delay={60} className="md:col-span-6">
            <h2 id="experience-title" className="display-lg max-w-[12ch]">
              {experience.title}
            </h2>
          </Reveal>
          <Reveal delay={140} className="md:col-span-5 md:col-start-8 md:self-end">
            <p className="editorial text-[clamp(1.25rem,1rem+1vw,1.9rem)] text-stone">{experience.text}</p>
          </Reveal>
        </div>

        <ul className="mt-16 grid border-t border-line md:mt-24 md:grid-cols-3">
          {experience.points.map((point, index) => (
            <Reveal as="li" key={point.n} delay={index * 100} className={cn('border-b border-line py-10 md:border-b-0 md:py-12 md:pe-10', index > 0 && 'md:border-s md:ps-10')}>
              <p lang="en" className="label latin text-bronze">
                {point.n}
              </p>
              <h3 className="display-md mt-6 text-[clamp(1.3rem,1rem+1vw,1.8rem)]">{point.title}</h3>
              <p className="mt-4 max-w-[38ch] text-stone">{point.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Projects ─────────────────────────────────────────────── */

/** Four projects, four compositions: the grid changes with each so the page never repeats. */
const LAYOUTS = [
  { role: 'hero', ratio: '3/2', image: 'md:col-span-8', text: 'md:col-span-4 md:self-end', flip: false, sizes: '(min-width: 768px) 62vw, 100vw' },
  { role: 'tall', ratio: '4/5', image: 'md:col-span-5 md:col-start-8', text: 'md:col-span-5 md:col-start-2 md:self-center', flip: true, sizes: '(min-width: 768px) 40vw, 100vw' },
  { role: 'hero', ratio: '21/9', image: 'md:col-span-12', text: 'md:col-span-12', flip: false, sizes: '100vw' },
  { role: 'hero', ratio: '16/10', image: 'md:col-span-7 md:col-start-6', text: 'md:col-span-4 md:self-end', flip: true, sizes: '(min-width: 768px) 56vw, 100vw' },
] as const;

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const { locale, t } = useLocale();
  const layout = LAYOUTS[index % LAYOUTS.length];
  const media = projectMedia[project.slug] ?? {};
  const photo: Photo | undefined = media[layout.role] ?? media.hero;
  const wide = layout.ratio === '21/9';

  const text = (
    <div className={cn(layout.text, layout.flip && 'md:order-first md:row-start-1', wide && 'grid gap-6 md:grid-cols-12')}>
      <div className={cn(wide && 'md:col-span-5')}>
        <p className="label flex items-center gap-3 text-bronze">
          <span lang="en" className="latin">
            {project.number}
          </span>
          <span aria-hidden="true" className="h-px w-8 bg-bronze/50" />
          <span className="text-stone">{project.status}</span>
        </p>
        <h3 className="display-lg mt-5 text-[clamp(1.8rem,1rem+1.9vw,3rem)] [text-wrap:balance]">
          <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-no-repeat pb-1 transition-[background-size] duration-[900ms] ease-[var(--ease-out)] group-hover:bg-[length:100%_1px] ltr:bg-[position:0_100%] rtl:bg-[position:100%_100%]">{project.name}</span>
        </h3>
        <p className="mt-3 text-stone">
          {project.location} <span className="text-stone/40">·</span> <span lang="en" className="latin">{project.year}</span>
        </p>
      </div>
      <div className={cn(wide ? 'md:col-span-5 md:col-start-8 md:self-end' : 'mt-6')}>
        <p className="max-w-[42ch] text-stone">{project.summary}</p>
        <p className="label mt-6 inline-flex items-center gap-3 text-paper">
          {t.projectsSection.view}
          <span aria-hidden="true" className="text-bronze transition-transform duration-700 ease-[var(--ease-out)] ltr:group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5">
            {onward(locale)}
          </span>
        </p>
      </div>
    </div>
  );

  const image = (
    <div className={cn(layout.image, layout.flip && 'md:row-start-1', 'overflow-hidden')}>
      {photo ? (
        <Picture photo={photo} ratio={layout.ratio} sizes={layout.sizes} drift imageClassName="group-hover:!scale-[1.03]" className="max-md:[&>div]:!aspect-[4/3]" />
      ) : (
        <div className="w-full bg-ink-3" style={{ aspectRatio: layout.ratio }} />
      )}
    </div>
  );

  return (
    <Link href={`/${locale}/projects/${project.slug}`} className="group grid gap-x-6 gap-y-7 md:grid-cols-12" aria-label={`${project.name} — ${project.location}`}>
      {image}
      {text}
    </Link>
  );
}

export function Projects() {
  const { t } = useLocale();
  const copy = t.projectsSection;
  return (
    <section id="projects" className="relative bg-ink section-y" aria-labelledby="projects-title">
      <div className="container-x">
        <div className="grid items-end gap-6 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <p className="label text-bronze">{copy.label}</p>
            <h2 id="projects-title" className="display-lg mt-5 max-w-[14ch]">
              {copy.title}
            </h2>
          </Reveal>
          <Reveal delay={120} className="md:col-span-4 md:col-start-9">
            <p className="max-w-[36ch] text-stone">{copy.intro}</p>
          </Reveal>
        </div>

        <Rule className="mt-12" />

        <div className="mt-14 grid gap-y-24 md:mt-20 md:gap-y-40">
          {t.projects.map((project, index) => (
            <ProjectRow key={project.slug} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Materials ────────────────────────────────────────────── */

export function Materials() {
  const { t } = useLocale();
  const copy = t.materialsSection;
  return (
    <section id="materials" className="relative bg-ink-2 section-y" aria-labelledby="materials-title">
      <div className="container-x">
        <div className="grid items-end gap-6 md:grid-cols-12">
          <Reveal className="md:col-span-6">
            <p className="label text-bronze">{copy.label}</p>
            <h2 id="materials-title" className="display-lg mt-5 max-w-[16ch]">
              {copy.title}
            </h2>
          </Reveal>
          <Reveal delay={120} className="md:col-span-5 md:col-start-8">
            <p className="max-w-[48ch] text-stone">{copy.intro}</p>
          </Reveal>
        </div>
      </div>

      {/* A sample tray: swiped on a phone, laid out as a grid on a desk. */}
      <ul className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-2 md:container-x md:mt-20 md:grid md:grid-cols-4 md:gap-x-6 md:gap-y-16 md:overflow-visible md:px-0">
        {copy.items.map((material, index) => {
          const photo = materialMedia[material.id];
          return (
            <Reveal as="li" key={material.id} delay={(index % 4) * 80} className="group w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-auto">
              {photo ? <Picture photo={photo} ratio="4/5" sizes="(min-width: 768px) 22vw, 68vw" imageClassName="group-hover:!scale-[1.05]" /> : <div className="aspect-[4/5] w-full bg-ink-3" />}
              <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-line pb-4">
                <h3 className="display-md text-[1.35rem] rtl:text-[1.3rem]">{material.name}</h3>
                <span lang="en" className="label latin text-stone/50">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <p className="label mt-4 text-bronze">{material.use}</p>
              <p className="mt-3 text-sm leading-relaxed text-stone rtl:text-[0.95rem] rtl:leading-[1.9]">{material.note}</p>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}

/* ── Services ─────────────────────────────────────────────── */

export function Services() {
  const { t } = useLocale();
  const copy = t.servicesSection;
  return (
    <section className="relative bg-ink section-y" aria-labelledby="services-title">
      <div className="container-x">
        <Reveal>
          <p className="label text-bronze">{copy.label}</p>
          <h2 id="services-title" className="display-lg mt-5 max-w-[13ch]">
            {copy.title}
          </h2>
        </Reveal>

        <ul className="mt-14 md:mt-20">
          {copy.items.map((service, index) => (
            <Reveal as="li" key={service.n} delay={index * 45}>
              <div className="group grid items-baseline gap-2 border-t border-line py-7 transition-[padding] duration-700 ease-[var(--ease-out)] hover:ps-4 md:grid-cols-12 md:gap-6">
                <span lang="en" className="label latin text-bronze md:col-span-1">
                  {service.n}
                </span>
                <h3 className="display-md text-[clamp(1.4rem,1rem+1.4vw,2.2rem)] transition-colors duration-500 group-hover:text-bronze md:col-span-5">{service.name}</h3>
                <p className="text-stone md:col-span-5 md:col-start-8">{service.text}</p>
              </div>
            </Reveal>
          ))}
          <li className="border-t border-line" />
        </ul>
      </div>
    </section>
  );
}

/* ── Studio ───────────────────────────────────────────────── */

export function StudioStory() {
  const { t } = useLocale();
  const copy = t.studioStory;
  return (
    <section id="studio" className="relative bg-ink-2 section-y" aria-labelledby="studio-title">
      <div className="container-x grid gap-x-6 gap-y-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <Reveal>
            <p className="label text-bronze">{copy.label}</p>
            <h2 id="studio-title" className="display-lg mt-5 max-w-[12ch]">
              {copy.title}
            </h2>
          </Reveal>
          {studioMedia.desk && (
            <Reveal delay={120} className="mt-12 md:mt-16">
              <Picture photo={studioMedia.desk} ratio="4/5" sizes="(min-width: 768px) 38vw, 100vw" drift />
            </Reveal>
          )}
        </div>

        <div className="md:col-span-6 md:col-start-7 md:pt-[clamp(4rem,9vw,9rem)]">
          {copy.body.map((paragraph, index) => (
            <Reveal key={paragraph} delay={80 + index * 90}>
              <p className="mb-6 text-lg leading-relaxed text-stone rtl:leading-[2]">{paragraph}</p>
            </Reveal>
          ))}

          {/* The word the studio is named after, set as a dictionary entry. */}
          <Reveal delay={220}>
            <div className="mt-12 border-s border-bronze/60 ps-6">
              <p className="editorial text-[clamp(1.6rem,1rem+1.6vw,2.4rem)] text-paper">{copy.definition.term}</p>
              <p className="editorial mt-3 max-w-[40ch] text-[clamp(1.1rem,1rem+0.5vw,1.4rem)] text-stone">{copy.definition.text}</p>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <dl className="mt-14 grid grid-cols-2 border-t border-line sm:grid-cols-4">
              {copy.facts.map((fact, index) => (
                <div key={fact.label} className={cn('border-b border-line py-6 pe-4', index % 2 === 1 && 'max-sm:border-s max-sm:ps-5', index > 0 && 'sm:border-s sm:ps-5')}>
                  <dd className="display-md text-[clamp(1.5rem,1rem+1.2vw,2.1rem)] text-paper">{fact.value}</dd>
                  <dt className="label mt-2 text-stone">{fact.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── Contact ──────────────────────────────────────────────── */

/**
 * There is no server behind this demonstration, so the form does the honest thing: it writes
 * the email for you — site, brief and the specification chosen in the model — and opens it in
 * your own mail app. Nothing claims to have been sent that was not.
 */
export function Contact() {
  const { locale, t } = useLocale();
  const copy = t.contact;
  const spec = useSpec();
  const [prepared, setPrepared] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  const specLines = GROUPS.map((group) => `${group.label[locale]}: ${group.choices.find((choice) => choice.id === spec[group.id])?.label[locale] ?? ''}`);

  const field = 'mt-3 w-full border-b border-line bg-transparent pb-3 text-lg text-paper outline-none transition-colors duration-500 placeholder:text-stone/40 focus:border-bronze';

  return (
    <section id="contact" className="relative bg-ink section-y" aria-labelledby="contact-title">
      <div className="container-x grid gap-12 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <p className="label text-bronze">{copy.label}</p>
          <h2 id="contact-title" className="display-lg mt-5 max-w-[10ch]">
            {copy.title}
          </h2>
          <p className="mt-6 max-w-[38ch] text-stone">{copy.text}</p>
          <p className="label mt-10 text-stone">{copy.direct}</p>
          <a href={`mailto:${studio.email}`} lang="en" className="latin display-md mt-2 inline-block text-[clamp(1.2rem,1rem+0.8vw,1.7rem)] text-paper underline-offset-8 transition-colors duration-500 hover:text-bronze hover:underline">
            {studio.email}
          </a>
        </Reveal>

        <Reveal delay={120} className="md:col-span-6 md:col-start-7">
          <form
            ref={form}
            className="grid gap-6"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const body = [
                `${copy.fields.name}: ${data.get('name') ?? ''}`,
                `${copy.fields.email}: ${data.get('email') ?? ''}`,
                `${copy.fields.location}: ${data.get('location') ?? ''}`,
                '',
                `${data.get('brief') ?? ''}`,
                '',
                `— ${t.configure.summary} —`,
                ...specLines,
              ].join('\n');
              window.location.href = `mailto:${studio.email}?subject=${encodeURIComponent(copy.subject)}&body=${encodeURIComponent(body)}`;
              setPrepared(true);
            }}
          >
            {(['name', 'email', 'location'] as const).map((name) => (
              <label key={name} className="block">
                <span className="label text-stone">{copy.fields[name]}</span>
                <input
                  name={name}
                  type={name === 'email' ? 'email' : 'text'}
                  dir={name === 'email' ? 'ltr' : undefined}
                  required
                  autoComplete={name === 'email' ? 'email' : name === 'name' ? 'name' : 'off'}
                  className={cn(field, name === 'email' && 'latin rtl:text-end')}
                />
              </label>
            ))}
            <label className="block">
              <span className="label text-stone">{copy.fields.brief}</span>
              <textarea name="brief" rows={3} className={cn(field, 'resize-none')} />
            </label>
            <p className="text-sm text-stone/70">{copy.spec}</p>
            <button type="submit" className="label mt-2 justify-self-start border border-paper bg-paper px-8 py-4 text-ink transition-colors duration-500 hover:border-bronze hover:bg-bronze">
              {copy.send}
            </button>
            <p className={cn('text-sm text-bronze', !prepared && 'hidden')} role="status">
              {copy.sent}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────────── */

export function Footer() {
  const { locale, t } = useLocale();
  const copy = t.footer;
  return (
    <footer className="relative border-t border-line bg-ink">
      <div className="container-x grid gap-10 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <p className="flex items-baseline gap-3 text-paper">
            <span lang="en" className="label latin" style={{ letterSpacing: '0.42em' }}>
              {studio.name}
            </span>
            {locale === 'ar' && <span className="text-stone [font-family:var(--font-head)]">{studio.nameAr}</span>}
          </p>
          <p className="mt-4 max-w-[28ch] text-stone">{t.studio.line}</p>
        </div>
        <div className="md:col-span-3">
          <p className="label text-stone">{copy.studio}</p>
          <p className="mt-4 max-w-[24ch] text-paper">{t.studio.address}</p>
          <p className="text-stone">{t.studio.founded}</p>
        </div>
        <div className="md:col-span-4">
          <p className="label text-stone">{copy.contact}</p>
          <a href={`mailto:${studio.email}`} lang="en" className="latin mt-4 block w-fit text-paper transition-colors duration-500 hover:text-bronze">
            {studio.email}
          </a>
          <p lang="en" className="latin w-fit text-stone">
            {studio.phone}
          </p>
        </div>
      </div>
      <div className="container-x grid gap-2 border-t border-line py-6 text-xs leading-relaxed text-stone/60 md:grid-cols-12">
        <p className="md:col-span-5">
          © <span lang="en" className="latin">{new Date().getFullYear()}</span> · {copy.concept}
        </p>
        <p className="md:col-span-7 md:text-end">
          {copy.credits}{' '}
          <Link href={`/${locale}/credits`} className="text-stone underline underline-offset-4 transition-colors hover:text-paper">
            {copy.creditsLink}
          </Link>
        </p>
      </div>
    </footer>
  );
}
