/**
 * NexArt Code Mode Runtime SDK - Static Engine
 * Protocol: v1.2.0 (Phase 3) — HARD ENFORCEMENT
 * 
 * Static mode renderer: executes setup() only, captures single PNG.
 * Does NOT execute draw() - per NexArt Execution Specification v1.
 * 
 * Determinism Guarantee:
 * Same code + same seed + same VARs = identical PNG output
 * 
 * Security:
 * All external entropy sources are blocked at runtime via execution sandbox.
 * 
 * Oracle Support:
 * When returnImageData is true, returns raw ImageData for determinism hashing.
 * Works in both browser (HTMLCanvasElement) and Node (canvas package) environments.
 */

import type { EngineConfig, RunOptions, RenderResult } from './types';
import { DEFAULT_CONFIG } from './types';
import { createP5Runtime, injectTimeVariables, injectProtocolVariables } from './p5-runtime';
import { FORBIDDEN_APIS, createSafeMath } from './execution-sandbox';

let nodeCanvasModule: any = null;
async function getNodeCanvas() {
  if (nodeCanvasModule) return nodeCanvasModule;
  if (typeof window === 'undefined') {
    try {
      const { createRequire } = await import('module');
      const require = createRequire(import.meta.url);
      nodeCanvasModule = require('canvas');
      return nodeCanvasModule;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Create a runtime canvas that works in both browser and Node environments.
 * Browser: uses HTMLCanvasElement
 * Node/Headless: uses `canvas` npm package
 */
async function createRuntimeCanvas(
  width: number,
  height: number
): Promise<HTMLCanvasElement> {
  // Browser environment
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  // Node / headless environment (oracle, CI)
  const nodeCanvas = await getNodeCanvas();
  if (nodeCanvas && nodeCanvas.createCanvas) {
    return nodeCanvas.createCanvas(width, height);
  }
  
  throw new Error(
    '[Code Mode Protocol Error] Headless canvas unavailable. ' +
    'Install `canvas` for oracle execution.'
  );
}

export async function runStaticMode(
  config: EngineConfig,
  options: RunOptions
): Promise<void> {
  const { code, seed, vars, onPreview, onProgress, onComplete, onError, returnImageData } = options;
  const width = config.width ?? DEFAULT_CONFIG.width;
  const height = config.height ?? DEFAULT_CONFIG.height;

  try {
    onProgress?.({
      phase: 'setup',
      percent: 0,
      message: 'Initializing canvas...',
    });

    // Create runtime canvas (browser or Node)
    const canvas = await createRuntimeCanvas(width, height);

    // Create p5 runtime with optional seed for determinism
    const p = createP5Runtime(canvas, width, height, { seed });

    // Inject time variables (static = frame 0, t = 0, totalFrames = 1)
    injectTimeVariables(p, {
      frameCount: 0,
      t: 0,
      time: 0,
      tGlobal: 0,
      totalFrames: 1, // Static mode has 1 frame
    });
    
    // Inject protocol variables (VAR[0..9])
    injectProtocolVariables(p, vars);

    onProgress?.({
      phase: 'setup',
      percent: 10,
      message: 'Parsing code...',
    });

    // Extract setup() function only - draw() is NOT executed in Static Mode
    const setupMatch = code.match(/function\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\}(?=\s*function|\s*$)/);
    const setupCode = setupMatch ? setupMatch[1].trim() : code;

    // Validate - no forbidden patterns
    const forbiddenPatterns = ['setTimeout', 'setInterval', 'requestAnimationFrame'];
    for (const pattern of forbiddenPatterns) {
      if (code.includes(pattern)) {
        throw new Error(`Forbidden async timing function: ${pattern}`);
      }
    }

    onProgress?.({
      phase: 'rendering',
      percent: 30,
      message: 'Executing setup()...',
    });

    // Create sandboxed execution context
    // All forbidden APIs are injected as parameters to override globals
    const safeMath = createSafeMath();
    const forbiddenKeys = Object.keys(FORBIDDEN_APIS);
    
    // Create wrapped setup function with p5 context, VAR, and blocked globals
    const wrappedSetup = new Function(
      'p', 'frameCount', 't', 'time', 'tGlobal', 'VAR', 'Math', ...forbiddenKeys,
      `with(p) { ${setupCode} }`
    );

    // Execute setup() only with sandboxed context
    const forbiddenValues = forbiddenKeys.map(k => FORBIDDEN_APIS[k as keyof typeof FORBIDDEN_APIS]);
    wrappedSetup(p, 0, 0, 0, 0, p.VAR, safeMath, ...forbiddenValues);

    // Provide preview callback
    onPreview?.(canvas);

    onProgress?.({
      phase: 'encoding',
      percent: 70,
      message: returnImageData ? 'Capturing ImageData...' : 'Capturing PNG...',
    });

    // Get 2D context for pixel access
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to acquire 2D context');
    }

    // Always capture pixel data first
    const imageData = ctx.getImageData(0, 0, width, height);

    // ORACLE / NODE PATH — MUST NOT TOUCH toBlob
    if (returnImageData) {
      onProgress?.({
        phase: 'complete',
        percent: 100,
        message: 'Complete',
      });
      onComplete({
        type: 'image',
        imageData,
      });
      return; // Early return - never touch toBlob in oracle mode
    }

    // BROWSER / UI PATH ONLY
    const blob = await new Promise<Blob>((resolve, reject) => {
      (canvas as HTMLCanvasElement).toBlob(
        (b: Blob | null) => b ? resolve(b) : reject(new Error('Failed to capture PNG')),
        'image/png'
      );
    });

    onProgress?.({
      phase: 'complete',
      percent: 100,
      message: 'Complete',
    });

    onComplete({
      type: 'image',
      blob,
    });

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
  }
}
