/**
 * Noise → Code Mode Engine
 *
 * This is the orchestrator that runs Noise rendering through the Code Mode engine.
 * It replaces the legacy p5.js-based NoiseCanvas with a protocol-compliant pipeline.
 *
 * Architecture:
 *   1. NoiseParams from UI state
 *   2. NoiseParams → NoiseSnapshot conversion
 *   3. NoiseSnapshot injected as N.* globals into Code Mode
 *   4. Noise sketch executed via Code Mode runtime
 *   5. Result: PNG output (deterministic)
 */
import { createNoiseSnapshot, validateNoiseSnapshot } from '../../shared/noiseSnapshot';
import { createP5Runtime } from './p5-runtime';
import { createNoiseGlobals, injectNoiseGlobals } from './noise-bridge';
import { getNoiseSketch } from './noise-sketches';
/**
 * Render noise via Code Mode runtime
 *
 * This is the main entry point for protocol-compliant noise rendering.
 * All rendering goes through the Code Mode runtime for determinism.
 */
export async function renderNoiseViaCodeMode(options) {
    const { params, canvas, config, onProgress } = options;
    // Protocol enforcement logging
    console.log('[Noise] Protocol enforcement: HARD | renderedVia: codemode');
    onProgress?.(0.1);
    // Create and validate snapshot
    const rawSnapshot = createNoiseSnapshot(params);
    const snapshot = validateNoiseSnapshot(rawSnapshot);
    onProgress?.(0.2);
    // Create N.* globals
    const noiseGlobals = createNoiseGlobals(snapshot);
    // Get the noise sketch
    const sketchName = 'fractalNoise';
    const sketchCode = getNoiseSketch(sketchName);
    // Inject N.* globals into sketch
    const injectedCode = injectNoiseGlobals(sketchCode, noiseGlobals);
    onProgress?.(0.3);
    // Set canvas dimensions
    canvas.width = config.width;
    canvas.height = config.height;
    // Create P5 runtime with correct signature
    const runtimeConfig = {
        seed: config.seed,
    };
    const runtime = createP5Runtime(canvas, config.width, config.height, runtimeConfig);
    onProgress?.(0.5);
    // Build globals with all runtime functions and noise globals
    const globals = {
        ...runtime,
        width: config.width,
        height: config.height,
    };
    // Execute the sketch
    try {
        executeNoiseSketch(injectedCode, globals);
        onProgress?.(0.9);
        console.log('[Noise] Rendered via Code Mode runtime');
        // Build metadata
        const metadata = {
            mode: 'Noise',
            timestamp: new Date().toISOString(),
            enforcement: 'hard',
            renderedVia: 'codemode',
            noiseParams: {
                scale: snapshot.scale,
                octaves: snapshot.octaves,
                persistence: snapshot.persistence,
                lacunarity: snapshot.lacunarity,
                cellDensity: snapshot.cellDensity,
                cellDistortion: snapshot.cellDistortion,
                blendMode: snapshot.blendMode,
            },
            generationParams: {
                seed: config.seed,
                canvasSize: { width: config.width, height: config.height },
            },
        };
        onProgress?.(1.0);
        return {
            mode: 'noise',
            snapshot,
            metadata,
        };
    }
    catch (error) {
        console.error('[Noise] Code Mode execution failed:', error);
        throw error;
    }
}
/**
 * Execute a noise sketch string in the context of the runtime globals
 */
function executeNoiseSketch(code, globals) {
    const globalNames = Object.keys(globals);
    const globalValues = Object.values(globals);
    // Wrap the sketch code to call setup()
    const wrappedCode = `
    ${code}
    
    // Execute setup (noise is static - single frame)
    if (typeof setup === 'function') {
      setup();
    }
  `;
    // Create and execute the function
    const sketchFunction = new Function(...globalNames, wrappedCode);
    sketchFunction(...globalValues);
}
/**
 * Compile noise params to a Code Mode system
 * This produces a reproducible system definition
 */
export function compileNoiseSystem(params) {
    const snapshot = validateNoiseSnapshot(createNoiseSnapshot(params));
    const noiseGlobals = createNoiseGlobals(snapshot);
    const sketchCode = injectNoiseGlobals(getNoiseSketch('fractalNoise'), noiseGlobals);
    return {
        sketchCode,
        snapshot,
        seed: params.seed,
    };
}
/**
 * Check if noise can be rendered via Code Mode
 * (Always true - no legacy fallback)
 */
export function canRenderNoiseViaCodeMode() {
    return true;
}
