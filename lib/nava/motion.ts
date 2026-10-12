import { Euler, Vector3 } from 'three';
import { presentation, sampleStory, storyProgress, smooth } from './timeline.ts';
type Vec3 = [number, number, number];

export function sampleScrollCamera(progress: number, reducedMotion: boolean, mobile: boolean): { position: Vec3; target: Vec3 } {
  const p = storyProgress(Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0, reducedMotion);
  const amount = mobile ? .55 : 1;
  const pose = sampleStory(p);
  const framing = presentation(p, mobile);
  const track = new Vector3(pose.device.position[0], 0, 0).multiplyScalar(framing.scale).applyEuler(new Euler(...framing.rotation));
  const close = smooth(.92, 1, p);
  const deviceCenter = new Vector3(...pose.device.position).multiplyScalar(framing.scale).applyEuler(new Euler(...framing.rotation)).add(new Vector3(...framing.position));
  // Preserve room for the chapter copy, then focus the final shot on the capsule.
  deviceCenter.x -= mobile ? 0 : .65;
  deviceCenter.y += mobile ? .65 : .05;
  track.lerp(deviceCenter, close);
  const orbit = reducedMotion ? 0 : Math.sin(smooth(.25, .9, p) * Math.PI * 2) * .38 * amount;
  const elevation = reducedMotion ? 0 : Math.sin(p * Math.PI * 2) * .22 * amount;
  const distance = reducedMotion ? 10 : (12 - 2.2 * smooth(0, .27, p) - .25 * p) * (1 - close) + (mobile ? 4.5 : 4.2) * close;
  return {
    position: [track.x + Math.sin(orbit) * distance, track.y + elevation, track.z + Math.cos(orbit) * distance],
    target: [track.x, track.y, track.z],
  };
}

export function sampleFloat(time: number, reducedMotion: boolean): { position: Vec3; rotation: Vec3 } {
  if (reducedMotion) return { position: [0, 0, 0], rotation: [0, 0, 0] };
  return {
    position: [Math.sin(time * .37) * .018, Math.sin(time * .72) * .055, Math.sin(time * .46) * .015],
    rotation: [Math.sin(time * .49) * .012, Math.sin(time * .32) * .016, Math.sin(time * .41) * .01],
  };
}
