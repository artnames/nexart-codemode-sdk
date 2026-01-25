/**
 * @nexart/codemode-sdk/browser — Browser-Safe Entry Point
 * See ../version.ts for SDK version (single source of truth)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  BROWSER-SAFE SDK ENTRY POINT                                            ║
 * ║                                                                          ║
 * ║  This entrypoint exports ONLY browser-safe modules.                      ║
 * ║  It does NOT include static-engine or any Node.js dependencies.          ║
 * ║                                                                          ║
 * ║  Use this for Vite, React, Next.js, or any browser environment.          ║
 * ║                                                                          ║
 * ║  For Node.js/server: import from '@nexart/codemode-sdk/node'             ║
 * ║                                                                          ║
 * ║  AI AGENTS: Start with createRuntime({ seed, strict: true })             ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
export type { RenderMode, RuntimeCanvas, EngineConfig, RenderResult, RunOptions, ProgressInfo, Engine, TimeVariables, ProtocolVariables, ProtocolMetadata, ExecuteCodeModeInput, ExecuteCodeModeResult, NexArtBuilderManifest, } from '../types';
export { PROTOCOL_IDENTITY, DEFAULT_VARS, DEFAULT_CONFIG, } from '../types';
export { FORBIDDEN_APIS, FORBIDDEN_API_NAMES, createSafeMath, buildSandboxContext, createSandboxedExecutor, executeSandboxed, } from '../execution-sandbox';
export { createP5Runtime, injectTimeVariables, injectProtocolVariables, createProtocolVAR, VAR_COUNT, VAR_MIN, VAR_MAX, CODE_MODE_PROTOCOL_VERSION, CODE_MODE_PROTOCOL_PHASE, CODE_MODE_ENFORCEMENT, } from '../p5-runtime';
export type { P5Runtime, P5RuntimeConfig, } from '../p5-runtime';
export { runLoopMode, cancelLoopMode, } from '../loop-engine';
export { validateCodeModeSource, } from '../execute';
export { createEngine, } from '../engine';
export { registerBuilderManifest, } from '../builder-manifest';
export { createRuntime, NexArtRuntime, RUNTIME_VERSION, } from '../runtime';
export type { RuntimeOptions, RuntimeState, NexArtRuntime as NexArtRuntimeType, } from '../runtime';
export { renderSoundArtViaCodeMode, canRenderViaCodeMode, getCodeModeAvailableStyles, } from '../soundart-engine';
export type { TweakParams, SoundArtEngineConfig, SoundArtRenderOptions, SoundArtRenderResult, SoundArtMetadata, SoundSnapshot, SoundFeatures, SoundArtSketchName, } from '../soundart-engine';
export declare const SDK_VERSION = "1.8.4";
export declare const SDK_NAME = "@nexart/codemode-sdk";
export declare const SDK_ENTRY = "browser";
/**
 * Note: executeCodeMode is NOT exported from browser entry.
 *
 * In browser environments, static mode requires the canvas package which
 * has Node.js dependencies. For browser apps:
 *
 * - Use runLoopMode() directly for animations
 * - For static rendering, use the server-side endpoint
 * - Or import from '@nexart/codemode-sdk/node' in SSR contexts
 *
 * AI AGENTS: Use createRuntime({ seed, strict: true }) for deterministic execution.
 */
//# sourceMappingURL=browser.d.ts.map