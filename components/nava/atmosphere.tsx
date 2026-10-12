'use client';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type RefObject } from 'react';
import { BackSide, Group, Points, ShaderMaterial } from 'three';
import type { HardwareAnchors } from './hardware-annotations';

const vertex = `varying vec3 vDirection; void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment = `
varying vec3 vDirection;
uniform float uTime;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){
 vec3 d=normalize(vDirection);
 vec3 p=d*4.+vec3(uTime*.008,0.,0.);
 float cloud=noise(p)*.55+noise(p*2.1)*.28+noise(p*4.3)*.12;
 float mist=smoothstep(.26,.8,cloud);
 float glow=pow(max(0.,dot(d,normalize(vec3(-.4,.7,.6)))),6.);
 vec3 color=mix(vec3(.008,.018,.028),vec3(.035,.09,.14),mist)+vec3(.025,.055,.085)*glow;
 gl_FragColor=vec4(color,1.);
}`;
const dustVertex = `
attribute float aSize; varying float vDepth;
void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vDepth=-mv.z;gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*180./max(1.,-mv.z),3.,46.);}`;
const dustFragment = `
varying float vDepth;
void main(){float r=length(gl_PointCoord-.5)*2.;float soft=exp(-r*r*4.)*(1.-smoothstep(.55,1.,r));float fade=smoothstep(.8,2.,vDepth)*(1.-smoothstep(15.,25.,vDepth));gl_FragColor=vec4(.4,.66,.84,soft*.2*fade);}`;

export default function Atmosphere({ reducedMotion, mobile, anchors }: { reducedMotion: boolean; mobile: boolean; anchors: RefObject<HardwareAnchors> }) {
  const shader = useRef<ShaderMaterial>(null);
  const environment = useRef<Group>(null);
  const particles = useRef<Points>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const data = useMemo(() => {
    const count = mobile ? 65 : 120; const positions = new Float32Array(count * 3); const sizes = new Float32Array(count); let seed = 42;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < count; i++) {
      const azimuth = random() * Math.PI * 2; const y = random() * 2 - 1; const radius = 1.8 + random() * 3.4;
      const ring = Math.sqrt(1 - y * y) * radius;
      positions.set([Math.cos(azimuth) * ring, y * radius, Math.sin(azimuth) * ring], i * 3);
      sizes[i] = .3 + random() * 1.1;
    }
    return { positions, sizes };
  }, [mobile]);
  useFrame(({ clock }) => {
    if (environment.current && anchors.current.ready) environment.current.position.copy(anchors.current.center);
    if (shader.current) shader.current.uniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime;
    if (particles.current) {
      particles.current.rotation.y = reducedMotion ? 0 : clock.elapsedTime * .018;
      particles.current.rotation.z = reducedMotion ? 0 : Math.sin(clock.elapsedTime * .09) * .08;
    }
  });
  return <group ref={environment}>
    <mesh renderOrder={-100} frustumCulled={false}><sphereGeometry args={[45, 48, 32]} /><shaderMaterial ref={shader} uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} side={BackSide} depthWrite={false} /></mesh>
    <points ref={particles} frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions, 3]} /><bufferAttribute attach="attributes-aSize" args={[data.sizes, 1]} /></bufferGeometry><shaderMaterial vertexShader={dustVertex} fragmentShader={dustFragment} transparent depthWrite={false} /></points>
  </group>;
}
