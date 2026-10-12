export type Vec3 = [number, number, number];
export type StoryPose = {
  device: { position: Vec3; rotation: Vec3 };
  wristX: number; necklaceX: number; wristOpacity: number; necklaceOpacity: number;
  rotation: Vec3; position: Vec3; scale: number; glow: number;
};
export const CHAPTERS = [
  { id: 'within-reach', label: 'Within reach', progress: 0 },
  { id: 'release', label: 'The connection', progress: .27 },
  { id: 'move', label: 'Made to move', progress: .51 },
  { id: 'connect', label: 'Magnetic by nature', progress: .73 },
  { id: 'with-you', label: 'Always with you', progress: 1 },
] as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, p: number) => {
  const t = Math.max(0, Math.min(1, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export function sampleStory(value: number): StoryPose {
  const p = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  const lift = smooth(.18, .38, p);
  const transfer = smooth(.38, .65, p);
  const dock = smooth(.65, .8, p);
  const finish = smooth(.78, 1, p);
  const framing = smooth(.3, .55, p);
  // Keep the presentation rotating even while the attachment choreography holds.
  const turning = p;
  const y = .165 + 1.65 * lift * (1 - dock);
  const x = Math.sin(transfer * Math.PI) * .65 * (1 - dock);
  return {
    device: { position: [x, y, 0], rotation: [Math.sin(transfer * Math.PI) * .25, 0, Math.sin(transfer * Math.PI) * -.45] },
    wristX: transfer === 0 ? 0 : -4.8 * transfer,
    necklaceX: 5.3 * (1 - transfer),
    wristOpacity: 1 - smooth(.38, .52, p),
    necklaceOpacity: smooth(.43, .6, p),
    rotation: [lerp(1.08, 1.4, turning), lerp(.4, -.18, turning), lerp(-.56, -.12, turning)],
    position: [0, lerp(.78, -1.85, framing), 0],
    scale: lerp(1.03, .57, framing),
    glow: Math.sin(dock * Math.PI) * .8 + finish * .12,
  };
}

export function presentation(p: number, mobile: boolean) {
  const pose = sampleStory(p);
  const end = smooth(.4, 1, p);
  return {
    position: [mobile ? .05 : .65, pose.position[1] + (mobile ? lerp(-.85, -.08, end) : 0), 0] as Vec3,
    scale: pose.scale * (mobile ? lerp(.65, .85, end) : 1),
    rotation: pose.rotation,
  };
}
