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

import type { Engine, EngineConfig, RunOptions } from './types';
import { DEFAULT_CONFIG } from './types';
import { runStaticMode } from './static-engine';
import { runLoopMode, cancelLoopMode } from './loop-engine';

/**
 * Create a NexArt Code Mode rendering engine.
 * 
 * @param config - Engine configuration
 * @returns Engine instance
 */
export function createEngine(config: EngineConfig): Engine {
  const resolvedConfig: EngineConfig = {
    mode: config.mode,
    width: config.width ?? DEFAULT_CONFIG.width,
    height: config.height ?? DEFAULT_CONFIG.height,
    duration: config.duration ?? DEFAULT_CONFIG.duration,
    fps: config.fps ?? DEFAULT_CONFIG.fps,
  };

  let isRunning = false;

  const run = async (options: RunOptions): Promise<void> => {
    if (isRunning) {
      throw new Error('Engine is already running. Call stop() first.');
    }

    isRunning = true;

    try {
      if (resolvedConfig.mode === 'static') {
        await runStaticMode(resolvedConfig, options);
      } else if (resolvedConfig.mode === 'loop') {
        await runLoopMode(resolvedConfig, options);
      } else {
        throw new Error(`Unknown mode: ${resolvedConfig.mode}`);
      }
    } finally {
      isRunning = false;
    }
  };

  const stop = (): void => {
    if (resolvedConfig.mode === 'loop') {
      cancelLoopMode();
    }
    isRunning = false;
  };

  const getConfig = (): Readonly<EngineConfig> => {
    return { ...resolvedConfig };
  };

  return {
    run,
    stop,
    getConfig,
  };
}

// Re-export types
export type { Engine, EngineConfig, RunOptions, RenderResult, ProgressInfo } from './types';
export { DEFAULT_CONFIG } from './types';
