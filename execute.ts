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

import { runStaticMode } from './static-engine';
import { runLoopMode } from './loop-engine';
import {
  ExecuteCodeModeInput,
  ExecuteCodeModeResult,
  ProtocolMetadata,
  PROTOCOL_IDENTITY,
  DEFAULT_CONFIG,
  RenderResult,
  NexArtBuilderManifest,
} from './types';
import { getBuilderManifest } from './builder-manifest';

/**
 * Internal execution context for builder attribution.
 * This is NOT exposed to sketch code and does NOT affect output.
 * Used for future attribution and ecosystem discovery.
 */
interface ExecutionContext {
  builderManifest: NexArtBuilderManifest | null;
}

/**
 * Validate and normalize VAR array to 10 elements.
 * 
 * Rules (SDK v1.0.2, Protocol v1.0.0):
 * - VAR is OPTIONAL: omit or pass [] for empty (defaults to all zeros)
 * - VAR input length MUST be 0-10 elements (protocol error if > 10)
 * - VAR values MUST be finite numbers (protocol error if not)
 * - VAR values MUST be in range 0-100 (protocol error if out of range, NO clamping)
 * - VAR is read-only inside sketches
 * - Output is ALWAYS 10 elements (padded with zeros) for protocol consistency
 */
function normalizeVars(vars?: number[]): number[] {
  if (!vars || !Array.isArray(vars)) {
    console.log('[CodeMode] No vars provided, using defaults [0,0,0,0,0,0,0,0,0,0]');
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  
  if (vars.length > 10) {
    throw new Error(`[Code Mode Protocol Error] VAR array must have at most 10 elements, got ${vars.length}`);
  }
  
  const result: number[] = [];
  for (let i = 0; i < vars.length; i++) {
    const v = vars[i];
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new Error(`[Code Mode Protocol Error] VAR[${i}] must be a finite number, got ${typeof v === 'number' ? v : typeof v}`);
    }
    if (v < 0 || v > 100) {
      throw new Error(`[Code Mode Protocol Error] VAR[${i}] = ${v} is out of range. Values must be 0-100.`);
    }
    result.push(v);
  }
  
  // Pad with zeros to always have 10 elements for protocol consistency
  while (result.length < 10) {
    result.push(0);
  }
  
  return result;
}

/**
 * Validate execution input
 */
