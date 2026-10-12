import { sampleAnnotations } from './timeline.ts';

/** The same reveal envelope drives text and hardware, including reverse scrolling. */
export function sampleHardwareHighlights(progress: number) {
  const annotations = sampleAnnotations(progress);
  return { microphone: annotations.labels, magnets: Math.max(annotations.labels, annotations.necklaceLabels) };
}
