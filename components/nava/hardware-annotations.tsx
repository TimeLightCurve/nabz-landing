'use client';

import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import { Vector3 } from 'three';
import { sampleAnnotations, storyProgress } from '@/lib/nava/timeline';

export type HardwareAnchors = { microphone: Vector3; magnet: Vector3; center: Vector3; ready: boolean };

export default function HardwareAnnotations({ progress, anchors, reducedMotion, mobile }: {
  progress: RefObject<number>; anchors: RefObject<HardwareAnchors>; reducedMotion: boolean; mobile: boolean;
}) {
  const { size } = useThree();
  const root = useRef<SVGSVGElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const tip = useRef<SVGCircleElement>(null);
  const leaders = useRef<SVGGElement>(null);
  const topPath = useRef<SVGPathElement>(null);
  const bottomPath = useRef<SVGPathElement>(null);
  const topDot = useRef<SVGCircleElement>(null);
  const bottomDot = useRef<SVGCircleElement>(null);
  const projected = useRef([new Vector3(), new Vector3(), new Vector3()]);
  const w = size.width; const h = size.height;
  const endX = w * (mobile ? .9 : w < 1100 ? .72 : .785);
  const topY = h * (mobile ? .37 : .245);
  const bottomY = h * (mobile ? .76 : .745);
  const textX = mobile ? endX : endX + 24;
  const textAnchor = mobile ? 'end' : 'start';

  useFrame(({ camera }) => {
    if (!root.current || !anchors.current.ready) return;
    const p = storyProgress(progress.current, reducedMotion);
    const state = sampleAnnotations(p);
    root.current.style.opacity = `${state.opacity}`;
    root.current.style.visibility = state.opacity < .01 ? 'hidden' : 'visible';
    root.current.setAttribute('aria-hidden', state.opacity < .01 ? 'true' : 'false');
    if (state.opacity < .01) return;
    const [mic, magnet, center] = projected.current;
    mic.copy(anchors.current.microphone).project(camera);
    magnet.copy(anchors.current.magnet).project(camera);
    center.copy(anchors.current.center).project(camera);
    for (const point of projected.current) { point.x = (point.x + 1) * w / 2; point.y = (1 - point.y) * h / 2; }
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
    if (leaders.current) leaders.current.style.opacity = `${state.labels}`;
    const leader = (point: Vector3, y: number) => {
      const run = mobile ? w * .16 : w * .13;
      return `M ${point.x} ${point.y} C ${point.x + run * .55} ${point.y}, ${endX - run * 1.35} ${y}, ${endX - run} ${y} L ${endX} ${y}`;
    };
    topPath.current?.setAttribute('d', leader(mic, topY));
    bottomPath.current?.setAttribute('d', leader(magnet, bottomY));
    topDot.current?.setAttribute('cx', `${mic.x}`); topDot.current?.setAttribute('cy', `${mic.y}`);
    bottomDot.current?.setAttribute('cx', `${magnet.x}`); bottomDot.current?.setAttribute('cy', `${magnet.y}`);
  });

  return <Html fullscreen calculatePosition={(_, __, viewport) => [viewport.width / 2, viewport.height / 2]} zIndexRange={[3, 3]} style={{ pointerEvents: 'none' }}>
    <svg ref={root} className="hardware-annotations" width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity: 0, visibility: 'hidden' }} role="img" aria-label="NAVA hardware: built-in microphone and magnetic attachment contacts">
      <circle ref={arc} pathLength={1} strokeDasharray="1" strokeDashoffset="1" fill="none" className="hardware-orbit" />
      <circle ref={tip} r={2.5} className="orbit-tip" />
      <g ref={leaders} className="hardware-leaders">
        <path ref={topPath} fill="none" /><path ref={bottomPath} fill="none" />
        <circle ref={topDot} r={2.7} /><circle ref={bottomDot} r={2.7} />
        <circle cx={endX} cy={topY} r={1.8} /><circle cx={endX} cy={bottomY} r={1.8} />
        <text x={textX} y={topY + (mobile ? -34 : -4)} textAnchor={textAnchor} className="hardware-label">BUILT-IN MICROPHONE</text>
        <text x={textX} y={topY + (mobile ? -15 : 20)} textAnchor={textAnchor} className="hardware-caption">Capture the thought.</text>
        <text x={textX} y={bottomY + (mobile ? 26 : -4)} textAnchor={textAnchor} className="hardware-label">MAGNETIC CONTACTS</text>
        <text x={textX} y={bottomY + (mobile ? 46 : 20)} textAnchor={textAnchor} className="hardware-caption">One device. Two ways to wear.</text>
      </g>
    </svg>
  </Html>;
}
