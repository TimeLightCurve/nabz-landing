'use client';

import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import { Group, Vector3 } from 'three';
import { sampleAnnotations, storyProgress } from '@/lib/nava/timeline';

export type HardwareAnchors = { microphone: Vector3; magnet: Vector3; center: Vector3; ready: boolean };

export default function HardwareAnnotations({ progress, anchors, reducedMotion, mobile }: {
  progress: RefObject<number>; anchors: RefObject<HardwareAnchors>; reducedMotion: boolean; mobile: boolean;
}) {
  const { size } = useThree();
  const root = useRef<SVGSVGElement>(null);
  const overlayAnchor = useRef<Group>(null);
  const arc = useRef<SVGCircleElement>(null);
  const tip = useRef<SVGCircleElement>(null);
  const leaders = useRef<SVGGElement>(null);
  const topPath = useRef<SVGPathElement>(null);
  const bottomPath = useRef<SVGPathElement>(null);
  const topDot = useRef<SVGCircleElement>(null);
  const bottomDot = useRef<SVGCircleElement>(null);
  const attachment = useRef(new Vector3());
  const topLabel = useRef<SVGTextElement>(null);
  const topCaption = useRef<SVGTextElement>(null);
  const bottomLabel = useRef<SVGTextElement>(null);
  const bottomCaption = useRef<SVGTextElement>(null);
  const projected = useRef(new Vector3());
  const w = size.width; const h = size.height;
  const endX = w * (mobile ? .9 : w < 1100 ? .72 : .785);
  const topY = h * (mobile ? .37 : .245);
  const bottomY = h * (mobile ? .76 : .745);
  const textX = mobile ? endX : endX + 24;
  const textAnchor = mobile ? 'end' : 'start';
  // Keep the elbows and label runs authored; only the attachment segment follows the mesh.
  const startX = w * (mobile ? .48 : .62);
  const upperStartY = h * .43;
  const lowerStartY = h * .61;
  const bendX = endX - w * (mobile ? .1 : .12);
  const leader = (x: number, y: number, endY: number, upper: boolean) => `M ${x} ${y} L ${bendX - w * .035} ${endY + (upper ? 1 : -1) * h * .045} Q ${bendX} ${endY} ${bendX + w * .04} ${endY} L ${endX} ${endY}`;

  useFrame(({ camera }) => {
    if (!root.current || !anchors.current.ready) return;
    if (overlayAnchor.current) {
      overlayAnchor.current.position.copy(anchors.current.center);
      overlayAnchor.current.updateMatrixWorld(true);
    }
    const p = storyProgress(progress.current, reducedMotion);
    const state = sampleAnnotations(p);
    root.current.style.opacity = `${state.opacity}`;
    root.current.style.visibility = state.opacity < .01 ? 'hidden' : 'visible';
    root.current.setAttribute('aria-hidden', state.opacity < .01 ? 'true' : 'false');
    if (state.opacity < .01) return;
    const center = projected.current;
    center.copy(anchors.current.center).project(camera);
    center.x = (center.x + 1) * w / 2; center.y = (1 - center.y) * h / 2;
    const radius = Math.min(w * (mobile ? .39 : .23), h * .3);
    const cx = center.x; const cy = center.y;
    const draw = reducedMotion ? 1 : state.draw;
    arc.current?.setAttribute('cx', `${cx}`); arc.current?.setAttribute('cy', `${cy}`);
    arc.current?.setAttribute('r', `${radius}`);
    arc.current?.setAttribute('transform', `rotate(-115 ${cx} ${cy})`);
    arc.current?.setAttribute('stroke-dashoffset', `${1 - draw}`);
    const angle = (-115 + draw * 360) * Math.PI / 180;
    tip.current?.setAttribute('cx', `${cx + Math.cos(angle) * radius}`);
    tip.current?.setAttribute('cy', `${cy + Math.sin(angle) * radius}`);
    const necklace = p >= .79;
    root.current.setAttribute('aria-label', necklace ? 'NAVA magnetic necklace: one device, two ways to wear.' : 'NAVA hardware: built-in microphone and magnetic attachment contacts');
    const reveal = necklace ? state.necklaceLabels : state.labels;
    const trackAttachment = (point: Vector3, path: SVGPathElement | null, dot: SVGCircleElement | null, endY: number, upper: boolean) => {
      const v = attachment.current.copy(point).project(camera);
      const x = (v.x + 1) * w / 2; const y = (1 - v.y) * h / 2;
      path?.setAttribute('d', leader(x, y, endY, upper));
      dot?.setAttribute('cx', `${x}`); dot?.setAttribute('cy', `${y}`);
    };
    trackAttachment(anchors.current.microphone, topPath.current, topDot.current, topY, true);
    trackAttachment(anchors.current.magnet, bottomPath.current, bottomDot.current, bottomY, false);
    if (leaders.current) leaders.current.style.opacity = `${reveal}`;
    topPath.current?.setAttribute('stroke-dashoffset', `${1 - reveal}`);
    bottomPath.current?.setAttribute('stroke-dashoffset', `${1 - reveal}`);
    if (topLabel.current) topLabel.current.textContent = necklace ? 'MAGNETIC NECKLACE' : 'BUILT-IN MICROPHONE';
    if (topCaption.current) topCaption.current.textContent = necklace ? 'A connection that clicks.' : 'Capture the thought.';
    if (bottomLabel.current) bottomLabel.current.textContent = necklace ? 'ONE DEVICE. TWO WAYS.' : 'MAGNETIC CONTACTS';
    if (bottomCaption.current) bottomCaption.current.textContent = necklace ? 'From wrist to necklace.' : 'One device. Two ways to wear.';
  });

  // This is a screen-space overlay: visibility belongs to the story, not Html's 3D culling.
  return <group ref={overlayAnchor}><Html fullscreen onOcclude={() => undefined} eps={0} calculatePosition={(_, __, viewport) => [viewport.width / 2, viewport.height / 2]} zIndexRange={[3, 3]} style={{ pointerEvents: 'none' }}>
    <svg ref={root} className="hardware-annotations" width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity: 0, visibility: 'hidden' }} role="img" aria-label="NAVA hardware: built-in microphone and magnetic attachment contacts">
      <circle ref={arc} pathLength={1} strokeDasharray="1" strokeDashoffset="1" fill="none" className="hardware-orbit" />
      <circle ref={tip} r={2.5} className="orbit-tip" />
      <g ref={leaders} className="hardware-leaders">
        <path ref={topPath} d={leader(startX, upperStartY, topY, true)} pathLength={1} strokeDasharray="1" fill="none" /><path ref={bottomPath} d={leader(startX, lowerStartY, bottomY, false)} pathLength={1} strokeDasharray="1" fill="none" />
        <circle ref={topDot} cx={startX} cy={upperStartY} r={2.7} /><circle ref={bottomDot} cx={startX} cy={lowerStartY} r={2.7} />
        <circle cx={endX} cy={topY} r={1.8} /><circle cx={endX} cy={bottomY} r={1.8} />
        <text ref={topLabel} x={textX} y={topY + (mobile ? -34 : -4)} textAnchor={textAnchor} className="hardware-label">BUILT-IN MICROPHONE</text>
        <text ref={topCaption} x={textX} y={topY + (mobile ? -15 : 20)} textAnchor={textAnchor} className="hardware-caption">Capture the thought.</text>
        <text ref={bottomLabel} x={textX} y={bottomY + (mobile ? 26 : -4)} textAnchor={textAnchor} className="hardware-label">MAGNETIC CONTACTS</text>
        <text ref={bottomCaption} x={textX} y={bottomY + (mobile ? 46 : 20)} textAnchor={textAnchor} className="hardware-caption">One device. Two ways to wear.</text>
      </g>
    </svg>
  </Html></group>;
}
