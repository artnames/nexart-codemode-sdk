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
// ═══════════════════════════════════════════════════════════════════════════
// CANONICAL EXECUTION ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════
export { executeCodeMode, validateCodeModeSource } from './execute';
export { PROTOCOL_IDENTITY } from './types';
// ═══════════════════════════════════════════════════════════════════════════
// LEGACY ENGINE API (use executeCodeMode for new implementations)
// ═══════════════════════════════════════════════════════════════════════════
export { createEngine } from './engine';
export { DEFAULT_CONFIG } from './types';
// SoundArt → Code Mode integration
export { renderSoundArtViaCodeMode, canRenderViaCodeMode, getCodeModeAvailableStyles, } from './soundart-engine';
export { createSoundSnapshot, createEmptySoundSnapshot, freezeSoundSnapshot, } from '../../shared/soundSnapshot';
export { injectSoundGlobals, createSoundGlobals, createEmptySoundGlobals, generateSoundPalette, inferGenreProfile, createSoundHelpers, } from './sound-bridge';
export { getSoundArtSketch, getAvailableSoundArtSketches, isSoundArtSketchAvailable, } from './soundart-sketches';
export { createP5Runtime } from './p5-runtime';
// Noise → Code Mode integration
export { renderNoiseViaCodeMode, compileNoiseSystem, canRenderNoiseViaCodeMode, } from './noise-engine';
export { createNoiseSnapshot, validateNoiseSnapshot, } from '../../shared/noiseSnapshot';
export { createNoiseGlobals, injectNoiseGlobals, } from './noise-bridge';
export { getNoiseSketch, getAvailableNoiseSketchNames, isValidNoiseSketch, } from './noise-sketches';
