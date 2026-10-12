'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { CHAPTERS, STORY_END, chapterAt } from '@/lib/nava/timeline';
import Lenis from 'lenis';
export function useStoryProgress(container: RefObject<HTMLElement | null>) {
  const progress = useRef(0);
  const lenis = useRef<Lenis | null>(null);
  const [chapter, setChapter] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const el = container.current;
      if (!el) return;
      const range = el.offsetHeight - window.innerHeight;
      const p = Math.max(0, Math.min(1, -el.getBoundingClientRect().top / Math.max(1, range)));
      progress.current = p * STORY_END;
      el.style.setProperty('--progress', `${p}`);
      setChapter(chapterAt(p * STORY_END));
      frame = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const configureScroll = () => {
      lenis.current?.destroy();
      lenis.current = null;
      if (!motion.matches) {
        lenis.current = new Lenis({ autoRaf: true, lerp: .075, smoothWheel: true, syncTouch: false });
        lenis.current.on('scroll', schedule);
      }
      schedule();
    };
    configureScroll();
    motion.addEventListener('change', configureScroll);
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('pageshow', schedule);
    const observer = new ResizeObserver(schedule);
    if (container.current) observer.observe(container.current);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      motion.removeEventListener('change', configureScroll);
      lenis.current?.destroy();
      lenis.current = null;
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pageshow', schedule);
    };
  }, [container]);
  return { progress, chapter, lenis };
}
export function jumpToChapter(container: HTMLElement | null, index: number, reduced: boolean, lenis?: Lenis | null) {
  if (!container) return;
  const start = container.getBoundingClientRect().top + window.scrollY;
  const range = container.offsetHeight - window.innerHeight;
  const top = start + CHAPTERS[index].progress / STORY_END * range;
  if (lenis) lenis.scrollTo(top, { immediate: reduced });
  else window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' });
  window.history.replaceState(null, '', `#${CHAPTERS[index].id}`);
}
