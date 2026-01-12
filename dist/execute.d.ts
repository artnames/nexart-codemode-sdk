/**
 * NexArt Code Mode Runtime SDK - Canonical Execution Entry Point
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CODE MODE PROTOCOL v1.2.0 (Phase 3) — CANONICAL ENTRY POINT             ║
 * ║                                                                          ║
 * ║  This is the ONLY official way to execute Code Mode.                     ║
 * ║  All implementations (NexArt, ByX, external) MUST use this function.     ║
 * ║                                                                          ║
 * ║  Authority: @nexart/codemode-sdk                                         ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
import { ExecuteCodeModeInput, ExecuteCodeModeResult } from './types';
/**
 * executeCodeMode — Canonical Code Mode Execution Entry Point
 *
 * This is the ONLY official way to execute Code Mode.
 * All implementations MUST use this function.
 *
 * @param input - Execution parameters
 * @returns Promise<ExecuteCodeModeResult> - Execution result with protocol metadata
 *
 * @example
 * ```typescript
 * const result = await executeCodeMode({
 *   source: `function setup() { background(255); ellipse(width/2, height/2, 100); }`,
 *   width: 1950,
 *   height: 2400,
 *   seed: 12345,
 *   vars: [50, 75, 0, 0, 0, 0, 0, 0, 0, 0],
 *   mode: 'static'
 * });
 *
 * console.log(result.metadata.protocolVersion); // '1.2.0'
 * console.log(result.image); // PNG Blob
 * ```
 */
export declare function executeCodeMode(input: ExecuteCodeModeInput): Promise<ExecuteCodeModeResult>;
/**
 * Validate code without executing
 */
export declare function validateCodeModeSource(source: string, mode: 'static' | 'loop'): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=execute.d.ts.map