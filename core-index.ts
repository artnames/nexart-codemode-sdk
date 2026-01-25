/**
 * @nexart/codemode-sdk — Core Exports
 * See version.ts for SDK version (single source of truth)
 * 
 * Canonical execution engine for NexArt Code Mode.
 * This is the single source of truth for Code Mode semantics.
 * 
 * Enforcement: HARD
 */

import { SDK_VERSION as _SDK_VERSION, PROTOCOL_VERSION, PROTOCOL_PHASE } from './version';

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
 * SDK Identity — imported from version.ts (single source of truth)
 */
export const SDK_VERSION = _SDK_VERSION;
export const SDK_NAME = '@nexart/codemode-sdk';
export { PROTOCOL_VERSION, PROTOCOL_PHASE };
