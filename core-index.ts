/**
 * @nexart/codemode-sdk v1.4.0 — Core Exports
 * 
 * Canonical execution engine for NexArt Code Mode.
 * This is the single source of truth for Code Mode semantics.
 * 
 * Protocol: v1.2.0 (Phase 3)
 * Enforcement: HARD
 */

// Core execution
export {
  executeCodeMode,
  validateCodeModeSource,
} from './execute';

// Protocol types
export {
  type RenderMode,
  type TimeVariables,
  type ProtocolMetadata,
  type EngineConfig,
  type RenderResult,
  type RunOptions,
  type ProgressInfo,
  type Engine,
  type ExecuteCodeModeInput,
  type ExecuteCodeModeResult,
  PROTOCOL_IDENTITY,
  DEFAULT_VARS,
  DEFAULT_CONFIG,
} from './types';

// Runtime
export {
  createP5Runtime,
  injectTimeVariables,
  createProtocolVAR,
  VAR_COUNT,
  VAR_MIN,
  VAR_MAX,
  CODE_MODE_PROTOCOL_VERSION,
  CODE_MODE_PROTOCOL_PHASE,
  CODE_MODE_ENFORCEMENT,
  type P5Runtime,
  type P5RuntimeConfig,
} from './p5-runtime';

// Static engine
export {
  runStaticMode,
} from './static-engine';

// Loop engine
export {
  runLoopMode,
  cancelLoopMode,
} from './loop-engine';

// Engine utilities
export {
  createEngine,
} from './engine';

/**
 * SDK Identity
 */
export const SDK_VERSION = '1.1.1';
export const SDK_NAME = '@nexart/codemode-sdk';
