'use client';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type RefObject } from 'react';
import { AdditiveBlending, ShaderMaterial } from 'three';
import { smooth, storyProgress } from '@/lib/nava/timeline';

const vertex = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment = `
varying vec2 vUv;uniform float uTravel;uniform float uOpacity;
void main(){
 float radius=length((vUv-.5)*40.);
 float phase=mod(radius-uTravel,2.3);
 float d=min(phase,2.3-phase);
 float ridge=exp(-d*d*95.)*.42+exp(-d*d*7.)*.24;
 float edge=(1.-smoothstep(12.,19.,radius))*smoothstep(.6,1.8,radius);
 gl_FragColor=vec4(vec3(.18,.48,.8),ridge*edge*uOpacity);
}`;

export default function GroundWaves({ progress, reducedMotion }: { progress: RefObject<number>; reducedMotion: boolean }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTravel: { value: 0 }, uOpacity: { value: 1 } }), []);
  useFrame(({ clock }) => {
    if (!material.current) return;
    const p = storyProgress(progress.current, reducedMotion);
    material.current.uniforms.uTravel.value = p * 4 + (reducedMotion ? 0 : clock.elapsedTime * .12);
    material.current.uniforms.uOpacity.value = 1 - smooth(.23, .42, p);
  });
  return <mesh position={[.65, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-50}>
    <planeGeometry args={[40, 40]} />
    <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} transparent depthWrite={false} blending={AdditiveBlending} />
  </mesh>;
}
