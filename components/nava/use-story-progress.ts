'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { CHAPTERS } from '@/lib/nava/timeline';
export function useStoryProgress(container: RefObject<HTMLElement | null>) {
  const progress = useRef(0);
  const [chapter, setChapter] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const el = container.current;
      if (!el) return;
      const range = el.offsetHeight - window.innerHeight;
      const p = Math.max(0, Math.min(1, -el.getBoundingClientRect().top / Math.max(1, range)));
      progress.current = p;
      el.style.setProperty('--progress', `${p}`);
      setChapter(p < .19 ? 0 : p < .39 ? 1 : p < .65 ? 2 : p < .83 ? 3 : 4);
      frame = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('pageshow', schedule);
    const observer = new ResizeObserver(schedule);
    if (container.current) observer.observe(container.current);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pageshow', schedule);
    };
  }, [container]);
  return { progress, chapter };
}
export function jumpToChapter(container: HTMLElement | null, index: number, reduced: boolean) {
  if (!container) return;
  const start = container.getBoundingClientRect().top + window.scrollY;
  const range = container.offsetHeight - window.innerHeight;
  window.scrollTo({ top: start + CHAPTERS[index].progress * range, behavior: reduced ? 'instant' : 'smooth' });
  window.history.replaceState(null, '', `#${CHAPTERS[index].id}`);
}
