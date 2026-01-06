/**
 * NexArt Code Mode Runtime SDK
 * Version: 1.5.0 (Protocol v1.2.0)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  @nexart/codemode-sdk — Canonical Code Mode Authority                    ║
 * ║                                                                          ║
 * ║  This SDK defines the official Code Mode execution surface.              ║
 * ║  All implementations (NexArt, ByX, external) MUST use this SDK.          ║
 * ║                                                                          ║
 * ║  Protocol: nexart                                                        ║
 * ║  Engine: codemode                                                        ║
 * ║  SDK Version: 1.5.0                                                      ║
 * ║  Protocol Version: 1.2.0                                                 ║
 * ║  Phase: 3                                                                ║
 * ║  Enforcement: HARD                                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * @example
 * ```typescript
 * import { executeCodeMode } from '@nexart/codemode-sdk';
 *
 * const result = await executeCodeMode({
 *   source: `
 *     function setup() {
 *       background(255);
 *       fill(0);
 *       ellipse(width/2, height/2, 100);
 *     }
 *   `,
 *   mode: 'static',
 *   width: 1950,
 *   height: 2400,
 *   seed: 12345,
 *   vars: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
 * });
 * console.log('Rendered:', result.blob.size, 'bytes');
 * ```
 */
export { executeCodeMode, validateCodeModeSource } from './engine';
export type { ExecuteCodeModeInput, ExecuteCodeModeResult, ProtocolMetadata, RenderResult, TimeVariables, } from './types';
export { DEFAULT_CONFIG, PROTOCOL_IDENTITY } from './types';
//# sourceMappingURL=index.d.ts.map