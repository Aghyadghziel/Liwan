'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { Reveal, Rule } from '@/components/ui/Reveal';
import { contact, experience, materials, projects, services, statement, studio, studioStory, type Project } from '@/content/site';
import { useInView } from '@/lib/device';
import { cn } from '@/lib/cn';

/**
 * The reading half of the site: everything that is not the house. These sections carry a
 * solid ground, which is also what hides the canvas behind them.
 *
 * There is no photography here on purpose. Each project is represented by its own materials
 * — the actual stone, timber and metal specified for it — so nothing on the page pretends to
 * be a building that has not been photographed.
 */

const TONES: Record<Project['tone'], { from: string; to: string; ink: string }> = {
  sand: { from: '#cbb79a', to: '#8d7a5f', ink: '#20170e' },
  shade: { from: '#9aa0a2', to: '#4b5053', ink: '#0f1112' },
  stone: { from: '#d3cec2', to: '#8f8a7c', ink: '#1b1a15' },
  night: { from: '#4a4f57', to: '#1d2126', ink: '#f4f1ec' },
};

/* ── The idea ─────────────────────────────────────────────── */

export function Statement() {
  return (
    <section className="relative bg-ink section-y" aria-labelledby="idea">
      <div className="container-x">
        <Reveal>
          <p className="label text-bronze">{statement.label}</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 id="idea" className="editorial mt-8 max-w-[22ch] text-[clamp(2rem,1rem+4.4vw,5.25rem)]">
            {statement.lead}
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-12">
          {statement.body.map((paragraph, index) => (
            <Reveal key={paragraph} delay={160 + index * 90} className={cn('text-lg leading-relaxed text-stone', index === 0 ? 'md:col-span-5 md:col-start-6' : 'md:col-span-5')}>
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

        <ul className="mt-20 grid gap-px bg-line md:grid-cols-3">
          {experience.points.map((point, index) => (
            <Reveal as="li" key={point.n} delay={index * 100} className="bg-ink-2 p-8 sm:p-10">
              <p className="label text-bronze">{point.n}</p>
              <h3 className="display-md mt-6 text-[clamp(1.3rem,1rem+1vw,1.8rem)]">{point.title}</h3>
              <p className="mt-4 text-stone">{point.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Projects ─────────────────────────────────────────────── */

function ProjectPanel({ project }: { project: Project }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const tone = TONES[project.tone];

  return (
    <Link
      ref={ref}
      href={`/projects/${project.slug}`}
      className="group relative block overflow-hidden"
      aria-label={`${project.name}, ${project.location}`}
    >
      {/* The project's own materials, as its image. */}
      <div
        className={cn('relative aspect-[4/5] w-full transition-transform duration-[1600ms] ease-[var(--ease-out)] group-hover:scale-[1.03] sm:aspect-[3/4]', !inView && 'scale-[1.06]')}
        style={{ background: `linear-gradient(152deg, ${tone.from} 0%, ${tone.to} 100%)` }}
      >
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.18] mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />
        <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8" style={{ color: tone.ink }}>
          <div className="flex items-start justify-between gap-4">
            <span className="label">{project.number}</span>
            <span className="label text-right opacity-70">{project.status}</span>
          </div>
          <div>
            <p className="label opacity-70">{project.location}</p>
            <h3 className="display-md mt-2 text-[clamp(1.5rem,1rem+1.6vw,2.4rem)]">{project.name}</h3>
          </div>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-4 border-t border-line py-4">
        <p className="text-sm text-stone">{project.summary}</p>
        <span className="label shrink-0 text-bronze transition-transform duration-500 group-hover:translate-x-1">View →</span>
      </div>
    </Link>
  );
}

export function Projects() {
  return (
    <section id="projects" className="relative bg-ink section-y" aria-labelledby="projects-title">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="label text-bronze">Selected work</p>
            <h2 id="projects-title" className="display-lg mt-5 max-w-[14ch]">
              Four houses, four sites.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="max-w-[34ch] text-stone">Each one begins with what the plot gives and what it refuses. The rest follows from that.</p>
          </Reveal>
        </div>

        <Rule className="mt-12" />

        <div className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project, index) => (
            <Reveal key={project.slug} delay={index * 90}>
              <ProjectPanel project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Materials ────────────────────────────────────────────── */

export function Materials() {
  return (
    <section id="materials" className="relative bg-ink-2 section-y" aria-labelledby="materials-title">
      <div className="container-x">
        <Reveal>
          <p className="label text-bronze">Materials</p>
          <h2 id="materials-title" className="display-lg mt-5 max-w-[16ch]">
            Eight materials. Nothing else.
          </h2>
          <p className="mt-6 max-w-[48ch] text-stone">A short palette, used everywhere, is what makes a house feel resolved. These are the ones we keep returning to, and what each is for.</p>
        </Reveal>

        <ul className="mt-16 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {materials.map((material, index) => (
            <Reveal as="li" key={material.name} delay={(index % 4) * 80} className="group relative bg-ink-2 p-7">
              <span className="block h-24 w-full transition-transform duration-[1200ms] ease-[var(--ease-out)] group-hover:scale-[1.04]" style={{ background: material.swatch }} aria-hidden="true" />
              <h3 className="display-md mt-6 text-[1.35rem]">{material.name}</h3>
              <p className="label mt-3 text-bronze">{material.use}</p>
              <p className="mt-3 text-sm leading-relaxed text-stone">{material.note}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Services ─────────────────────────────────────────────── */

export function Services() {
  return (
    <section className="relative bg-ink section-y" aria-labelledby="services-title">
      <div className="container-x">
        <Reveal>
          <p className="label text-bronze">What we do</p>
          <h2 id="services-title" className="display-lg mt-5 max-w-[12ch]">
            From the first sketch to the keys.
          </h2>
        </Reveal>

        <ul className="mt-14">
          {services.map((service, index) => (
            <Reveal as="li" key={service.n} delay={index * 45}>
              <div className="group grid items-baseline gap-2 border-t border-line py-7 transition-[padding] duration-700 ease-[var(--ease-out)] hover:ps-4 md:grid-cols-12 md:gap-6">
                <span className="label text-bronze md:col-span-1">{service.n}</span>
                <h3 className="display-md text-[clamp(1.4rem,1rem+1.4vw,2.2rem)] md:col-span-5">{service.name}</h3>
                <p className="text-stone md:col-span-6">{service.text}</p>
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
  return (
    <section id="studio" className="relative bg-ink-2 section-y" aria-labelledby="studio-title">
      <div className="container-x grid gap-12 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <p className="label text-bronze">{studioStory.label}</p>
          <h2 id="studio-title" className="display-lg mt-5 max-w-[12ch]">
            {studioStory.title}
          </h2>
        </Reveal>
        <div className="md:col-span-6 md:col-start-7">
          {studioStory.body.map((paragraph, index) => (
            <Reveal key={paragraph} delay={80 + index * 90}>
              <p className="mb-6 text-lg leading-relaxed text-stone">{paragraph}</p>
            </Reveal>
          ))}
          <Reveal delay={260}>
            <dl className="mt-10 grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
              {studioStory.stats.map((stat) => (
                <div key={stat.label} className="bg-ink-2 py-6 pe-4">
                  <dd className="display-md text-[clamp(1.6rem,1rem+1.6vw,2.4rem)] text-paper">{stat.value}</dd>
                  <dt className="label mt-2 text-stone">{stat.label}</dt>
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

export function Contact() {
  const sent = useRef<HTMLParagraphElement>(null);

  return (
    <section id="contact" className="relative bg-ink section-y" aria-labelledby="contact-title">
      <div className="container-x grid gap-12 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <p className="label text-bronze">{contact.label}</p>
          <h2 id="contact-title" className="display-lg mt-5 max-w-[10ch]">
            {contact.title}
          </h2>
          <p className="mt-6 max-w-[38ch] text-stone">{contact.text}</p>
          <p className="label mt-10 text-stone">{contact.direct}</p>
          <a href={`mailto:${studio.email}`} className="display-md mt-2 block text-[clamp(1.2rem,1rem+0.8vw,1.7rem)] text-paper underline-offset-8 transition-colors hover:text-bronze hover:underline">
            {studio.email}
          </a>
        </Reveal>

        <Reveal delay={120} className="md:col-span-6 md:col-start-7">
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              form.reset();
              sent.current?.classList.remove('hidden');
            }}
          >
            {(['name', 'email', 'location'] as const).map((field) => (
              <label key={field} className="block">
                <span className="label text-stone">{contact.fields[field]}</span>
                <input
                  name={field}
                  type={field === 'email' ? 'email' : 'text'}
                  required
                  autoComplete={field === 'email' ? 'email' : field === 'name' ? 'name' : 'off'}
                  className="mt-3 w-full border-b border-line bg-transparent pb-3 text-lg text-paper outline-none transition-colors placeholder:text-stone/40 focus:border-bronze"
                />
              </label>
            ))}
            <label className="block">
              <span className="label text-stone">{contact.fields.brief}</span>
              <textarea name="brief" rows={3} className="mt-3 w-full resize-none border-b border-line bg-transparent pb-3 text-lg text-paper outline-none transition-colors focus:border-bronze" />
            </label>
            <button type="submit" className="label mt-4 justify-self-start border border-paper bg-paper px-8 py-4 text-ink transition-colors hover:border-bronze hover:bg-bronze">
              {contact.send}
            </button>
            <p ref={sent} className="hidden text-sm text-bronze" role="status">
              {contact.sent}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────────── */

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink">
      <div className="container-x grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="label text-paper" style={{ letterSpacing: '0.42em' }}>
            {studio.name}
          </p>
          <p className="mt-4 max-w-[26ch] text-stone">{studio.line}</p>
        </div>
        <div className="md:col-span-3">
          <p className="label text-stone">Studio</p>
          <p className="mt-4 text-paper">{studio.city}</p>
          <p className="text-stone">Founded {studio.founded}</p>
        </div>
        <div className="md:col-span-4">
          <p className="label text-stone">Contact</p>
          <a href={`mailto:${studio.email}`} className="mt-4 block text-paper transition-colors hover:text-bronze">
            {studio.email}
          </a>
          <p className="text-stone">{studio.phone}</p>
        </div>
      </div>
      <div className="container-x flex flex-col gap-2 border-t border-line py-6 text-xs text-stone/60 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {studio.name}. A fictional studio, designed and built as a demonstration.</p>
        <p>Every surface in the 3D model is drawn in code — no downloaded assets.</p>
      </div>
    </footer>
  );
}
