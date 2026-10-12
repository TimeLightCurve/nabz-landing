export type Vec3 = [number, number, number];
export const TRANSFER_DISTANCE = 14;
export type StoryPose = {
  device: { position: Vec3; rotation: Vec3 };
  wristX: number; necklaceX: number; wristOpacity: number; necklaceOpacity: number;
  rotation: Vec3; position: Vec3; scale: number; glow: number;
};
export const CHAPTERS = [
  { id: 'within-reach', label: 'Within reach', progress: 0 },
  { id: 'release', label: 'The connection', progress: .23 },
  { id: 'move', label: 'Hardware, considered', progress: .5 },
  { id: 'connect', label: 'Magnetic by nature', progress: .86 },
  { id: 'with-you', label: 'Always with you', progress: 1 },
] as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, p: number) => {
  const t = Math.max(0, Math.min(1, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export function sampleStory(value: number): StoryPose {
  const p = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  const lift = smooth(.14, .28, p);
  const transfer = smooth(.28, .82, p);
  const spin = smooth(.29, .79, p);
  const dock = smooth(.82, .92, p);
  const finish = smooth(.92, 1, p);
  const framing = smooth(.69, .86, p);
  // Keep the presentation rotating even while the attachment choreography holds.
  const turning = p;
  const y = .165 + 1.35 * lift * (1 - dock);
  const x = TRANSFER_DISTANCE * transfer;
  return {
    device: { position: [x, y, 0], rotation: [Math.sin(spin * Math.PI) * .1, Math.sin(spin * Math.PI) * .65, Math.sin(spin * Math.PI * 2) * .12] },
    wristX: 0,
    necklaceX: TRANSFER_DISTANCE,
    wristOpacity: 1 - smooth(.3, .43, p),
    necklaceOpacity: smooth(.78, .87, p),
    rotation: [lerp(1.08, 1.4, turning), lerp(.4, -.18, turning), lerp(-.56, -.12, turning)],
    position: [0, lerp(.78 + 2.5 * smooth(.08, .32, p), -1.85, framing), 0],
    scale: lerp(1.03 + .08 * Math.sin(transfer * Math.PI), .57, framing),
    glow: Math.sin(dock * Math.PI) * .8 + finish * .12,
  };
}

export function storyProgress(p: number, reduced: boolean) {
  return reduced ? (p < .17 ? 0 : p < .33 ? .26 : p < .78 ? .52 : p < .94 ? .92 : 1) : p;
}

export function sampleAnnotations(p: number) {
  return {
    draw: Math.max(0, Math.min(1, (p - .24) / .4)),
    opacity: smooth(.23, .27, p) * (1 - smooth(.96, 1, p)),
    labels: smooth(.32, .36, p) * (1 - smooth(.75, .79, p)),
    necklaceLabels: smooth(.8, .84, p) * (1 - smooth(.92, .94, p)),
  };
}

export function presentation(p: number, mobile: boolean) {
  const pose = sampleStory(p);
  const end = smooth(.4, 1, p);
  return {
    position: [mobile ? .05 : .65, pose.position[1] + (mobile ? lerp(-.85, -.25, end) : 0), 0] as Vec3,
    scale: pose.scale * (mobile ? lerp(.65, .85, end) : 1),
    rotation: pose.rotation,
  };
}
