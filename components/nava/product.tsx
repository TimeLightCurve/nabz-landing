'use client';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Euler, Group, Matrix4, Mesh, MeshStandardMaterial, PointLight, Quaternion, Vector3 } from 'three';
import { resolveAssembly, solveDockPose } from '@/lib/nava/assembly';
import { sampleStory, smooth, presentation, storyProgress } from '@/lib/nava/timeline';
import { sampleFloat } from '@/lib/nava/motion';
import type { HardwareAnchors } from './hardware-annotations';
export default function Product({ progress, reducedMotion, mobile, onReady, anchors }: { progress: RefObject<number>; reducedMotion: boolean; mobile: boolean; onReady: () => void; anchors: RefObject<HardwareAnchors> }) {
  const wrist = useGLTF('/wristband.glb');
  const modular = useGLTF('/nava-modular.glb');
  const assembly = useMemo(() => resolveAssembly(wrist.scene, modular.scene), [wrist.scene, modular.scene]);
  const stage = useRef<Group>(null);
  const magneticLight = useRef<PointLight>(null);
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
  useFrame(({ clock }) => {
    const raw = progress.current;
    // Lenis already smooths native scroll. Keep product and chapter timing in sync.
    const p = storyProgress(raw, reducedMotion);
    const pose = sampleStory(p);
    const framing = presentation(p, mobile);
    const root = stage.current;
    if (!root) return;
    const floating = sampleFloat(clock.elapsedTime, reducedMotion);
    // Move the shared presentation group so magnetic contact stays exact.
    root.rotation.set(pose.rotation[0] + floating.rotation[0], pose.rotation[1] + floating.rotation[1], pose.rotation[2] + floating.rotation[2]);
    root.position.set(framing.position[0] + floating.position[0], framing.position[1] + floating.position[1], framing.position[2] + floating.position[2]);
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
    if (magneticLight.current) {
      magneticLight.current.position.set(pose.device.position[0], .85, 0);
      magneticLight.current.intensity = pose.glow * 5;
    }
    for (const [key, opacity] of [['wrist', pose.wristOpacity], ['necklace', pose.necklaceOpacity]] as const) {
      for (const material of mats[key]) { material.opacity = opacity; material.depthWrite = opacity > .98; }
    }
    root.updateMatrixWorld(true);
    anchors.current.microphone.set(0, .0083, .014).applyMatrix4(assembly.device.matrixWorld);
    anchors.current.magnet.set(0, -.0001, -.013).applyMatrix4(assembly.device.matrixWorld);
    anchors.current.center.set(0, .003, 0).applyMatrix4(assembly.device.matrixWorld);
    // Shared imperative frame data, consumed by the SVG overlay after this frame callback.
    // eslint-disable-next-line react-hooks/immutability
    anchors.current.ready = true;
  }, -.5);
  return <group ref={stage} dispose={null}><primitive object={assembly.wrist} /><primitive object={assembly.necklace} /><primitive object={assembly.device} /><pointLight ref={magneticLight} position={[0, .85, 0]} intensity={0} distance={3} color="#72d2ff" /></group>;
}
