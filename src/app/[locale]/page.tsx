'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { Nav } from '@/components/layout/Nav';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { Configurator } from '@/components/sections/Configurator';
import { Contact, Experience, Footer, Materials, Projects, Services, Statement, StudioStory } from '@/components/sections/Editorial';
import { Hero } from '@/components/sections/Hero';
import { useQuality } from '@/lib/device';
import { pinShot, setSceneVisible, SHOTS, type ShotName } from '@/lib/villa/camera';

const Scene = dynamic(() => import('@/components/three/Scene').then((module) => module.Scene), { ssr: false });

/**
 * One canvas, fixed behind the page for its whole length. The film and the configurator are
 * transparent so the house shows through; every reading section carries a solid ground, which
 * is what covers it again. There is only ever one WebGL context.
 */
export default function Page() {
  const quality = useQuality();

  // Render bench: /ar?shot=living&clean=1 holds the camera on a named shot and hides the page,
  // which is how the stills of the model on the project page are taken.
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const shot = query.get('shot');
    if (shot && shot in SHOTS) pinShot(shot as ShotName);
    if (query.get('clean')) document.documentElement.classList.add('bench');
  }, []);

  // The canvas only shows through the film and the configurator. Everywhere else it is
  // covered, so the render loop is told to stop — scrolling the reading sections costs nothing.
  useEffect(() => {
    // The render bench hides the page, so there is nothing to watch: keep drawing.
    if (new URLSearchParams(window.location.search).has('shot')) return;
    const windows = ['top', 'residence'].map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    const seen = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) seen.add(entry.target);
          else seen.delete(entry.target);
        }
        setSceneVisible(seen.size > 0);
      },
      { rootMargin: '15% 0px' },
    );
    for (const el of windows) observer.observe(el);
    return () => {
      observer.disconnect();
      setSceneVisible(true);
    };
  }, []);

  return (
    <>
      <SmoothScroll />
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
