import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/sections/Editorial';
import { Reveal, Rule } from '@/components/ui/Reveal';
import { Plan } from '@/components/ui/Plan';
import { projects, studio } from '@/content/site';

/**
 * A project reads as an architecture editorial: one material field for the opening, then the
 * argument — site, concept, materials, inside, outside — and a drawn plan rather than a
 * photograph, because a plan is the honest document.
 */

export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};
  return {
    title: `${project.name}, ${project.location}`,
    description: project.summary,
  };
}

const TONES: Record<string, { from: string; to: string; ink: string }> = {
  sand: { from: '#cbb79a', to: '#8d7a5f', ink: '#20170e' },
  shade: { from: '#9aa0a2', to: '#4b5053', ink: '#0f1112' },
  stone: { from: '#d3cec2', to: '#8f8a7c', ink: '#1b1a15' },
  night: { from: '#4a4f57', to: '#1d2126', ink: '#f4f1ec' },
};

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const index = projects.findIndex((item) => item.slug === slug);
  const next = projects[(index + 1) % projects.length];
  const tone = TONES[project.tone];

  const facts = [
    { label: 'Location', value: project.location },
    { label: 'Area', value: project.area },
    { label: 'Bedrooms', value: project.bedrooms },
    { label: 'Architecture', value: project.architecture },
    { label: 'Completion', value: project.year },
    { label: 'Status', value: project.status },
  ];

  return (
    <>
      <Nav />
      <main className="relative z-10 bg-ink">
        {/* 1 · Opening */}
        <header className="container-x pb-10 pt-[calc(var(--nav)+3.5rem)]">
          <Link href="/#projects" className="label text-stone transition-colors hover:text-paper">
            ← All projects
          </Link>
          <p className="label mt-12 text-bronze">
            {project.number} · {project.location}
          </p>
          <h1 className="display-xl mt-5 max-w-[14ch]">{project.name}</h1>
          <p className="editorial mt-8 max-w-[38ch] text-[clamp(1.3rem,1rem+1.2vw,2.1rem)] text-stone">{project.summary}</p>
        </header>

        <div className="container-x">
          <div className="relative aspect-[21/9] w-full overflow-hidden" style={{ background: `linear-gradient(152deg, ${tone.from} 0%, ${tone.to} 100%)` }}>
            <div aria-hidden="true" className="absolute inset-0 opacity-[0.2] mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle at 25% 15%, transparent 35%, rgba(0,0,0,0.55) 100%)' }} />
            <p className="label absolute bottom-6 left-6" style={{ color: tone.ink }}>
              {project.materials.join(' · ')}
            </p>
          </div>
        </div>

        {/* 2 · Facts */}
        <section className="container-x mt-16" aria-label="Project details">
          <Rule />
          <dl className="grid gap-x-8 gap-y-8 py-10 sm:grid-cols-3 lg:grid-cols-6">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="label text-stone">{fact.label}</dt>
                <dd className="mt-3 text-paper">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <Rule />
        </section>

        {/* 3 · Concept */}
        <section className="container-x section-y grid gap-10 md:grid-cols-12" aria-labelledby="concept">
          <Reveal className="md:col-span-4">
            <h2 id="concept" className="display-md">
              Concept
            </h2>
          </Reveal>
          <Reveal delay={90} className="md:col-span-7 md:col-start-6">
            <p className="editorial text-[clamp(1.2rem,1rem+1vw,1.85rem)] leading-[1.35]">{project.concept}</p>
          </Reveal>
        </section>

        {/* 4 · Materials */}
        <section className="bg-ink-2 section-y" aria-labelledby="materials-used">
          <div className="container-x">
            <h2 id="materials-used" className="label text-bronze">
              Materials
            </h2>
            <ul className="mt-8 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
              {project.materials.map((material) => (
                <li key={material} className="bg-ink-2 px-6 py-10">
                  <p className="display-md text-[1.3rem]">{material}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 5 · Exterior and interior */}
        <section className="container-x section-y grid gap-14 md:grid-cols-2" aria-label="Exterior and interior">
          {[
            { title: 'Exterior', text: project.exterior },
            { title: 'Interior', text: project.interior },
          ].map((block, blockIndex) => (
            <Reveal key={block.title} delay={blockIndex * 100}>
              <h2 className="display-md">{block.title}</h2>
              <p className="mt-6 text-lg leading-relaxed text-stone">{block.text}</p>
            </Reveal>
          ))}
        </section>

        {/* 6 · Plan */}
        <section className="bg-ink-2 section-y" aria-labelledby="plan">
          <div className="container-x grid gap-12 md:grid-cols-12">
            <Reveal className="md:col-span-4">
              <h2 id="plan" className="display-md">
                Floor plan
              </h2>
              <p className="mt-6 text-stone">{project.plan}</p>
              <p className="label mt-8 text-stone/60">Ground floor · 1:200 · metres</p>
            </Reveal>
            <Reveal delay={120} className="md:col-span-8">
              <Plan />
            </Reveal>
          </div>
        </section>

        {/* 7 · The model */}
        <section className="container-x section-y" aria-labelledby="model">
          <div className="border border-line p-8 sm:p-14">
            <p className="label text-bronze">3D experience</p>
            <h2 id="model" className="display-lg mt-5 max-w-[16ch]">
              Walk this house and choose its materials.
            </h2>
            <p className="mt-6 max-w-[46ch] text-stone">
              Every residence we design is modelled before it is drawn. Open the model, move through the rooms, and change the finishes to see them in the light of the house itself.
            </p>
            <Link href="/#residence" className="label mt-10 inline-block border border-paper bg-paper px-8 py-4 text-ink transition-colors hover:border-bronze hover:bg-bronze">
              Open the residence
            </Link>
          </div>
        </section>

        {/* 8 · Next */}
        <Link href={`/projects/${next.slug}`} className="group block border-t border-line">
          <div className="container-x grid items-center gap-8 py-16 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="label text-stone">Next project</p>
              <p className="display-lg mt-4 transition-colors duration-500 group-hover:text-bronze">{next.name}</p>
              <p className="mt-3 text-stone">{next.location}</p>
            </div>
            <div className="relative aspect-[16/9] md:col-span-5" style={{ background: `linear-gradient(152deg, ${TONES[next.tone].from} 0%, ${TONES[next.tone].to} 100%)` }} />
          </div>
        </Link>

        {/* 9 · Contact */}
        <section className="container-x section-y text-center" aria-label="Start a project">
          <p className="label text-bronze">Start a project</p>
          <h2 className="display-lg mx-auto mt-6 max-w-[16ch]">Send us the plot number.</h2>
          <a href={`mailto:${studio.email}`} className="label mt-10 inline-block border border-line px-8 py-4 text-paper transition-colors hover:border-bronze hover:text-bronze">
            {studio.email}
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
