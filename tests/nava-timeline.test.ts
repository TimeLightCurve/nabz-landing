import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleStory } from '../lib/nava/timeline.ts';

test('endpoints dock exactly and invalid progress clamps safely', () => {
  assert.deepEqual(sampleStory(0).device.position, [0, .165, 0]);
  assert.deepEqual(sampleStory(1).device.position, [0, .165, 0]);
  assert.deepEqual(sampleStory(-2), sampleStory(0));
  assert.deepEqual(sampleStory(4), sampleStory(1));
  assert.deepEqual(sampleStory(NaN), sampleStory(0));
});
test('all poses stay finite and are independent of sampling order', () => {
  for (let i = 0; i <= 1000; i++) {
    const p = i / 1000;
    const pose = sampleStory(p);
    assert.ok(!JSON.stringify(pose).includes('null'));
    sampleStory(1 - p);
    assert.deepEqual(sampleStory(p), pose);
  }
});
test('phase boundaries have no position discontinuity', () => {
  for (const p of [.18, .38, .65, .8]) {
    const a = sampleStory(p - 1e-6).device.position;
    const b = sampleStory(p + 1e-6).device.position;
    assert.ok(Math.hypot(...a.map((v, i) => v - b[i])) < .001);
  }
});
test('device lifts clear before accessories separate and ends on necklace', () => {
  assert.ok(sampleStory(.38).device.position[1] > 1);
  assert.equal(sampleStory(.18).wristX, 0);
  assert.equal(sampleStory(1).necklaceX, 0);
  assert.ok(sampleStory(1).wristX < -3);
});
