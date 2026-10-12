import { Group, Matrix4, Mesh, MeshStandardMaterial, Object3D } from 'three';
import { addSurfaceDetail } from './surface-material.ts';

export const MODEL_SCALE = 55;
export function solveDockPose(dockWorld: Matrix4, contactLocal: Matrix4): Matrix4 {
  return dockWorld.clone().multiply(contactLocal.clone().invert());
}
function required(root: Object3D, name: string): Object3D {
  const node = root.getObjectByName(name);
  if (!node) throw new Error(`NAVA model is missing ${name}`);
  return node;
}
function prepare(source: Object3D): Group {
  const group = new Group();
  const clone = source.clone(true);
  clone.position.set(0, 0, 0);
  clone.quaternion.identity();
  clone.scale.setScalar(1);
  clone.traverse(node => {
    if (!(node instanceof Mesh)) return;
    const original = node.material as MeshStandardMaterial;
    const material = original.clone();
    const name = original.name.toLowerCase();
    const part = node.name.replaceAll('_', ' ').toLowerCase();
    if (name.includes('graphite')) {
      material.color.set('#233c50'); material.metalness = .88; material.roughness = .32;
      addSurfaceDetail(material, false);
    } else if (name.includes('textile')) {
      material.color.set('#18232c'); material.metalness = .12; material.roughness = .79;
      addSurfaceDetail(material, true);
    } else if (name.includes('steel') || name.includes('edge')) {
      material.color.set('#7796a5'); material.metalness = .95; material.roughness = .22;
    }
    if (part.includes('fine perimeter seam')) {
      material.color.set('#123342'); material.emissive.set('#4ac9ee'); material.emissiveIntensity = .7;
      material.metalness = .5; material.roughness = .24;
    } else if (part.includes('insignia')) {
      material.color.set('#a5dce7'); material.emissive.set('#57c8e4'); material.emissiveIntensity = .38;
      material.roughness = .2;
    } else if (part.includes('side control')) {
      material.color.set('#426479'); material.metalness = .94; material.roughness = .23;
    }
    material.envMapIntensity = 1.65;
    node.material = material;
  });
  group.scale.setScalar(MODEL_SCALE);
  group.add(clone);
  return group;
}
export function resolveAssembly(wristScene: Object3D, modularScene: Object3D) {
  const wristRoot = required(wristScene, 'NAVA_SYSTEM');
  const modularRoot = required(modularScene, 'NAVA_SYSTEM');
  const deviceSource = required(wristRoot, 'DEVICE_ROOT');
  const wristSource = required(wristRoot, 'WRIST_ROOT');
  const necklaceSource = required(modularRoot, 'NECKLACE_ROOT');
  const wristMarker = required(wristSource, 'WRIST_DOCK_TARGET');
  const necklaceMarker = required(necklaceSource, 'NECKLACE_DOCK_TARGET');
  // GLB marker positions are device-root docking poses, not magnet surface centers.
  const wristDock = wristMarker.position.clone().multiplyScalar(MODEL_SCALE);
  const necklaceDock = necklaceMarker.position.clone().multiplyScalar(MODEL_SCALE);
  const contactLocal = new Matrix4().makeTranslation(
    (wristMarker.position.x - deviceSource.position.x) * MODEL_SCALE,
    (wristMarker.position.y - deviceSource.position.y) * MODEL_SCALE,
    (wristMarker.position.z - deviceSource.position.z) * MODEL_SCALE,
  );
  return {
    device: prepare(deviceSource), wrist: prepare(wristSource), necklace: prepare(necklaceSource),
    wristDock, necklaceDock, contactLocal,
  };
}
