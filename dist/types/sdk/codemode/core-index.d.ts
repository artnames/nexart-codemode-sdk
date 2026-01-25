/**
 * @nexart/codemode-sdk — Core Exports
 * See version.ts for SDK version (single source of truth)
 *
 * Canonical execution engine for NexArt Code Mode.
 * This is the single source of truth for Code Mode semantics.
 *
 * Enforcement: HARD
 */
import { PROTOCOL_VERSION, PROTOCOL_PHASE } from './version';
export { executeCodeMode, validateCodeModeSource, } from './execute';
export { type RenderMode, type TimeVariables, type ProtocolMetadata, type EngineConfig, type RenderResult, type RunOptions, type ProgressInfo, type Engine, type ExecuteCodeModeInput, type ExecuteCodeModeResult, PROTOCOL_IDENTITY, DEFAULT_VARS, DEFAULT_CONFIG, } from './types';
export { createP5Runtime, injectTimeVariables, createProtocolVAR, VAR_COUNT, VAR_MIN, VAR_MAX, CODE_MODE_PROTOCOL_VERSION, CODE_MODE_PROTOCOL_PHASE, CODE_MODE_ENFORCEMENT, type P5Runtime, type P5RuntimeConfig, } from './p5-runtime';
export { runStaticMode, } from './static-engine';
export { runLoopMode, cancelLoopMode, } from './loop-engine';
export { createEngine, } from './engine';
/**
 * SDK Identity — imported from version.ts (single source of truth)
 */
export declare const SDK_VERSION = "1.8.4";
export declare const SDK_NAME = "@nexart/codemode-sdk";
export { PROTOCOL_VERSION, PROTOCOL_PHASE };
//# sourceMappingURL=core-index.d.ts.map