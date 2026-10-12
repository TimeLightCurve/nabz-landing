import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleStory, TRANSFER_DISTANCE, sampleAnnotations, STORY_END, CHAPTERS, chapterAt } from '../lib/nava/timeline.ts';

test('endpoints dock exactly and invalid progress clamps safely', () => {
  assert.deepEqual(sampleStory(0).device.position, [0, .165, 0]);
  assert.deepEqual(sampleStory(1).device.position, [TRANSFER_DISTANCE, .165, 0]);
  assert.deepEqual(sampleStory(-2), sampleStory(0));
  assert.deepEqual(sampleStory(4), sampleStory(STORY_END));
  assert.deepEqual(sampleStory(NaN), sampleStory(0));
});

test('the details sequence releases the necklace continuously and maps every navigation target', () => {
  const docked = sampleStory(1);
  const firstFrame = sampleStory(1 + 1e-6);
  assert.ok(Math.abs(firstFrame.scale - docked.scale) < .001);
  assert.ok(Math.abs(firstFrame.device.position[1] - docked.device.position[1]) < .001);
  assert.equal(sampleStory(1.2).necklaceOpacity, 0);
  assert.ok(sampleStory(1.2).device.position[1] > docked.device.position[1] + 1);
  assert.ok(sampleStory(1.6).device.rotation[1] > sampleStory(1.2).device.rotation[1]);
  CHAPTERS.forEach((chapter, index) => assert.equal(chapterAt(chapter.progress), index));
  for (let p = 1; p <= STORY_END; p += .01) {
    assert.ok(!JSON.stringify(sampleStory(p)).includes('null'));
    assert.equal(sampleAnnotations(p).opacity, 0);
  }
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
  for (const p of [.14, .28, .38, .65, .78, .82, .92]) {
    const a = sampleStory(p - 1e-6).device.position;
    const b = sampleStory(p + 1e-6).device.position;
    assert.ok(Math.hypot(...a.map((v, i) => v - b[i])) < .001);
  }
});
test('device lifts clear before accessories separate and ends on necklace', () => {
  assert.ok(sampleStory(.38).device.position[1] > 1);
  assert.equal(sampleStory(.18).wristX, 0);
  assert.equal(sampleStory(1).necklaceX, TRANSFER_DISTANCE);
  assert.equal(sampleStory(1).wristX, 0);
  assert.ok(TRANSFER_DISTANCE >= 12);
});

test('spec arc draws with scroll and labels hold through the showcase', () => {
  assert.equal(sampleAnnotations(.2).draw, 0);
  assert.equal(sampleAnnotations(.7).draw, 1);
  let previous = 0;
  for (let i = 20; i <= 70; i++) {
    const state = sampleAnnotations(i / 100);
    assert.ok(state.draw >= previous); previous = state.draw;
  }
  for (const p of [.4, .5, .6, .7]) assert.equal(sampleAnnotations(p).labels, 1);
  for (const p of [.85, .9, .92]) {
    assert.equal(sampleAnnotations(p).opacity, 1);
    assert.equal(sampleAnnotations(p).necklaceLabels, 1);
  }
  assert.equal(sampleAnnotations(.94).necklaceLabels, 0, 'clear labels before closing copy enters');
  assert.equal(sampleAnnotations(.95).opacity, 1, 'ring holds after labels fade');
  assert.equal(sampleAnnotations(1).opacity, 0);
});
