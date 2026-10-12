import { Group, Matrix4, Mesh, MeshStandardMaterial, Object3D } from 'three';

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
    if (name.includes('graphite')) {
      material.color.set('#344653'); material.metalness = .82; material.roughness = .29;
    } else if (name.includes('textile')) {
      material.color.set('#18232c'); material.metalness = .12; material.roughness = .79;
    } else if (name.includes('steel') || name.includes('edge')) {
      material.color.set('#7796a5'); material.metalness = .95; material.roughness = .22;
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
