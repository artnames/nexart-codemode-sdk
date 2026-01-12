/**
 * Noise Bridge - Injects N.* globals into Code Mode runtime
 *
 * This is the bridge between NoiseSnapshot data and the Code Mode p5-runtime.
 * It creates frozen N.* globals that noise sketches can access deterministically.
 *
 * Similar to sound-bridge.ts for SoundArt, but for Noise parameters.
 */
import type { NoiseSnapshot, NoiseBlendMode } from '../../shared/noiseSnapshot';
/**
 * The N.* global object type for noise sketches
 */
export interface NoiseGlobals {
    scale: number;
    octaves: number;
    persistence: number;
    lacunarity: number;
    cellDensity: number;
    cellDistortion: number;
    blendMode: NoiseBlendMode;
    isPerlinOnly: boolean;
    isBlend: boolean;
    isWarp: boolean;
    isInterleave: boolean;
    bgR: number;
    bgG: number;
    bgB: number;
    noiseR: number;
    noiseG: number;
    noiseB: number;
    seed: number;
    zoom: number;
}
/**
 * Create N.* globals from a NoiseSnapshot
 */
export declare function createNoiseGlobals(snapshot: NoiseSnapshot): NoiseGlobals;
/**
 * Inject N.* globals into code string
 *
 * This wraps the sketch code with N.* variable declarations
 */
export declare function injectNoiseGlobals(sketchCode: string, globals: NoiseGlobals): string;
//# sourceMappingURL=noise-bridge.d.ts.map