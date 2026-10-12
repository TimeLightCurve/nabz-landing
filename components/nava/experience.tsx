'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useLocale } from './locale';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { CHAPTERS, STORY_END } from '@/lib/nava/timeline';
import { jumpToChapter, useStoryProgress } from './use-story-progress';
import SceneBoundary from './scene-boundary';
import HardwareAnnotations from './hardware-annotations';
import ProductDetails from './product-details';
import { Camera, Vector3 } from 'three';
const Scene = dynamic(() => import('./scene'), { ssr: false });
export default function Experience({ children }: { children: ReactNode }) {
  const { locale, toggle, t, number } = useLocale();
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
  return <main ref={container} className="nava-story" data-chapter={chapter} data-ready={ready} data-menu={menu} dir={locale === "fa" ? "rtl" : "ltr"}>
    <div className="chapter-anchors" aria-hidden="true">{CHAPTERS.map(item => <span id={item.id} key={item.id} style={{ top: `${item.progress / STORY_END * 100}%` }} />)}</div>
    <div className="experience-stage">
      <div className="ambient-backdrop" /><div className="grain" />
      <div className="scene-layer">
        <SceneBoundary onError={onError} onRetry={() => { setReady(false); setFailed(false); setAttempt(n => n + 1); }}>
          {webgl ? <Scene key={attempt} progress={progress} reducedMotion={reduced} onReady={onReady} attempt={attempt} anchors={anchors} cameraRef={cameraRef} /> : <div className="webgl-fallback"><Image src="/nabz-mark.svg" alt="NABZ" width={100} height={88} /><p>{t('A little closer to every thought.')}</p></div>}
        </SceneBoundary>
      </div>
      {webgl && !failed && <HardwareAnnotations progress={progress} anchors={anchors} cameraRef={cameraRef} reducedMotion={reduced} />}
      <header className="site-header">
        <a href="#within-reach" className="wordmark" aria-label={t('NAVA — back to the beginning')} onClick={e => { e.preventDefault(); navigate(0); }}><Image src="/nabz-mark.svg" alt="NABZ" width={54} height={48} priority style={{ width: 54, height: 48, objectFit: 'contain' }} /></a>
        <span className="header-caption">{t('A LITTLE CLOSER TO YOUR MIND')}</span>
        <div className="header-actions"><button className="language-toggle" onClick={toggle} aria-label={locale === 'en' ? 'Switch to Persian' : 'Switch to English'} dir="ltr"><span data-active={locale === 'en'}>EN</span><span aria-hidden="true">/</span><span data-active={locale === 'fa'}>FA</span></button>
        <button ref={menuButton} className="menu-toggle" aria-expanded={menu} aria-controls="chapter-menu" onClick={() => setMenu(!menu)}><span>{t(menu ? 'CLOSE' : 'MENU')}</span><span className={`menu-icon ${menu ? 'is-open' : ''}`}><i /><i /><i /><i /></span></button>
        </div>
      </header>
      <button className="menu-dismiss" aria-label={t('Close navigation')} tabIndex={-1} aria-hidden={!menu} onClick={() => { setMenu(false); menuButton.current?.focus(); }} />
      <nav id="chapter-menu" className="chapter-menu" data-open={menu} inert={!menu} aria-hidden={!menu} data-lenis-prevent aria-label={t('Explore NAVA')} style={{ backdropFilter: 'blur(22px)' }}>
        <div className="menu-links">{CHAPTERS.map((item, i) => <a ref={i === 0 ? firstLink : undefined} key={item.id} href={`#${item.id}`} style={{ '--item-index': i, '--exit-index': CHAPTERS.length - 1 - i } as CSSProperties} aria-current={i === chapter ? 'step' : undefined} onClick={e => { e.preventDefault(); navigate(i); }}><i aria-hidden="true" />{t(['Home', 'Connection', 'Craft', 'Necklace', 'Everyday', 'Memory', 'Voice', 'Privacy', 'Explore NAVA'][i])}</a>)}</div>
        <a className="menu-app-link" href="https://nabzlab.com/app/nava">{t('Open NAVA')}<span aria-hidden="true">&#8599;</span></a>
      </nav>
      <div className="copy-stack">{children}</div>
      <ProductDetails chapter={chapter} />
      <aside className="side-index" aria-label={t('Chapter navigation')}>{CHAPTERS.map((item, i) => <button key={item.id} aria-label={t(item.label)} aria-current={i === chapter ? 'step' : undefined} onClick={() => navigate(i)}><span>{number(i + 1)}</span><i /></button>)}</aside>
      <footer className="experience-footer">
        <div className="chapter-counter"><span>{number(chapter + 1)}</span><i /><span>{number(CHAPTERS.length)}</span></div>
        <button className="scroll-prompt" onClick={() => navigate(chapter === CHAPTERS.length - 1 ? 0 : chapter + 1)}><span className={chapter === CHAPTERS.length - 1 ? 'replay-symbol' : 'scroll-symbol'}>{chapter === CHAPTERS.length - 1 ? '↺' : '↓'}</span><span>{t(chapter === CHAPTERS.length - 1 ? 'EXPERIENCE AGAIN' : 'SCROLL TO DISCOVER')}</span></button>
        <div className="footer-caption"><span className="status-dot" /> {t("AI NOTE-TAKING. REIMAGINED.")}</div>
      </footer>
      {!ready && !failed && webgl && <div className="loading-indicator" role="status">{t('PREPARING YOUR EXPERIENCE')}<span>···</span></div>}
      <div className="progress-line" />
    </div>
  </main>;
}
