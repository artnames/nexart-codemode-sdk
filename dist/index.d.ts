/**
 * NexArt Code Mode Runtime SDK
 * Version: 1.1.0 (Protocol v1.0.0)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  @nexart/codemode-sdk — Canonical Code Mode Authority                    ║
 * ║                                                                          ║
 * ║  This SDK defines the official Code Mode execution surface.              ║
 * ║  All implementations (NexArt, ByX, external) MUST use this SDK.          ║
 * ║                                                                          ║
 * ║  Protocol: nexart                                                        ║
 * ║  Engine: codemode                                                        ║
 * ║  SDK Version: 1.1.0                                                      ║
 * ║  Protocol Version: 1.0.0                                                 ║
 * ║  Phase: 1                                                                ║
 * ║  Enforcement: HARD                                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * @example
 * ```typescript
 * import { executeCodeMode } from '@nexart/codemode-sdk';
 *
 * const result = await executeCodeMode({
 *   source: `function setup() { background(255); ellipse(width/2, height/2, 100); }`,
 *   width: 1950,
 *   height: 2400,
 *   seed: 12345,
 *   vars: [50, 0, 0, 0, 0, 0, 0, 0, 0, 0],
 *   mode: 'static'
 * });
 *
 * console.log(result.metadata.protocolVersion); // '1.0.0'
 * ```
 */
export { executeCodeMode, validateCodeModeSource } from './execute';
export type { ExecuteCodeModeInput, ExecuteCodeModeResult, ProtocolMetadata, } from './types';
export { PROTOCOL_IDENTITY } from './types';
export { createEngine } from './engine';
export type { Engine, EngineConfig, RunOptions, RenderResult, ProgressInfo, RenderMode, TimeVariables, } from './types';
export { DEFAULT_CONFIG } from './types';
export { renderSoundArtViaCodeMode, canRenderViaCodeMode, getCodeModeAvailableStyles, type SoundArtEngineConfig, type SoundArtRenderOptions, type SoundArtRenderResult, type SoundArtMetadata, } from './soundart-engine';
export { type SoundSnapshot, type SoundFeatures, createSoundSnapshot, createEmptySoundSnapshot, freezeSoundSnapshot, } from '../../shared/soundSnapshot';
export { injectSoundGlobals, createSoundGlobals, createEmptySoundGlobals, generateSoundPalette, inferGenreProfile, createSoundHelpers, type SoundGlobals, type GenreProfile, } from './sound-bridge';
export { getSoundArtSketch, getAvailableSoundArtSketches, isSoundArtSketchAvailable, type SoundArtSketchName, } from './soundart-sketches';
export { createP5Runtime, type P5Runtime, type P5RuntimeConfig } from './p5-runtime';
export { renderNoiseViaCodeMode, compileNoiseSystem, canRenderNoiseViaCodeMode, type NoiseEngineConfig, type NoiseRenderOptions, type NoiseRenderResult, type NoiseMetadata, } from './noise-engine';
export { type NoiseSnapshot, type NoiseParams, type NoiseBlendMode, createNoiseSnapshot, validateNoiseSnapshot, } from '../../shared/noiseSnapshot';
export { createNoiseGlobals, injectNoiseGlobals, type NoiseGlobals, } from './noise-bridge';
export { getNoiseSketch, getAvailableNoiseSketchNames, isValidNoiseSketch, type NoiseSketchName, } from './noise-sketches';
//# sourceMappingURL=index.d.ts.map