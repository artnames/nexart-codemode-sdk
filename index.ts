/**
 * NexArt Code Mode Runtime SDK - App Integration Layer
 * 
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  LOCAL SDK WRAPPER                                                       ║
 * ║                                                                          ║
 * ║  This file re-exports the core runtime from @nexart/codemode-sdk (npm)   ║
 * ║  and adds app-specific integrations (SoundArt, Noise, etc.)              ║
 * ║                                                                          ║
 * ║  For core Code Mode: import from '@nexart/codemode-sdk'                  ║
 * ║  For app integrations: import from 'sdk/codemode'                        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORE RUNTIME - Re-exported from local core-index (same as npm package)
// Note: We import from ./core-index directly to avoid circular imports
// when package.json main points to this index.ts file
// ═══════════════════════════════════════════════════════════════════════════
export { 
  executeCodeMode, 
  validateCodeModeSource,
  DEFAULT_CONFIG,
  PROTOCOL_IDENTITY,
} from './core-index';

export type {
  ExecuteCodeModeInput,
  ExecuteCodeModeResult,
  ProtocolMetadata,
  RenderResult,
  TimeVariables,
} from './core-index';

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL P5 RUNTIME - Used by app integrations (SoundArt, Noise)
// The npm package also exports createP5Runtime, but we keep local for 
// app-specific extensions that need tighter integration
// ═══════════════════════════════════════════════════════════════════════════
export { createP5Runtime, injectTimeVariables, injectProtocolVariables, createProtocolVAR } from './p5-runtime';
export type { P5Runtime, P5RuntimeConfig } from './p5-runtime';

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY ENGINE API (kept for backwards compatibility)
// ═══════════════════════════════════════════════════════════════════════════
export { createEngine } from './engine';
export type {
  Engine,
  EngineConfig,
  RunOptions,
  ProgressInfo,
  RenderMode,
} from './types';
export { DEFAULT_CONFIG as LOCAL_DEFAULT_CONFIG } from './types';

// SoundArt → Code Mode integration
export { 
  renderSoundArtViaCodeMode,
  canRenderViaCodeMode,
  getCodeModeAvailableStyles,
  type SoundArtEngineConfig,
  type SoundArtRenderOptions,
  type SoundArtRenderResult,
  type SoundArtMetadata,
} from './soundart-engine';

export {
  type SoundSnapshot,
  type SoundFeatures,
  createSoundSnapshot,
  createEmptySoundSnapshot,
  freezeSoundSnapshot,
} from '../../shared/soundSnapshot';

export {
  injectSoundGlobals,
  createSoundGlobals,
  createEmptySoundGlobals,
  generateSoundPalette,
  inferGenreProfile,
  createSoundHelpers,
  type SoundGlobals,
  type GenreProfile,
} from './sound-bridge';

export {
  getSoundArtSketch,
  getAvailableSoundArtSketches,
  isSoundArtSketchAvailable,
  type SoundArtSketchName,
} from './soundart-sketches';

// Noise → Code Mode integration
export {
  renderNoiseViaCodeMode,
  compileNoiseSystem,
  canRenderNoiseViaCodeMode,
  type NoiseEngineConfig,
  type NoiseRenderOptions,
  type NoiseRenderResult,
  type NoiseMetadata,
} from './noise-engine';

export {
  type NoiseSnapshot,
  type NoiseParams,
  type NoiseBlendMode,
  createNoiseSnapshot,
  validateNoiseSnapshot,
} from '../../shared/noiseSnapshot';

export {
  createNoiseGlobals,
  injectNoiseGlobals,
  type NoiseGlobals,
} from './noise-bridge';

export {
  getNoiseSketch,
  getAvailableNoiseSketchNames,
  isValidNoiseSketch,
  type NoiseSketchName,
} from './noise-sketches';

// ═══════════════════════════════════════════════════════════════════════════
// BUILDER MANIFEST (v1.6.0) — Passive Attribution
// 
// The Builder Manifest is a declaration of intent, not a capability.
// The SDK does not expose any API to read or inspect manifests.
// 
// This is:
//   - Declarative (write-only)
//   - Optional (no errors if missing)
//   - Non-enforced (no validation)
//   - Non-rewarding (no incentives)
// 
// There is NO SDK API to read manifests, NO validation, NO attribution
// logic, and NO tracking. Execution behavior is identical with or without
// a manifest registered.
// ═══════════════════════════════════════════════════════════════════════════
export { registerBuilderManifest } from './builder-manifest';

export type { NexArtBuilderManifest } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTION BOUNDARY (Internal — Not Exported)
// 
// The execution sandbox blocks all external entropy sources at runtime.
// See EXECUTION_BOUNDARY.md for details.
// ═══════════════════════════════════════════════════════════════════════════
// Note: FORBIDDEN_APIS and createSafeMath are NOT exported.
// They are internal implementation details used by the engines.
