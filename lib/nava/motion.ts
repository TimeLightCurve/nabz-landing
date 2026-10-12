import { Euler, Vector3 } from 'three';
import { presentation, sampleStory, storyProgress } from './timeline.ts';
type Vec3 = [number, number, number];

export function sampleScrollCamera(progress: number, reducedMotion: boolean, mobile: boolean): { position: Vec3; target: Vec3 } {
  const p = storyProgress(Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0, reducedMotion);
  const amount = mobile ? .55 : 1;
  const pose = sampleStory(p);
  const framing = presentation(p, mobile);
  const track = new Vector3(pose.device.position[0], 0, 0).multiplyScalar(framing.scale).applyEuler(new Euler(...framing.rotation));
  const motion = reducedMotion ? 0 : amount;
  return {
    // Track the device's real travel in world space, with a secondary camera orbit.
    position: [track.x + Math.sin(p * Math.PI * 1.2) * .65 * motion, track.y + Math.sin(p * Math.PI * 2) * .16 * motion, track.z + 10 + p * .45 * motion],
    target: [track.x + p * .12 * motion, track.y - p * .04 * motion, track.z],
  };
}

export function sampleFloat(time: number, reducedMotion: boolean): { position: Vec3; rotation: Vec3 } {
  if (reducedMotion) return { position: [0, 0, 0], rotation: [0, 0, 0] };
  return {
    position: [Math.sin(time * .37) * .018, Math.sin(time * .72) * .055, Math.sin(time * .46) * .015],
    rotation: [Math.sin(time * .49) * .012, Math.sin(time * .32) * .016, Math.sin(time * .41) * .01],
  };
}
