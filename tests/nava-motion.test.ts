import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleFloat, sampleScrollCamera } from '../lib/nava/motion.ts';
import { sampleStory, STORY_END } from '../lib/nava/timeline.ts';
import { PerspectiveCamera, Vector3 } from 'three';

test('float moves over time within a subtle bounded envelope', () => {
  assert.notDeepEqual(sampleFloat(0, false), sampleFloat(2, false));
  for (let t = 0; t < 120; t += .1) {
    const pose = sampleFloat(t, false);
    assert.ok(pose.position.every(v => Math.abs(v) <= .06));
    assert.ok(pose.rotation.every(v => Math.abs(v) <= .02));
  }
});
test('reduced motion removes every floating offset', () => {
  for (const t of [0, 1, 30, 1000]) assert.deepEqual(sampleFloat(t, true), { position: [0, 0, 0], rotation: [0, 0, 0] });
});

test('camera pushes in, orbits both sides of the device, and ends in a close-up', () => {
  for (const mobile of [false, true]) {
    const distance = (p: number) => { const c = sampleScrollCamera(p, false, mobile); return Math.hypot(...c.position.map((v, i) => v - c.target[i])); };
    assert.ok(distance(0) > distance(.25) + 1.5);
    assert.ok(distance(1) < distance(.92) * .55);
    const left = sampleScrollCamera(.42, false, mobile);
    const right = sampleScrollCamera(.73, false, mobile);
    assert.ok(left.position[0] - left.target[0] > 1);
    assert.ok(right.position[0] - right.target[0] < -1);
  }
});

test('camera completes one full orbit with its focus centered and in front throughout', () => {
  let previous = 0; let total = 0;
  for (let i = 0; i <= 100; i++) {
    const p = .33 + i / 100 * .45;
    const pose = sampleScrollCamera(p, false, false);
    const offset = new Vector3(...pose.position).sub(new Vector3(...pose.target));
    const angle = Math.atan2(offset.x, offset.z);
    if (i) total += Math.atan2(Math.sin(angle - previous), Math.cos(angle - previous));
    previous = angle;
    const camera = new PerspectiveCamera(36, 1.6, .1, 120);
    camera.position.set(...pose.position); camera.lookAt(...pose.target); camera.updateMatrixWorld();
    const center = new Vector3(...pose.target).project(camera);
    assert.ok(Math.abs(center.x) < 1e-9 && Math.abs(center.y) < 1e-9);
    assert.ok(center.z > -1 && center.z < 1, 'overlay anchor must remain in front of camera');
  }
  assert.ok(Math.abs(total - Math.PI * 2) < 1e-9);
});

test('opening descends from an overhead view to a level orbit as the device rises', () => {
  const opening = sampleScrollCamera(0, false, false);
  const level = sampleScrollCamera(.33, false, false);
  const angle = (pose: typeof opening) => {
    const d = new Vector3(...pose.position).sub(new Vector3(...pose.target));
    return Math.atan2(d.y, Math.hypot(d.x, d.z));
  };
  assert.ok(angle(opening) > 1, 'opening looks down at the ground');
  assert.ok(Math.abs(angle(level)) < .03, 'camera levels before full orbit');
  assert.ok(level.target[1] > opening.target[1] + 2, 'device rises above the ground');
  assert.ok(sampleStory(.55).device.rotation[1] > .5, 'device retains a gentle Y turn');
  for (let p = 0; p <= 1; p += .01) assert.ok(sampleStory(p).device.rotation.every(angle => Math.abs(angle) <= .65), 'device does not tumble through full spins');
  assert.ok(Math.abs(sampleStory(1).device.rotation[1]) < 1e-9, 'Y rotation returns to docking orientation');
});

test('camera and product rotation respond to every scroll interval, including the opening and ending', () => {
  for (let i = 0; i < 1000; i++) {
    const a = i / 1000; const b = (i + 1) / 1000;
    const cameraA = sampleScrollCamera(a, false, false);
    const cameraB = sampleScrollCamera(b, false, false);
    assert.ok(Math.hypot(...cameraA.position.map((v, axis) => v - cameraB.position[axis])) > .00001, `camera dead zone at ${a}`);
    assert.notDeepEqual(sampleStory(a).rotation, sampleStory(b).rotation, `rotation dead zone at ${a}`);
  }
});

test('scroll camera is deterministic, clamps progress and respects reduced motion', () => {
  assert.deepEqual(sampleScrollCamera(-1, false, false), sampleScrollCamera(0, false, false));
  assert.deepEqual(sampleScrollCamera(2, false, false), sampleScrollCamera(STORY_END, false, false));
  for (const p of [0, .2, .5, .8, 1]) {
    const reduced = sampleScrollCamera(p, true, false);
    const reducedDistance = Math.hypot(...reduced.position.map((v, i) => v - reduced.target[i]));
    assert.ok(reducedDistance >= 10 - 1e-9 && reducedDistance <= 15 + 1e-9);
    if (p === .8) assert.ok(Math.abs(reducedDistance - 15) < 1e-9, 'reduced necklace view also fits the cord');
    const original = sampleScrollCamera(p, false, true);
    sampleScrollCamera(1 - p, false, true);
    assert.deepEqual(sampleScrollCamera(p, false, true), original);
  }
  assert.deepEqual(sampleScrollCamera(.4, true, false), sampleScrollCamera(.7, true, false), 'reduced motion stays at a fixed chapter view');
});
