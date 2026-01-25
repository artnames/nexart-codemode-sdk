/**
 * Shapes → Code Mode Engine
 * 
 * Orchestrator for rendering Shapes through the Code Mode runtime.
 * This follows the same system → runtime pattern as SoundArt and Noise.
 * 
 * Architecture:
 *   1. ShapesSystem (strokes + seed) → expandSystemToSnapshot
 *   2. ShapesSnapshot injected as H.* frozen globals
 *   3. Shapes sketch executed via Code Mode runtime
 *   4. Result: PNG output
 * 
 * Protocol Enforcement: HARD (no legacy fallback)
 */

import type { ShapesSystem, ShapesSnapshot } from '../../shared/shapesSnapshot';
import { expandSystemToSnapshot } from '../../shared/shapesSnapshot';
import { createP5Runtime, type P5RuntimeConfig } from './p5-runtime';
import { injectShapesGlobals, getShapesSketchCode } from './shapes-bridge';

export interface ShapesEngineConfig {
  width: number;
  height: number;
}

export interface ShapesRenderOptions {
  system: ShapesSystem;
  canvas: HTMLCanvasElement;
  config: ShapesEngineConfig;
  onProgress?: (progress: number) => void;
}

export interface ShapesRenderResult {
  mode: 'shapes';
  snapshot: ShapesSnapshot;
  metadata: ShapesMetadata;
}

export interface ShapesMetadata {
  mode: 'Shapes';
  timestamp: string;
  enforcement: 'hard';
  renderedVia: 'codemode';
  shapeCount: number;
  strokeCount: number;
  backgroundColor: string;
  generationParams: {
    seed: number;
    canvasSize: { width: number; height: number };
  };
}

/**
 * Render shapes via Code Mode
 * This is the main entry point for the Shapes → Code Mode pipeline.
 */
export async function renderShapesViaCodeMode(
  options: ShapesRenderOptions
): Promise<ShapesRenderResult> {
  const { system, canvas, config, onProgress } = options;
  
  console.log('[Shapes] Protocol enforcement: HARD | renderedVia: codemode');
  
  onProgress?.(0.1);
  
  // 1. Expand system to snapshot (all shape generation happens here)
  const snapshot = expandSystemToSnapshot(system, config.width, config.height);
  
  console.log('[Shapes] System expanded:', {
    strokes: system.strokes.length,
    expandedShapes: snapshot.shapes.length,
    seed: system.seed,
  });
  
  onProgress?.(0.2);
  
  // 2. Get the shapes sketch code
  const sketchCode = getShapesSketchCode();
  
  onProgress?.(0.3);
  
  // 3. Set canvas dimensions
  canvas.width = config.width;
  canvas.height = config.height;
  
  // 4. Create P5 runtime with seeded RNG
  const runtimeConfig: P5RuntimeConfig = {
    seed: system.seed,
  };
  
  const baseRuntime = createP5Runtime(canvas, config.width, config.height, runtimeConfig);
  
  onProgress?.(0.4);
  
  // 5. Inject shapes globals (H.*)
  const runtime = injectShapesGlobals(baseRuntime, snapshot);
  
  onProgress?.(0.5);
  
  // 6. Build globals with all runtime functions
  const globals = {
    ...runtime,
    width: config.width,
    height: config.height,
    CLOSE: 'close',
  };
  
  onProgress?.(0.6);
  
  // 7. Execute the sketch
  try {
    executeShapesSketch(sketchCode, globals);
    onProgress?.(0.9);
    
    console.log('[Shapes] Rendered via Code Mode runtime');
  } catch (error: any) {
    console.error('[Shapes] Code Mode execution failed:', error?.message || error?.toString() || error);
    throw error;
  }
  
  // 8. Build metadata
  const metadata: ShapesMetadata = {
    mode: 'Shapes',
    timestamp: new Date().toISOString(),
    enforcement: 'hard',
    renderedVia: 'codemode',
    shapeCount: snapshot.shapes.length,
    strokeCount: system.strokes.length,
    backgroundColor: system.backgroundColor,
    generationParams: {
      seed: system.seed,
      canvasSize: { width: config.width, height: config.height },
    },
  };
  
  onProgress?.(1.0);
  
  return {
    mode: 'shapes',
    snapshot,
    metadata,
  };
}

/**
 * Execute a shapes sketch string in the context of the runtime globals
 */
function executeShapesSketch(code: string, globals: Record<string, any>): void {
  const globalNames = Object.keys(globals);
  const globalValues = Object.values(globals);
  
  // Wrap the sketch code to call setup()
  const wrappedCode = `
    ${code}
    
    // Execute setup (shapes is static - single frame)
    if (typeof setup === 'function') {
      setup();
    }
  `;
  
  // Create and execute the function
  const sketchFunction = new Function(...globalNames, wrappedCode);
  sketchFunction(...globalValues);
}

/**
 * Compile a ShapesSystem to a protocol-native definition
 * For storage and reproducibility
 */
export function compileSystemToProtocol(system: ShapesSystem): object {
  return {
    type: 'shapes',
    version: '1.0',
    enforcement: 'hard',
    system: {
      strokes: system.strokes,
      backgroundColor: system.backgroundColor,
      seed: system.seed,
    },
    deterministic: true,
  };
}
