import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Matrix4, Vector3, Quaternion, Euler, Group } from 'three';
import { solveDockPose, resolveAssembly } from '../lib/nava/assembly.ts';

test('contact frame lands on dock under unrelated parent transforms', () => {
  const dock = new Matrix4().compose(new Vector3(4, 2, -3), new Quaternion().setFromEuler(new Euler(.3, 1, -.4)), new Vector3(2, 2, 2));
  const contact = new Matrix4().compose(new Vector3(0, .2, -.1), new Quaternion().setFromEuler(new Euler(.2, -.4, 0)), new Vector3(1, 1, 1));
  const aligned = solveDockPose(dock, contact).multiply(contact);
  aligned.elements.forEach((value, i) => assert.ok(Math.abs(value - dock.elements[i]) < 1e-6));
});
test('missing product hierarchy reports the exact missing assembly', () => {
  assert.throws(() => resolveAssembly(new Group(), new Group()), /NAVA_SYSTEM/);
});
