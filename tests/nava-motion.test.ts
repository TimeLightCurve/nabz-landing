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
    const reduced = sampleScrollCamera(p, true, false);
    assert.ok(Math.abs(reduced.position[0] - reduced.target[0]) < 1e-9);
    assert.ok(Math.abs(reduced.position[1] - reduced.target[1]) < 1e-9);
    assert.ok(Math.abs(reduced.position[2] - reduced.target[2] - 10) < 1e-9);
    const original = sampleScrollCamera(p, false, true);
    sampleScrollCamera(1 - p, false, true);
    assert.deepEqual(sampleScrollCamera(p, false, true), original);
  }
  assert.deepEqual(sampleScrollCamera(.4, true, false), sampleScrollCamera(.7, true, false), 'reduced motion stays at a fixed chapter view');
});
