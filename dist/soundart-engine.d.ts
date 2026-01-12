/**
 * SoundArt → Code Mode Engine
 *
 * This is the orchestrator that runs SoundArt styles through the Code Mode engine.
 * It replaces the old Canvas2D-based SoundArt renderer with a Code Mode pipeline.
 *
 * Architecture:
 *   1. Sound analysis produces SoundFeatures (unchanged)
 *   2. SoundFeatures → SoundSnapshot conversion
 *   3. SoundSnapshot injected as S.* globals into Code Mode
 *   4. SoundArt sketch executed via Code Mode runtime
 *   5. Result: PNG or MP4 output
 */
import type { SoundSnapshot, SoundFeatures } from '../../shared/soundSnapshot';
import { type SoundArtSketchName } from './soundart-sketches';
export interface TweakParams {
    volumeRangeFactor?: number;
    centroidBrightnessFactor?: number;
    aggressionPaletteFactor?: number;
    rhythmPatternFactor?: number;
    harmonySmoothnessFactor?: number;
    attackSharpnessFactor?: number;
    dynamicRangeVariationFactor?: number;
    bassThicknessFactor?: number;
    trebleSharpnessFactor?: number;
}
export interface SoundArtEngineConfig {
    width: number;
    height: number;
    seed?: number;
    backgroundMode?: 'rgb' | 'black' | 'white';
    tweakParams?: TweakParams;
}
export interface SoundArtRenderOptions {
    style: SoundArtSketchName;
    sound: SoundFeatures;
    canvas: HTMLCanvasElement;
    config: SoundArtEngineConfig;
    onProgress?: (progress: number) => void;
}
export interface SoundArtRenderResult {
    style: SoundArtSketchName;
    mode: 'soundart';
    snapshot: SoundSnapshot;
    metadata: SoundArtMetadata;
}
export interface SoundArtMetadata {
    mode: 'SoundArt';
    style: SoundArtSketchName;
    timestamp: string;
    soundFeatures: {
        duration: number;
        amplitude: number;
        frequency: number;
        bass: number;
        treble: number;
        aggression: number;
    };
    effects: {
        timeFilter: boolean;
        backgroundMode: string;
    };
    generationParams: {
        seed: number;
        canvasSize: {
            width: number;
            height: number;
        };
    };
}
/**
 * Render a SoundArt style using Code Mode
 *
 * This is the main entry point for the new SoundArt → Code Mode pipeline.
 */
export declare function renderSoundArtViaCodeMode(options: SoundArtRenderOptions): Promise<SoundArtRenderResult>;
/**
 * Check if a SoundArt style can be rendered via Code Mode
 */
export declare function canRenderViaCodeMode(style: SoundArtSketchName): boolean;
/**
 * Get the list of SoundArt styles available via Code Mode
 */
export declare function getCodeModeAvailableStyles(): SoundArtSketchName[];
export type { SoundSnapshot, SoundFeatures } from '../../shared/soundSnapshot';
export type { SoundArtSketchName } from './soundart-sketches';
//# sourceMappingURL=soundart-engine.d.ts.map