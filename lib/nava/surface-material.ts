import type { MeshStandardMaterial } from 'three';

/** Object-space detail works on the supplied shells, which have no UV coordinates. */
export function addSurfaceDetail(material: MeshStandardMaterial, textile: boolean) {
  material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vNavaSurface;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvNavaSurface = position;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `
      #include <common>
      varying vec3 vNavaSurface;
      float navaGrain(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
    `);
    shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', `
      #include <roughnessmap_fragment>
      float grain = navaGrain(floor(vNavaSurface * ${textile ? '28000.0' : '65000.0'}));
      float brushed = sin(vNavaSurface.z * 95000.0 + sin(vNavaSurface.x * 2200.0));
      ${textile ? `
        float weave = sin(vNavaSurface.x * 19000.0) * sin(vNavaSurface.z * 19000.0);
        diffuseColor.rgb *= 0.87 + weave * 0.1 + grain * 0.2;
        roughnessFactor = clamp(roughnessFactor + weave * 0.09, 0.5, 1.0);
      ` : `
        diffuseColor.rgb *= 0.95 + grain * 0.09;
        roughnessFactor = clamp(roughnessFactor + (grain - 0.5) * 0.12 + brushed * 0.025, 0.18, 0.6);
      `}
    `);
  };
  material.customProgramCacheKey = () => `nava-surface-v1-${textile ? 'woven' : 'anodized'}`;
}
