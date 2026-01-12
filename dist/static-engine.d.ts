/**
 * NexArt Code Mode Runtime SDK - Static Engine
 * Protocol: v1.2.0 (Phase 3) — HARD ENFORCEMENT
 *
 * Static mode renderer: executes setup() only, captures single PNG.
 * Does NOT execute draw() - per NexArt Execution Specification v1.
 *
 * Determinism Guarantee:
 * Same code + same seed + same VARs = identical PNG output
 *
 * Security:
 * All external entropy sources are blocked at runtime via execution sandbox.
 *
 * Oracle Support:
 * When returnImageData is true, returns raw ImageData for determinism hashing.
 * Works in both browser (HTMLCanvasElement) and Node (canvas package) environments.
 */
import type { EngineConfig, RunOptions } from './types';
export declare function runStaticMode(config: EngineConfig, options: RunOptions): Promise<void>;
//# sourceMappingURL=static-engine.d.ts.map