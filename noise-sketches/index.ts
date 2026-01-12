/**
 * Noise Sketches Index
 * 
 * Exports all available noise sketch generators for the Code Mode runtime.
 */

import FRACTAL_NOISE_SKETCH from './fractalNoise';

export type NoiseSketchName = 'fractalNoise';

const NOISE_SKETCHES: Record<NoiseSketchName, string> = {
  fractalNoise: FRACTAL_NOISE_SKETCH,
};

/**
 * Get a noise sketch by name
 */
export function getNoiseSketch(name: NoiseSketchName): string {
  return NOISE_SKETCHES[name];
}

/**
 * Check if a sketch name is valid
 */
export function isValidNoiseSketch(name: string): name is NoiseSketchName {
  return name in NOISE_SKETCHES;
}

/**
 * Get list of all available noise sketch names
 */
export function getAvailableNoiseSketchNames(): NoiseSketchName[] {
  return Object.keys(NOISE_SKETCHES) as NoiseSketchName[];
}

export { FRACTAL_NOISE_SKETCH };
