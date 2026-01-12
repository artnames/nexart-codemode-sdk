/**
 * Noise Sketches Index
 *
 * Exports all available noise sketch generators for the Code Mode runtime.
 */
import FRACTAL_NOISE_SKETCH from './fractalNoise';
const NOISE_SKETCHES = {
    fractalNoise: FRACTAL_NOISE_SKETCH,
};
/**
 * Get a noise sketch by name
 */
export function getNoiseSketch(name) {
    return NOISE_SKETCHES[name];
}
/**
 * Check if a sketch name is valid
 */
export function isValidNoiseSketch(name) {
    return name in NOISE_SKETCHES;
}
/**
 * Get list of all available noise sketch names
 */
export function getAvailableNoiseSketchNames() {
    return Object.keys(NOISE_SKETCHES);
}
export { FRACTAL_NOISE_SKETCH };
