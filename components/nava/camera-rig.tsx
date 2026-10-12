'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, type RefObject } from 'react';
import { Camera, MathUtils, Vector2 } from 'three';
import { sampleScrollCamera } from '@/lib/nava/motion';
import type { HardwareAnchors } from './hardware-annotations';

export default function CameraRig({ progress, reducedMotion, mobile, anchors, cameraRef }: { progress: RefObject<number>; reducedMotion: boolean; mobile: boolean; anchors: RefObject<HardwareAnchors>; cameraRef: RefObject<Camera | null> }) {
  const { camera, size } = useThree();
  const pointer = useRef(new Vector2());
  const pointerOffset = useRef(new Vector2());
  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reset = () => pointer.current.set(0, 0);
    const move = (event: PointerEvent) => {
      if (reducedMotion || !finePointer.matches || event.pointerType === 'touch') return;
      pointer.current.set(
        MathUtils.clamp(event.clientX / window.innerWidth * 2 - 1, -1, 1),
        MathUtils.clamp(1 - event.clientY / window.innerHeight * 2, -1, 1),
      );
    };
    // Listen outside the canvas so DOM headings/navigation don't interrupt the rig.
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    finePointer.addEventListener('change', reset);
    reset();
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
      finePointer.removeEventListener('change', reset);
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);
    };
  }, [camera, reducedMotion]);
  useFrame((_, delta) => {
    const scroll = sampleScrollCamera(progress.current, reducedMotion, mobile, size.width / size.height);
    const targetX = reducedMotion ? 0 : pointer.current.x * .28;
    const targetY = reducedMotion ? 0 : pointer.current.y * .18;
    // Lenis smooths scroll already; only pointer parallax needs extra damping.
    pointerOffset.current.x = reducedMotion ? 0 : MathUtils.damp(pointerOffset.current.x, targetX, 3.5, Math.min(delta, .1));
    pointerOffset.current.y = reducedMotion ? 0 : MathUtils.damp(pointerOffset.current.y, targetY, 3.5, Math.min(delta, .1));
    // Product runs first: follow the actual floating mesh center, not an approximate path.
    const target = anchors.current.ready ? anchors.current.center : null;
    const x = target?.x ?? scroll.target[0]; const y = target?.y ?? scroll.target[1]; const z = target?.z ?? scroll.target[2];
    camera.position.set(scroll.position[0] + x - scroll.target[0] + pointerOffset.current.x, scroll.position[1] + y - scroll.target[1] + pointerOffset.current.y, scroll.position[2] + z - scroll.target[2]);
    camera.lookAt(x, y, z);
    camera.updateMatrixWorld();
    // Publish the live camera to the DOM overlay after applying this frame.
    cameraRef.current = camera;
  }, -1);
  return null;
}
