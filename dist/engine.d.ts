/**
 * NexArt Code Mode Runtime SDK
 * Version: 0.1.0
 *
 * Main entry point for the Code Mode runtime engine.
 *
 * Usage:
 *   const engine = createEngine({ mode: 'static' });
 *   engine.run({
 *     code: 'function setup() { background(255); ellipse(width/2, height/2, 100); }',
 *     onComplete: (result) => console.log(result.blob)
 *   });
 */
import type { Engine, EngineConfig } from './types';
/**
 * Create a NexArt Code Mode rendering engine.
 *
 * @param config - Engine configuration
 * @returns Engine instance
 */
export declare function createEngine(config: EngineConfig): Engine;
export type { Engine, EngineConfig, RunOptions, RenderResult, ProgressInfo } from './types';
export { DEFAULT_CONFIG } from './types';
//# sourceMappingURL=engine.d.ts.map