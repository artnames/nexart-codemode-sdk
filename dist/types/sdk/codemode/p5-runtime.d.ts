/**
 * NexArt Code Mode Runtime SDK - p5-like Runtime
 * See version.ts for SDK/Protocol version (single source of truth)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CODE MODE PROTOCOL — STABLE (see version.ts for version)                 ║
 * ║                                                                          ║
 * ║  Status: HARD PROTOCOL ENFORCEMENT                                       ║
 * ║  This is the stable, canonical execution surface.                        ║
 * ║  SDKs, ByX, and external builders can depend on this API.                ║
 * ║                                                                          ║
 * ║  Phase 1 Surface:                                                        ║
 * ║  - VAR[0..9]: 10 read-only protocol variables (0-100 range)              ║
 * ║  - Drawing: line, rect, ellipse, circle, triangle, quad, arc, etc.       ║
 * ║  - Style: fill, stroke, colorMode, strokeWeight                          ║
 * ║  - Transform: push, pop, translate, rotate, scale                        ║
 * ║  - Random: random(), randomSeed(), randomGaussian() (seeded)             ║
 * ║  - Noise: noise(), noiseSeed(), noiseDetail() (seeded)                   ║
 * ║  - Math: map, constrain, lerp, lerpColor, dist, mag, norm                ║
 * ║  - Color: Full CSS format support, color extraction functions            ║
 * ║  - Time: frameCount, t, time, tGlobal                                    ║
 * ║                                                                          ║
 * ║  Determinism Guarantees:                                                 ║
 * ║  - Same code + same seed + same VARs = identical output                  ║
 * ║  - No external state, no browser entropy, no time-based drift            ║
 * ║  - Randomness ONLY from: random(), noise() (both seeded)                 ║
 * ║                                                                          ║
 * ║  ⚠️  Future changes require Phase 2+                                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
import type { TimeVariables } from './types';
/**
 * Code Mode Protocol Version
 * Imports from version.ts (single source of truth).
 * Changes to the execution surface require a version bump.
 */
export declare const CODE_MODE_PROTOCOL_VERSION = "1.2.0";
export declare const CODE_MODE_PROTOCOL_PHASE = 3;
export declare const CODE_MODE_ENFORCEMENT: "HARD";
export interface P5Runtime {
    [key: string]: any;
    width: number;
    height: number;
    frameCount: number;
    PI: number;
    TWO_PI: number;
    HALF_PI: number;
    QUARTER_PI: number;
}
export interface P5RuntimeConfig {
    seed?: number;
}
type RuntimeCanvas = HTMLCanvasElement;
export declare function createP5Runtime(canvas: RuntimeCanvas, width: number, height: number, config?: P5RuntimeConfig): P5Runtime;
export declare function injectTimeVariables(p: P5Runtime, time: TimeVariables): void;
/**
 * VAR Protocol Constants (Phase 1 — Protocol v1.0.0)
 * SDK v1.0.2: VAR input is optional (0-10 elements), but runtime always has 10
 */
export declare const VAR_COUNT = 10;
export declare const VAR_MIN = 0;
export declare const VAR_MAX = 100;
/**
 * Create a protected, read-only VAR array for protocol execution.
 *
 * SDK v1.0.2 Rules (Protocol v1.0.0):
 * - Input accepts 0-10 elements
 * - Runtime VAR is ALWAYS 10 elements (padded with zeros)
 * - Values are numeric, must be in 0-100 range (validated upstream)
 * - Read-only: writes throw descriptive errors
 * - Available in both setup() and draw()
 */
export declare function createProtocolVAR(vars?: number[]): readonly number[];
export declare function injectProtocolVariables(p: P5Runtime, vars?: number[]): void;
export {};
//# sourceMappingURL=p5-runtime.d.ts.map