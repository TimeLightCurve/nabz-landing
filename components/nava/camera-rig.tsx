'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, type RefObject } from 'react';
import { MathUtils, Vector2 } from 'three';
import { sampleScrollCamera } from '@/lib/nava/motion';

export default function CameraRig({ progress, reducedMotion, mobile }: { progress: RefObject<number>; reducedMotion: boolean; mobile: boolean }) {
  const { camera } = useThree();
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
    const scroll = sampleScrollCamera(progress.current, reducedMotion, mobile);
    const targetX = reducedMotion ? 0 : pointer.current.x * .28;
    const targetY = reducedMotion ? 0 : pointer.current.y * .18;
    // Lenis smooths scroll already; only pointer parallax needs extra damping.
    pointerOffset.current.x = reducedMotion ? 0 : MathUtils.damp(pointerOffset.current.x, targetX, 3.5, Math.min(delta, .1));
    pointerOffset.current.y = reducedMotion ? 0 : MathUtils.damp(pointerOffset.current.y, targetY, 3.5, Math.min(delta, .1));
    camera.position.set(scroll.position[0] + pointerOffset.current.x, scroll.position[1] + pointerOffset.current.y, scroll.position[2]);
    camera.lookAt(...scroll.target);
    camera.updateMatrixWorld();
  }, -1);
  return null;
}
