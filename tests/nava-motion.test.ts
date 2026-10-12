import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleFloat, sampleScrollCamera } from '../lib/nava/motion.ts';
import { sampleStory } from '../lib/nava/timeline.ts';

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
  assert.deepEqual(sampleScrollCamera(2, false, false), sampleScrollCamera(1, false, false));
  for (const p of [0, .2, .5, .8, 1]) {
    assert.deepEqual(sampleScrollCamera(p, true, false), { position: [0, 0, 10], target: [0, 0, 0] });
    const original = sampleScrollCamera(p, false, true);
    sampleScrollCamera(1 - p, false, true);
    assert.deepEqual(sampleScrollCamera(p, false, true), original);
  }
});
