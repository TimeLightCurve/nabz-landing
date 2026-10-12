'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { CHAPTERS, STORY_END } from '@/lib/nava/timeline';
import { jumpToChapter, useStoryProgress } from './use-story-progress';
import SceneBoundary from './scene-boundary';
import HardwareAnnotations from './hardware-annotations';
import ProductDetails from './product-details';
import { Camera, Vector3 } from 'three';
const Scene = dynamic(() => import('./scene'), { ssr: false });
export default function Experience({ children }: { children: ReactNode }) {
  const container = useRef<HTMLElement>(null);
  const cameraRef = useRef<Camera | null>(null);
  const anchors = useRef({ microphone: new Vector3(), magnet: new Vector3(), center: new Vector3(), ready: false });
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const { progress, chapter, lenis } = useStoryProgress(container);
  const [menu, setMenu] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [webgl, setWebgl] = useState(true);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update(); query.addEventListener('change', update);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2');
    setWebgl(!!context);
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    // Native anchor navigation and browser history restore the scroll position.
    // Replaying the hash here would overwrite a later manually scrolled position.
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!menu) return;
    firstLink.current?.focus();
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenu(false); menuButton.current?.focus(); }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menu]);
  function navigate(index: number) {
    jumpToChapter(container.current, index, reduced, lenis.current); setMenu(false); menuButton.current?.focus({ preventScroll: true });
  }
  return <main ref={container} className="nava-story" data-chapter={chapter} data-ready={ready}>
    <div className="chapter-anchors" aria-hidden="true">{CHAPTERS.map(item => <span id={item.id} key={item.id} style={{ top: `${item.progress / STORY_END * 100}%` }} />)}</div>
    <div className="experience-stage">
      <div className="ambient-backdrop" /><div className="grain" />
      <div className="scene-layer">
        <SceneBoundary onError={onError} onRetry={() => { setReady(false); setFailed(false); setAttempt(n => n + 1); }}>
          {webgl ? <Scene key={attempt} progress={progress} reducedMotion={reduced} onReady={onReady} attempt={attempt} anchors={anchors} cameraRef={cameraRef} /> : <div className="webgl-fallback"><span>N</span><p>A little closer to every thought.</p></div>}
        </SceneBoundary>
      </div>
      {webgl && !failed && <HardwareAnnotations progress={progress} anchors={anchors} cameraRef={cameraRef} reducedMotion={reduced} />}
      <header className="site-header">
        <a href="#within-reach" className="wordmark" aria-label="NAVA — back to the beginning" onClick={e => { e.preventDefault(); navigate(0); }}>nava<span className="brand-dot" /></a>
        <span className="header-caption">A LITTLE CLOSER TO YOUR MIND</span>
        <button ref={menuButton} className="menu-toggle" aria-expanded={menu} aria-controls="chapter-menu" onClick={() => setMenu(!menu)}><span>{menu ? 'CLOSE' : 'EXPLORE'}</span><span className={`menu-icon ${menu ? 'is-open' : ''}`}><i /><i /><i /><i /></span></button>
      </header>
      {menu && <nav id="chapter-menu" className="chapter-menu" data-lenis-prevent aria-label="Explore NAVA">{CHAPTERS.map((item, i) => <a ref={i === 0 ? firstLink : undefined} key={item.id} href={`#${item.id}`} aria-current={i === chapter ? 'step' : undefined} onClick={e => { e.preventDefault(); navigate(i); }}><span>0{i + 1}</span>{item.label}<span>↗</span></a>)}</nav>}
      <div className="copy-stack">{children}</div>
      <ProductDetails chapter={chapter} />
      <aside className="side-index" aria-label="Chapter navigation">{CHAPTERS.map((item, i) => <button key={item.id} aria-label={item.label} aria-current={i === chapter ? 'step' : undefined} onClick={() => navigate(i)}><span>0{i + 1}</span><i /></button>)}</aside>
      <footer className="experience-footer">
        <div className="chapter-counter"><span>0{chapter + 1}</span><i /><span>{String(CHAPTERS.length).padStart(2, '0')}</span></div>
        <button className="scroll-prompt" onClick={() => navigate(chapter === CHAPTERS.length - 1 ? 0 : chapter + 1)}><span className={chapter === CHAPTERS.length - 1 ? 'replay-symbol' : 'scroll-symbol'}>{chapter === CHAPTERS.length - 1 ? '↺' : '↓'}</span><span>{chapter === CHAPTERS.length - 1 ? 'EXPERIENCE AGAIN' : 'SCROLL TO DISCOVER'}</span></button>
        <div className="footer-caption"><span className="status-dot" /> AI NOTE-TAKING. REIMAGINED.</div>
      </footer>
      {!ready && !failed && webgl && <div className="loading-indicator" role="status">PREPARING YOUR EXPERIENCE <span>···</span></div>}
      <div className="progress-line" />
    </div>
  </main>;
}
