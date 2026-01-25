/**
 * NexArt Code Mode SDK - Execution Sandbox
 * Version: 1.6.0 (Protocol v1.2.0)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  EXECUTION BOUNDARY — HARD ENFORCEMENT                                   ║
 * ║                                                                          ║
 * ║  This module enforces determinism by blocking all external entropy       ║
 * ║  sources at RUNTIME, not just via static pattern scanning.               ║
 * ║                                                                          ║
 * ║  Blocked APIs (throw [Code Mode Protocol Error]):                        ║
 * ║  - Date, Date.now, Date.parse, new Date()                                ║
 * ║  - performance, performance.now                                          ║
 * ║  - process (Node.js)                                                     ║
 * ║  - navigator                                                             ║
 * ║  - globalThis                                                            ║
 * ║  - crypto.getRandomValues                                                ║
 * ║  - Math.random (use seeded random() instead)                             ║
 * ║  - setTimeout, setInterval, requestAnimationFrame                        ║
 * ║  - fetch, XMLHttpRequest                                                 ║
 * ║  - document, window                                                      ║
 * ║  - import, require                                                       ║
 * ║                                                                          ║
 * ║  All blocked symbols throw immediately on access — no silent undefined.  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
/**
 * Forbidden APIs - these are injected into the execution scope to override globals
 */
export declare const FORBIDDEN_APIS: {
    readonly Date: (...args: any[]) => never;
    readonly performance: object;
    readonly process: object;
    readonly navigator: object;
    readonly globalThis: object;
    readonly crypto: object;
    readonly setTimeout: (...args: any[]) => never;
    readonly setInterval: (...args: any[]) => never;
    readonly clearTimeout: (...args: any[]) => never;
    readonly clearInterval: (...args: any[]) => never;
    readonly requestAnimationFrame: (...args: any[]) => never;
    readonly cancelAnimationFrame: (...args: any[]) => never;
    readonly fetch: (...args: any[]) => never;
    readonly XMLHttpRequest: (...args: any[]) => never;
    readonly WebSocket: (...args: any[]) => never;
    readonly document: object;
    readonly window: object;
    readonly self: object;
    readonly top: object;
    readonly parent: object;
    readonly frames: object;
    readonly location: object;
    readonly history: object;
    readonly localStorage: object;
    readonly sessionStorage: object;
    readonly indexedDB: object;
    readonly caches: object;
    readonly Notification: (...args: any[]) => never;
    readonly Worker: (...args: any[]) => never;
    readonly SharedWorker: (...args: any[]) => never;
    readonly ServiceWorker: object;
    readonly Blob: (...args: any[]) => never;
    readonly File: (...args: any[]) => never;
    readonly FileReader: (...args: any[]) => never;
    readonly URL: (...args: any[]) => never;
    readonly URLSearchParams: (...args: any[]) => never;
    readonly Headers: (...args: any[]) => never;
    readonly Request: (...args: any[]) => never;
    readonly Response: (...args: any[]) => never;
    readonly EventSource: (...args: any[]) => never;
    readonly Image: (...args: any[]) => never;
    readonly Audio: (...args: any[]) => never;
    readonly Video: (...args: any[]) => never;
    readonly eval: (...args: any[]) => never;
    readonly Function: (...args: any[]) => never;
};
/**
 * Create a safe Math object with random() blocked
 */
export declare function createSafeMath(): typeof Math;
/**
 * List of all forbidden API names for documentation
 */
export declare const FORBIDDEN_API_NAMES: string[];
/**
 * Build the complete sandbox context for sketch execution.
 * This includes the p5 runtime plus all forbidden API stubs.
 */
export declare function buildSandboxContext(p5Runtime: Record<string, any>): Record<string, any>;
/**
 * Create a sandboxed function that executes user code with blocked globals.
 *
 * The function is constructed with:
 * 1. All forbidden APIs as explicit parameters (override globals)
 * 2. The p5 runtime as explicit parameters
 * 3. A `with(context)` wrapper for additional safety
 */
export declare function createSandboxedExecutor(code: string, additionalParams?: string[]): Function;
/**
 * Execute user code in a sandboxed environment.
 *
 * @param code - The user sketch code to execute
 * @param p5Runtime - The p5-like runtime object
 * @param additionalContext - Additional context variables (frameCount, t, etc.)
 */
export declare function executeSandboxed(code: string, p5Runtime: Record<string, any>, additionalContext?: Record<string, any>): void;
//# sourceMappingURL=execution-sandbox.d.ts.map