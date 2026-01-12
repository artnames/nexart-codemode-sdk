/**
 * Noise → Code Mode Engine
 *
 * This is the orchestrator that runs Noise rendering through the Code Mode engine.
 * It replaces the legacy p5.js-based NoiseCanvas with a protocol-compliant pipeline.
 *
 * Architecture:
 *   1. NoiseParams from UI state
 *   2. NoiseParams → NoiseSnapshot conversion
 *   3. NoiseSnapshot injected as N.* globals into Code Mode
 *   4. Noise sketch executed via Code Mode runtime
 *   5. Result: PNG output (deterministic)
 */
import type { NoiseSnapshot, NoiseParams } from '../../shared/noiseSnapshot';
export interface NoiseEngineConfig {
    width: number;
    height: number;
    seed: number;
}
export interface NoiseRenderOptions {
    params: NoiseParams;
    canvas: HTMLCanvasElement;
    config: NoiseEngineConfig;
    onProgress?: (progress: number) => void;
}
export interface NoiseRenderResult {
    mode: 'noise';
    snapshot: NoiseSnapshot;
    metadata: NoiseMetadata;
}
export interface NoiseMetadata {
    mode: 'Noise';
    timestamp: string;
    enforcement: 'hard';
    renderedVia: 'codemode';
    noiseParams: {
        scale: number;
        octaves: number;
        persistence: number;
        lacunarity: number;
        cellDensity: number;
        cellDistortion: number;
        blendMode: string;
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
 * Render noise via Code Mode runtime
 *
 * This is the main entry point for protocol-compliant noise rendering.
 * All rendering goes through the Code Mode runtime for determinism.
 */
export declare function renderNoiseViaCodeMode(options: NoiseRenderOptions): Promise<NoiseRenderResult>;
/**
 * Compile noise params to a Code Mode system
 * This produces a reproducible system definition
 */
export declare function compileNoiseSystem(params: NoiseParams): {
    sketchCode: string;
    snapshot: NoiseSnapshot;
    seed: number;
};
/**
 * Check if noise can be rendered via Code Mode
 * (Always true - no legacy fallback)
 */
export declare function canRenderNoiseViaCodeMode(): boolean;
//# sourceMappingURL=noise-engine.d.ts.map