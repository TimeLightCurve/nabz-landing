'use client';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type RefObject } from 'react';
import { AdditiveBlending, Group, Points, ShaderMaterial } from 'three';
const vertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment = `
varying vec2 vUv;
uniform float uTime; uniform float uProgress;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){
 vec2 p=(vUv-.5)*2.; float r=length(p);float a=atan(p.y,p.x);
 float drift=noise(p*3.+uTime*.035);
 float ring=exp(-pow((r-.44-drift*.012)*80.,2.))*.32;
 ring+=exp(-pow((r-.44)*20.,2.))*.16;
 ring+=exp(-pow((r-.67)*46.,2.))*.13;
 float halo=exp(-pow((r-.48)*5.,2.))*.075;
 float beams=pow(max(0.,sin(a*3.+drift*3.+uTime*.05)),8.)*.12*exp(-pow((r-.5)*3.,2.));
 float strength=1.-smoothstep(.1,.46,uProgress)*.82;
 vec3 color=vec3(.22,.61,1.)*(ring+halo+beams)*strength;
 float dust=noise(p*140.)*.018;
 gl_FragColor=vec4(color+vec3(.07,.17,.25)*dust,1.);
}`;
export default function Atmosphere({ progress, reducedMotion, mobile }: { progress: RefObject<number>; reducedMotion: boolean; mobile: boolean }) {
  const shader = useRef<ShaderMaterial>(null);
  const environment = useRef<Group>(null);
  const particles = useRef<Points>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uProgress: { value: 0 } }), []);
  const positions = useMemo(() => {
    const count = mobile ? 160 : 420; const data = new Float32Array(count * 3); let seed = 42;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < count; i++) { data[i * 3] = (random() - .5) * 20; data[i * 3 + 1] = (random() - .5) * 14; data[i * 3 + 2] = -2 - random() * 7; }
    return data;
  }, [mobile]);
  useFrame(({ clock, camera }) => {
    if (environment.current) { environment.current.position.copy(camera.position); environment.current.position.z -= 10; }
    if (shader.current) { shader.current.uniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime; shader.current.uniforms.uProgress.value = progress.current; }
    if (particles.current && !reducedMotion) particles.current.rotation.z = Math.sin(clock.elapsedTime * .025) * .08;
  });
  return <group ref={environment}>
    <mesh position={[.65, 0, -6]}><planeGeometry args={[25, 25]} /><shaderMaterial ref={shader} uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} blending={AdditiveBlending} depthWrite={false} transparent /></mesh>
    <points ref={particles}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial size={.014} color="#8ac5ee" transparent opacity={.48} depthWrite={false} sizeAttenuation blending={AdditiveBlending} /></points>
  </group>;
}
