type Vec3 = [number, number, number];

export function sampleScrollCamera(progress: number, reducedMotion: boolean, mobile: boolean): { position: Vec3; target: Vec3 } {
  if (reducedMotion) return { position: [0, 0, 10], target: [0, 0, 0] };
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const amount = mobile ? .55 : 1;
  return {
    // One continuous orbit/dolly path: no chapter thresholds or flat holds.
    position: [Math.sin(p * Math.PI * 1.2) * .65 * amount, Math.sin(p * Math.PI * 2) * .16 * amount, 10 + p * .45 * amount],
    target: [p * .12 * amount, -p * .04 * amount, 0],
  };
}

export function sampleFloat(time: number, reducedMotion: boolean): { position: Vec3; rotation: Vec3 } {
  if (reducedMotion) return { position: [0, 0, 0], rotation: [0, 0, 0] };
  return {
    position: [Math.sin(time * .37) * .018, Math.sin(time * .72) * .055, Math.sin(time * .46) * .015],
    rotation: [Math.sin(time * .49) * .012, Math.sin(time * .32) * .016, Math.sin(time * .41) * .01],
  };
}
