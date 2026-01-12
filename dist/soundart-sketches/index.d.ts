/**
 * SoundArt Sketches Index
 *
 * All SoundArt styles converted to Code Mode sketches.
 * Each sketch uses S.* globals for sound-derived parameters.
 */
export type SoundArtSketchName = 'rings' | 'pixelGlyphs' | 'radialBurst' | 'orb' | 'waveStripes' | 'squares' | 'loomWeave' | 'noiseTerraces' | 'prismFlowFields' | 'chladniBloom' | 'dualVortex' | 'isoflow' | 'geometryIllusion' | 'resonantSoundBodies';
/**
 * Map of all available SoundArt sketches
 * Each sketch is a string containing Code Mode compatible code
 */
export declare const SOUNDART_SKETCHES: Record<SoundArtSketchName, string>;
/**
 * Get a SoundArt sketch by name
 */
export declare function getSoundArtSketch(name: SoundArtSketchName): string | undefined;
/**
 * Get list of available (converted) SoundArt sketches
 */
export declare function getAvailableSoundArtSketches(): SoundArtSketchName[];
/**
 * Check if a SoundArt sketch has been converted to Code Mode
 */
export declare function isSoundArtSketchAvailable(name: SoundArtSketchName): boolean;
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
//# sourceMappingURL=index.d.ts.map