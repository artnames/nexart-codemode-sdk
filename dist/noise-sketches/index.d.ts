/**
 * Noise Sketches Index
 *
 * Exports all available noise sketch generators for the Code Mode runtime.
 */
import FRACTAL_NOISE_SKETCH from './fractalNoise';
export type NoiseSketchName = 'fractalNoise';
/**
 * Get a noise sketch by name
 */
export declare function getNoiseSketch(name: NoiseSketchName): string;
/**
 * Check if a sketch name is valid
 */
export declare function isValidNoiseSketch(name: string): name is NoiseSketchName;
/**
 * Get list of all available noise sketch names
 */
export declare function getAvailableNoiseSketchNames(): NoiseSketchName[];
export { FRACTAL_NOISE_SKETCH };
//# sourceMappingURL=index.d.ts.map