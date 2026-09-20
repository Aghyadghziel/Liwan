'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { Nav } from '@/components/layout/Nav';
import { Configurator } from '@/components/sections/Configurator';
import { Contact, Experience, Footer, Materials, Projects, Services, Statement, StudioStory } from '@/components/sections/Editorial';
import { Hero } from '@/components/sections/Hero';
import { useQuality } from '@/lib/device';

const Scene = dynamic(() => import('@/components/three/Scene').then((module) => module.Scene), { ssr: false });

/**
 * One canvas, fixed behind the page for its whole length. The film and the configurator are
 * transparent so the house shows through; every reading section carries a solid ground, which
 * is what covers it again. There is only ever one WebGL context.
 */
export default function Page() {
  const quality = useQuality();

  // Smooth scrolling, but only where it is wanted: it makes the camera path glide.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let lenis: { raf: (time: number) => void; destroy: () => void } | undefined;
    let frame = 0;
    let cancelled = false;
    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    });
    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-0" aria-hidden="true">
        {quality !== 'pending' && <Scene quality={quality} className="!absolute inset-0" />}
      </div>

      <Nav />

      <main className="relative z-10">
        <Hero />
        <Statement />
        <Configurator />
        <Experience />
        <Projects />
        <Materials />
        <Services />
        <StudioStory />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