function validateInput(input: ExecuteCodeModeInput): void {
  if (!input.source || typeof input.source !== 'string') {
    throw new Error('[Code Mode Protocol Error] source is required and must be a string');
  }
  
  if (typeof input.width !== 'number' || input.width <= 0) {
    throw new Error('[Code Mode Protocol Error] width must be a positive number');
  }
  
  if (typeof input.height !== 'number' || input.height <= 0) {
    throw new Error('[Code Mode Protocol Error] height must be a positive number');
  }
  
  if (typeof input.seed !== 'number') {
    throw new Error('[Code Mode Protocol Error] seed is required and must be a number');
  }
  
  if (input.mode !== 'static' && input.mode !== 'loop') {
    throw new Error('[Code Mode Protocol Error] mode must be "static" or "loop"');
  }
  
  if (input.mode === 'loop') {
    if (typeof input.totalFrames !== 'number' || input.totalFrames <= 0) {
      throw new Error('[Code Mode Protocol Error] totalFrames is required for loop mode and must be a positive number');
    }
  }
  
  // Validate forbidden patterns per CODE_MODE_PROTOCOL.md
  const forbiddenPatterns = [
    // Async timing (breaks determinism)
    { pattern: /setTimeout\s*\(/, name: 'setTimeout' },
    { pattern: /setInterval\s*\(/, name: 'setInterval' },
    { pattern: /requestAnimationFrame\s*\(/, name: 'requestAnimationFrame' },
    // Time-based entropy (breaks determinism)
    { pattern: /Date\.now\s*\(/, name: 'Date.now() — use time variable instead' },
    { pattern: /new\s+Date\s*\(/, name: 'new Date() — use time variable instead' },
    // Unseeded random (use random() instead)
    { pattern: /Math\.random\s*\(/, name: 'Math.random() — use random() instead (seeded)' },
    // External IO (breaks determinism)
    { pattern: /fetch\s*\(/, name: 'fetch() — external IO forbidden' },
    { pattern: /XMLHttpRequest/, name: 'XMLHttpRequest — external IO forbidden' },
    // Canvas is pre-initialized
    { pattern: /createCanvas\s*\(/, name: 'createCanvas() — canvas is pre-initialized' },
    // DOM manipulation forbidden
    { pattern: /document\./, name: 'DOM access — document.* forbidden' },
    { pattern: /window\./, name: 'DOM access — window.* forbidden' },
    // External imports forbidden
    { pattern: /\bimport\s+/, name: 'import — external imports forbidden' },
    { pattern: /\brequire\s*\(/, name: 'require() — external imports forbidden' },
  ];
  
  for (const { pattern, name } of forbiddenPatterns) {
    if (pattern.test(input.source)) {
      throw new Error(`[Code Mode Protocol Error] Forbidden pattern: ${name}`);
    }
  }
  
  // Loop mode specific validation
  if (input.mode === 'loop') {
    if (!/function\s+draw\s*\(\s*\)/.test(input.source)) {
      throw new Error('[Code Mode Protocol Error] Loop mode requires a draw() function');
    }
    if (/noLoop\s*\(\s*\)/.test(input.source)) {
      throw new Error('[Code Mode Protocol Error] noLoop() is forbidden in Loop mode');
    }
  }
}

/**
 * Create protocol metadata for the execution result
 */
function createMetadata(input: ExecuteCodeModeInput, vars: number[]): ProtocolMetadata {
  return {
    ...PROTOCOL_IDENTITY,
    seed: input.seed,
    vars,
    width: input.width,
    height: input.height,
    mode: input.mode,
    ...(input.mode === 'loop' && input.totalFrames ? { totalFrames: input.totalFrames } : {}),
  };
}

/**
 * Execute Code Mode in Static mode - delegates to static-engine.ts
 */
async function executeStatic(
  input: ExecuteCodeModeInput,
  vars: number[]
): Promise<ExecuteCodeModeResult> {
  console.log('[CodeMode] Rendered via @nexart/codemode-sdk (Protocol v1.2.0)');
  console.log('[CodeMode] Execution: Static mode — delegating to static-engine');
  
  return new Promise((resolve, reject) => {
    runStaticMode(
      {
        mode: 'static',
        width: input.width,
        height: input.height,
      },
      {
        code: input.source,
        seed: input.seed,
        vars: vars,
        onComplete: (result: RenderResult) => {
          resolve({
            image: 'blob' in result ? result.blob : undefined,
            frames: 'imageData' in result ? [result.imageData] : undefined,
            metadata: createMetadata(input, vars),
          });
        },
        onError: (error: Error) => {
          reject(error);
        },
      }
    );
  });
}

/**
 * Execute Code Mode in Loop mode - delegates to loop-engine.ts
 */
async function executeLoop(
  input: ExecuteCodeModeInput,
  vars: number[]
): Promise<ExecuteCodeModeResult> {
  console.log('[CodeMode] Rendered via @nexart/codemode-sdk (Protocol v1.2.0)');
  console.log(`[CodeMode] Execution: Loop mode — delegating to loop-engine (${input.totalFrames} frames)`);
  
  const fps = DEFAULT_CONFIG.fps;
  const duration = (input.totalFrames || 60) / fps;
  
  return new Promise((resolve, reject) => {
    runLoopMode(
      {
        mode: 'loop',
        width: input.width,
        height: input.height,
        duration: duration,
        fps: fps,
      },
      {
        code: input.source,
        seed: input.seed,
        vars: vars,
        onComplete: (result: RenderResult) => {
          resolve({
            video: 'blob' in result && result.type === 'video' ? result.blob : undefined,
            metadata: createMetadata(input, vars),
          });
        },
        onError: (error: Error) => {
          reject(error);
        },
      }
    );
  });
}

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
export async function executeCodeMode(
  input: ExecuteCodeModeInput
): Promise<ExecuteCodeModeResult> {
  // Validate input
  validateInput(input);
  
  // Normalize VAR values
  const vars = normalizeVars(input.vars);
  
  // ╔═══════════════════════════════════════════════════════════════════════╗
  // ║  BUILDER MANIFEST CONTEXT (v1.6.0)                                    ║
  // ║                                                                       ║
  // ║  Internal context for builder attribution.                            ║
  // ║  This is NOT exposed to sketch code, NOT serialized, NOT logged.      ║
  // ║  Does NOT affect execution behavior or determinism.                   ║
  // ╚═══════════════════════════════════════════════════════════════════════╝
  const _executionContext: ExecutionContext = {
    builderManifest: getBuilderManifest(),
  };
  // Note: _executionContext is intentionally unused.
  // It prepares the SDK for future attribution without activating anything.
  void _executionContext;
  
  // Log protocol execution
  console.log('[CodeMode] ════════════════════════════════════════════════');
  console.log('[CodeMode] Protocol v1.2.0 — Phase 3 — HARD Enforcement');
  console.log(`[CodeMode] Mode: ${input.mode}`);
  console.log(`[CodeMode] Seed: ${input.seed}`);
  console.log(`[CodeMode] VAR: [${vars.join(', ')}]`);
  console.log('[CodeMode] ════════════════════════════════════════════════');
  
  // Execute based on mode
  if (input.mode === 'static') {
    return executeStatic(input, vars);
  } else {
    return executeLoop(input, vars);
  }
}

/**
 * Validate code without executing
 */
export function validateCodeModeSource(source: string, mode: 'static' | 'loop'): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Same forbidden patterns as validateInput per CODE_MODE_PROTOCOL.md
  const forbiddenPatterns = [
    { pattern: /setTimeout\s*\(/, name: 'setTimeout' },
    { pattern: /setInterval\s*\(/, name: 'setInterval' },
    { pattern: /requestAnimationFrame\s*\(/, name: 'requestAnimationFrame' },
    { pattern: /Date\.now\s*\(/, name: 'Date.now() — use time variable instead' },
    { pattern: /new\s+Date\s*\(/, name: 'new Date() — use time variable instead' },
    { pattern: /Math\.random\s*\(/, name: 'Math.random() — use random() instead (seeded)' },
    { pattern: /fetch\s*\(/, name: 'fetch() — external IO forbidden' },
    { pattern: /XMLHttpRequest/, name: 'XMLHttpRequest — external IO forbidden' },
    { pattern: /createCanvas\s*\(/, name: 'createCanvas() — canvas is pre-initialized' },
    { pattern: /document\./, name: 'DOM access — document.* forbidden' },
    { pattern: /window\./, name: 'DOM access — window.* forbidden' },
    { pattern: /\bimport\s+/, name: 'import — external imports forbidden' },
    { pattern: /\brequire\s*\(/, name: 'require() — external imports forbidden' },
  ];
  
  for (const { pattern, name } of forbiddenPatterns) {
    if (pattern.test(source)) {
      errors.push(`Forbidden pattern: ${name}`);
    }
  }
  
  if (mode === 'loop') {
    if (!/function\s+draw\s*\(\s*\)/.test(source)) {
      errors.push('Loop mode requires a draw() function');
    }
    if (/noLoop\s*\(\s*\)/.test(source)) {
      errors.push('noLoop() is forbidden in Loop mode');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
