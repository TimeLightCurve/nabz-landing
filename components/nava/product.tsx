'use client';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Euler, Group, Matrix4, Mesh, MeshStandardMaterial, PointLight, Quaternion, Vector3 } from 'three';
import { resolveAssembly, solveDockPose } from '@/lib/nava/assembly';
import { sampleStory, smooth, presentation } from '@/lib/nava/timeline';
export default function Product({ progress, reducedMotion, mobile, onReady }: { progress: RefObject<number>; reducedMotion: boolean; mobile: boolean; onReady: () => void }) {
  const wrist = useGLTF('/wristband.glb');
  const modular = useGLTF('/nava-modular.glb');
  const assembly = useMemo(() => resolveAssembly(wrist.scene, modular.scene), [wrist.scene, modular.scene]);
  const stage = useRef<Group>(null);
  const magneticLight = useRef<PointLight>(null);
  const current = useRef(progress.current);
  const math = useMemo(() => ({ matrix: new Matrix4(), q: new Quaternion(), e: new Euler(), pos: new Vector3(), marker: new Vector3(), scale: new Vector3(1, 1, 1) }), []);
  const mats = useMemo(() => {
    const collect = (root: Group) => { const result: MeshStandardMaterial[] = []; root.traverse(n => { if (n instanceof Mesh) result.push(n.material as MeshStandardMaterial); }); return result; };
    const wrist = collect(assembly.wrist); const necklace = collect(assembly.necklace);
    // Keep the transparent shader variant stable while opacity animates.
    [...wrist, ...necklace].forEach(material => { material.transparent = true; });
    return { wrist, necklace, device: collect(assembly.device) };
  }, [assembly]);
  useEffect(() => { onReady(); }, [onReady]);
  useEffect(() => () => { Object.values(mats).flat().forEach(material => material.dispose()); }, [mats]);
  useFrame(({ clock, pointer }, delta) => {
    const raw = progress.current;
    current.current += (raw - current.current) * (1 - Math.exp(-delta * 8));
    let p = current.current;
    if (reducedMotion) p = raw < .19 ? 0 : raw < .39 ? .36 : raw < .65 ? .53 : raw < .83 ? .8 : 1;
    const pose = sampleStory(p);
    const framing = presentation(p, mobile);
    const root = stage.current;
    if (!root) return;
    const idle = reducedMotion ? 0 : (1 - smooth(.1, .25, p) + smooth(.85, 1, p)) * .018;
    root.rotation.set(pose.rotation[0] + Math.sin(clock.elapsedTime * .55) * idle, pose.rotation[1] + pointer.x * idle, pose.rotation[2] + Math.sin(clock.elapsedTime * .4) * idle);
    root.position.set(...framing.position);
    root.scale.setScalar(framing.scale);
    assembly.wrist.position.x = pose.wristX;
    assembly.necklace.position.x = pose.necklaceX;
    assembly.wrist.visible = pose.wristOpacity > .005;
    assembly.necklace.visible = pose.necklaceOpacity > .005;
    const marker = math.marker.copy(assembly.wristDock).lerp(assembly.necklaceDock, smooth(.38, .65, p));
    math.pos.set(pose.device.position[0], marker.y + pose.device.position[1] - .165, pose.device.position[2]);
    math.q.setFromEuler(math.e.set(...pose.device.rotation));
    math.matrix.compose(math.pos, math.q, math.scale);
    solveDockPose(math.matrix, assembly.contactLocal).decompose(assembly.device.position, assembly.device.quaternion, math.pos);
    if (magneticLight.current) magneticLight.current.intensity = pose.glow * 5;
    for (const [key, opacity] of [['wrist', pose.wristOpacity], ['necklace', pose.necklaceOpacity]] as const) {
      for (const material of mats[key]) { material.opacity = opacity; material.depthWrite = opacity > .98; }
    }
  });
  return <group ref={stage} dispose={null}><primitive object={assembly.wrist} /><primitive object={assembly.necklace} /><primitive object={assembly.device} /><pointLight ref={magneticLight} position={[0, .85, 0]} intensity={0} distance={3} color="#72d2ff" /></group>;
}
