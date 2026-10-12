type Vec3 = [number, number, number];

export function sampleFloat(time: number, reducedMotion: boolean): { position: Vec3; rotation: Vec3 } {
  if (reducedMotion) return { position: [0, 0, 0], rotation: [0, 0, 0] };
  return {
    position: [Math.sin(time * .37) * .018, Math.sin(time * .72) * .055, Math.sin(time * .46) * .015],
    rotation: [Math.sin(time * .49) * .012, Math.sin(time * .32) * .016, Math.sin(time * .41) * .01],
  };
}
