'use client';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useState, type RefObject } from 'react';
import type { Camera } from 'three';
import Product from './product';
import Atmosphere from './atmosphere';
import CameraRig from './camera-rig';
import type { HardwareAnchors } from './hardware-annotations';
import GroundWaves from './ground-waves';
function Visibility() {
  const { setFrameloop, invalidate } = useThree();
  useEffect(() => {
    const update = () => { setFrameloop(document.hidden ? 'never' : 'always'); if (!document.hidden) invalidate(); };
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, [setFrameloop, invalidate]);
  return null;
}
export default function Scene({ progress, reducedMotion, onReady, attempt, anchors, cameraRef }: { progress: RefObject<number>; reducedMotion: boolean; onReady: () => void; attempt: number; anchors: RefObject<HardwareAnchors>; cameraRef: RefObject<Camera | null> }) {
  const [mobile, setMobile] = useState(false);
  const [cacheReady, setCacheReady] = useState(attempt === 0);
  useEffect(() => {
    if (attempt > 0) { useGLTF.clear('/wristband-refined.glb?v=nabz1'); useGLTF.clear('/nava-modular-refined.glb?v=nabz1'); setCacheReady(true); }
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [attempt]);
  if (!cacheReady) return null;
  return <Canvas aria-label="NAVA device transforming from wristband to necklace" dpr={[1, mobile ? 1.25 : 1.75]} camera={{ position: [0, 0, 10], fov: mobile ? 48 : 36, near: .1, far: 120 }} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}>
    <Visibility />
    <CameraRig progress={progress} reducedMotion={reducedMotion} mobile={mobile} anchors={anchors} cameraRef={cameraRef} />
    <ambientLight intensity={.65} color="#9fc9e5" />
    <directionalLight position={[2, 5, 5]} intensity={4} color="#d0eaff" />
    <directionalLight position={[-4, 0, 2]} intensity={5} color="#4cafff" />
    <pointLight position={[1, -3, 3]} intensity={18} color="#4f90b5" />
    <Environment resolution={128}>
      <Lightformer position={[-4, 3, 3]} scale={[3, 8, 1]} intensity={5} color="#b6e1ff" target={[0, 0, 0]} />
      <Lightformer position={[4, 1, 1]} scale={[2, 6, 1]} intensity={5} color="#4ea2de" target={[0, 0, 0]} />
      <Lightformer position={[0, 5, -2]} rotation={[Math.PI / 2, 0, 0]} scale={[6, 2, 1]} intensity={7} color="#e9f6ff" />
      <Lightformer position={[0, -4, 2]} scale={[4, 1, 1]} intensity={2} color="#85d9ec" target={[0, 0, 0]} />
    </Environment>
    <Atmosphere reducedMotion={reducedMotion} mobile={mobile} anchors={anchors} />
    <GroundWaves progress={progress} reducedMotion={reducedMotion} />
    <Suspense fallback={null}><Product progress={progress} reducedMotion={reducedMotion} mobile={mobile} onReady={onReady} anchors={anchors} /></Suspense>
  </Canvas>;
}
