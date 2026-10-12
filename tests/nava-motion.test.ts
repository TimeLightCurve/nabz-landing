import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleFloat } from '../lib/nava/motion.ts';

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
