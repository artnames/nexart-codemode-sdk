/**
 * SoundArt Sketches Index
 * 
 * All SoundArt styles converted to Code Mode sketches.
 * Each sketch uses S.* globals for sound-derived parameters.
 */

import { RINGS_SKETCH } from './rings';
import { PIXEL_GLYPHS_SKETCH } from './pixelGlyphs';
import { RADIAL_BURST_SKETCH } from './radialBurst';
import { ORB_SKETCH } from './orb';
import { WAVE_STRIPES_SKETCH } from './waveStripes';
import { SQUARES_SKETCH } from './squares';
import { LOOM_WEAVE_SKETCH } from './loomWeave';
import { NOISE_TERRACES_SKETCH } from './noiseTerraces';
import { PRISM_FLOW_FIELDS_SKETCH } from './prismFlowFields';
import { CHLADNI_BLOOM_SKETCH } from './chladniBloom';
import { DUAL_VORTEX_SKETCH } from './dualVortex';
import { ISOFLOW_SKETCH } from './isoflow';
import { GEOMETRY_ILLUSION_SKETCH } from './geometryIllusion';
import { RESONANT_SOUND_BODIES_SKETCH } from './resonantSoundBodies';

export type SoundArtSketchName = 
  | 'rings'
  | 'pixelGlyphs'
  | 'radialBurst'
  | 'orb'
  | 'waveStripes'
  | 'squares'
  | 'loomWeave'
  | 'noiseTerraces'
  | 'prismFlowFields'
  | 'chladniBloom'
  | 'dualVortex'
  | 'isoflow'
  | 'geometryIllusion'
  | 'resonantSoundBodies';

/**
 * Map of all available SoundArt sketches
 * Each sketch is a string containing Code Mode compatible code
 */
export const SOUNDART_SKETCHES: Record<SoundArtSketchName, string> = {
  rings: RINGS_SKETCH,
  pixelGlyphs: PIXEL_GLYPHS_SKETCH,
  radialBurst: RADIAL_BURST_SKETCH,
  orb: ORB_SKETCH,
  waveStripes: WAVE_STRIPES_SKETCH,
  squares: SQUARES_SKETCH,
  loomWeave: LOOM_WEAVE_SKETCH,
  noiseTerraces: NOISE_TERRACES_SKETCH,
  prismFlowFields: PRISM_FLOW_FIELDS_SKETCH,
  chladniBloom: CHLADNI_BLOOM_SKETCH,
  dualVortex: DUAL_VORTEX_SKETCH,
  isoflow: ISOFLOW_SKETCH,
  geometryIllusion: GEOMETRY_ILLUSION_SKETCH,
  resonantSoundBodies: RESONANT_SOUND_BODIES_SKETCH,
};

/**
 * Get a SoundArt sketch by name
 */
export function getSoundArtSketch(name: SoundArtSketchName): string | undefined {
  return SOUNDART_SKETCHES[name];
}

/**
 * Get list of available (converted) SoundArt sketches
 */
export function getAvailableSoundArtSketches(): SoundArtSketchName[] {
  return Object.keys(SOUNDART_SKETCHES) as SoundArtSketchName[];
}

/**
 * Check if a SoundArt sketch has been converted to Code Mode
 */
export function isSoundArtSketchAvailable(name: SoundArtSketchName): boolean {
  return name in SOUNDART_SKETCHES;
}

export { RINGS_SKETCH } from './rings';
export { PIXEL_GLYPHS_SKETCH } from './pixelGlyphs';
export { RADIAL_BURST_SKETCH } from './radialBurst';
export { ORB_SKETCH } from './orb';
export { WAVE_STRIPES_SKETCH } from './waveStripes';
export { SQUARES_SKETCH } from './squares';
export { LOOM_WEAVE_SKETCH } from './loomWeave';
export { NOISE_TERRACES_SKETCH } from './noiseTerraces';
export { PRISM_FLOW_FIELDS_SKETCH } from './prismFlowFields';
export { CHLADNI_BLOOM_SKETCH } from './chladniBloom';
export { DUAL_VORTEX_SKETCH } from './dualVortex';
export { ISOFLOW_SKETCH } from './isoflow';
export { GEOMETRY_ILLUSION_SKETCH } from './geometryIllusion';
export { RESONANT_SOUND_BODIES_SKETCH } from './resonantSoundBodies';
