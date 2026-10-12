import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleHardwareHighlights } from '../lib/nava/highlights.ts';
test('callout lighting is reversible, sustained while labels are readable, and off elsewhere', () => {
  for (const p of [0,.2,1,1.3,1.8]) assert.deepEqual(sampleHardwareHighlights(p), { microphone: 0, magnets: 0 });
  for (const p of [.4,.5,.7]) { const h=sampleHardwareHighlights(p); assert.equal(h.microphone,1); assert.equal(h.magnets,1); }
  assert.equal(sampleHardwareHighlights(.87).magnets,1);
  const middle=sampleHardwareHighlights(.34); assert.ok(middle.microphone>0 && middle.microphone<1);
  sampleHardwareHighlights(.9); assert.deepEqual(sampleHardwareHighlights(.34),middle);
});
