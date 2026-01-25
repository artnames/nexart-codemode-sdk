/**
 * NexArt Code Mode Runtime SDK - Loop Engine
 * Protocol: v1.2.0 (Phase 3) — HARD ENFORCEMENT
 *
 * Loop mode renderer: frame-authoritative, stateless execution.
 * - Executes setup() once
 * - Executes draw() once per frame
 * - Clears canvas before each frame (transparent)
 * - Resets blend mode to NORMAL before each frame
 * - Injects normalized time variables
 * - No canvas persistence between frames
 *
 * Determinism Guarantee:
 * Same code + same seed + same VARs = identical frame sequence
 *
 * Security:
 * All external entropy sources are blocked at runtime via execution sandbox.
 */
import type { EngineConfig, RunOptions } from './types';
export declare function cancelLoopMode(): void;
export declare function runLoopMode(config: EngineConfig, options: RunOptions): Promise<void>;
//# sourceMappingURL=loop-engine.d.ts.map