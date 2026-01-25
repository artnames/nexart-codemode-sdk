/**
 * NexArt Code Mode SDK - Agent-First Runtime Authority Layer
 * See version.ts for SDK version (single source of truth)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT-FIRST RUNTIME — DETERMINISTIC EXECUTION AUTHORITY                 ║
 * ║                                                                          ║
 * ║  This module provides a high-level runtime API designed for AI agents    ║
 * ║  (Replit, Lovable, Claude Code) to reliably execute deterministic code.  ║
 * ║                                                                          ║
 * ║  Key Features:                                                           ║
 * ║  - Deterministic PRNG: runtime.random() (seeded Mulberry32)              ║
 * ║  - Deterministic noise: runtime.noise(x, y?, z?) (seeded Perlin)         ║
 * ║  - Strict mode: Throws on Math.random, Date.now, performance.now         ║
 * ║  - Digest: Stable hash for verification and replay                       ║
 * ║  - State snapshot: Canonical state for bundles                           ║
 * ║                                                                          ║
 * ║  BROWSER-SAFE: No Node.js dependencies. Works in Vite/Next/React.        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
export declare const RUNTIME_VERSION = "1.8.4";
export interface RuntimeOptions {
    seed: string | number;
    vars?: number[];
    strict?: boolean;
    mode?: 'static' | 'loop';
    metadata?: Record<string, unknown>;
}
export interface RuntimeState {
    sdkVersion: string;
    seed: number;
    vars: number[];
    mode: 'static' | 'loop';
    metadata?: Record<string, unknown>;
}
export interface NexArtRuntime {
    random(): number;
    randomInt(min: number, max: number): number;
    randomRange(min: number, max: number): number;
    noise(x: number, y?: number, z?: number): number;
    run<T>(fn: () => T): T;
    digest(): string;
    getState(): RuntimeState;
    getSeed(): number;
    readonly strict: boolean;
}
export declare function createRuntime(options: RuntimeOptions): NexArtRuntime;
export declare const NexArtRuntime: {
    create: typeof createRuntime;
    VERSION: string;
};
//# sourceMappingURL=runtime.d.ts.map