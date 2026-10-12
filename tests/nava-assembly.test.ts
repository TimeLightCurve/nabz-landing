import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Matrix4, Vector3, Quaternion, Euler, Group } from 'three';
import { solveDockPose, resolveAssembly } from '../lib/nava/assembly.ts';
import { readFile } from 'node:fs/promises';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3, PerspectiveCamera, Mesh } from 'three';
import { sampleStory, presentation } from '../lib/nava/timeline.ts';
import { sampleScrollCamera, sampleFloat } from '../lib/nava/motion.ts';

test('contact frame lands on dock under unrelated parent transforms', () => {
  const dock = new Matrix4().compose(new Vector3(4, 2, -3), new Quaternion().setFromEuler(new Euler(.3, 1, -.4)), new Vector3(2, 2, 2));
  const contact = new Matrix4().compose(new Vector3(0, .2, -.1), new Quaternion().setFromEuler(new Euler(.2, -.4, 0)), new Vector3(1, 1, 1));
  const aligned = solveDockPose(dock, contact).multiply(contact);
  aligned.elements.forEach((value, i) => assert.ok(Math.abs(value - dock.elements[i]) < 1e-6));
});
test('missing product hierarchy reports the exact missing assembly', () => {
  assert.throws(() => resolveAssembly(new Group(), new Group()), /NAVA_SYSTEM/);
});

async function load(name: string) {
  const bytes = await readFile(new URL(`../public/${name}.glb`, import.meta.url));
  return (await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '')).scene;
}
test('actual assets normalize unrelated exporter scales without changing the originals', async () => {
  const wrist = await load('wristband'); const modular = await load('nava-modular');
  const root = wrist.getObjectByName('NAVA_SYSTEM')!;
  const originalScale = root.scale.clone();
  const assembly = resolveAssembly(wrist, modular);
  assert.ok(new Box3().setFromObject(assembly.device).getSize(new Vector3()).z > 2.5);
  assert.ok(new Box3().setFromObject(assembly.device).getSize(new Vector3()).z < 2.6);
  assert.ok(assembly.wristDock.distanceTo(assembly.necklaceDock) < .00001);
  assert.deepEqual(root.scale, originalScale);
  assert.ok(assembly.necklace.getObjectByName('NECKLACE_DOCK_TARGET'));
});
test('actual product assemblies fit desktop and mobile through the transfer', async () => {
  const assembly = resolveAssembly(await load('wristband-refined'), await load('nava-modular-refined'));
  const group = new Group(); group.add(assembly.device, assembly.wrist, assembly.necklace);
  for (const [width, height] of [[1440, 900], [768, 1024], [390, 844]]) {
    const mobile = width < 768;
    const camera = new PerspectiveCamera(mobile ? 48 : 36, width / height, .1, 60);
    camera.position.z = 10; camera.updateMatrixWorld();
    for (const p of [0, .23, .35, .45, .55, .65, .73, .82, .86, .92, .94, .96, .98, 1]) {
      const cameraPose = sampleScrollCamera(p, false, mobile, width / height);
      camera.position.set(...cameraPose.position); camera.lookAt(...cameraPose.target); camera.updateMatrixWorld();
      const pose = sampleStory(p); const framing = presentation(p, mobile);
      group.position.set(...framing.position); group.scale.setScalar(framing.scale); group.rotation.set(...framing.rotation);
      // Exercise a floating pose and maximum pointer offset on the narrow tablet.
      if (width === 768) {
        const floating = sampleFloat(3, false);
        group.position.add(new Vector3(...floating.position));
        group.rotation.set(...framing.rotation.map((value, i) => value + floating.rotation[i]) as [number, number, number]);
        camera.position.x += .28; camera.position.y += .18;
        camera.lookAt(...cameraPose.target); camera.updateMatrixWorld();
      }
      assembly.device.position.set(...pose.device.position);
      assembly.device.rotation.set(...pose.device.rotation);
      assembly.wrist.position.x = pose.wristX; assembly.necklace.position.x = pose.necklaceX;
      group.updateMatrixWorld(true);
      const visible = [assembly.device];
      if (pose.wristOpacity > .5) visible.push(assembly.wrist);
      // The closing macro shot intentionally crops the cord; the capsule must stay in frame.
      if (pose.necklaceOpacity > .3 && p <= .92) visible.push(assembly.necklace);
      for (const root of visible) root.traverse(node => {
        if (!(node instanceof Mesh)) return;
        const attr = node.geometry.attributes.position; const v = new Vector3();
        for (let i = 0; i < attr.count; i++) {
          v.fromBufferAttribute(attr, i).applyMatrix4(node.matrixWorld).project(camera);
          assert.ok(Math.abs(v.x) < .95 && Math.abs(v.y) < .9, `clipped ${width}px p=${p}: ${v.toArray()}`);
          if (mobile && root === assembly.device) assert.ok(v.y < .6, 'centered mobile capsule intrudes into heading p=' + p + ' y=' + v.y);
        }
      });
    }
  }
});


test('refined assets retain docking markers and distinct matte, chrome and callout materials', async () => {
  const assembly = resolveAssembly(await load('wristband-refined'), await load('nava-modular-refined'));
  const old = resolveAssembly(await load('wristband'), await load('nava-modular'));
  assert.ok(assembly.wristDock.distanceTo(old.wristDock) < .00001);
  assert.ok(assembly.necklaceDock.distanceTo(old.necklaceDock) < .00001);
  const parts: Mesh[] = []; assembly.device.traverse(o => { if (o instanceof Mesh) parts.push(o); });
  const front = parts.find(o => o.name.includes('Domed_front_shell'))!;
  assert.ok(front, 'front shell survives export');
  const material = front.material as import('three').MeshStandardMaterial;
  assert.ok(material.roughness > .6 && material.metalness < .1);
  for (const channel of ['microphone', 'magnets']) assert.ok(parts.some(o => (o.material as import('three').MeshStandardMaterial).userData.callout === channel));
  assert.ok(parts.some(o => o.name.includes('Microphone_chrome_bezel')));
  assert.ok(parts.some(o => o.name.includes('Magnet_callout_light')));
});
