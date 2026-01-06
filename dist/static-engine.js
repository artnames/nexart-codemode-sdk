/**
 * NexArt Code Mode Runtime SDK - Static Engine
 * Protocol: v1.2.0 (Phase 3) — HARD ENFORCEMENT
 *
 * Static mode renderer: executes setup() only, captures single PNG.
 * Does NOT execute draw() - per NexArt Execution Specification v1.
 *
 * Determinism Guarantee:
 * Same code + same seed + same VARs = identical PNG output
 */
import { DEFAULT_CONFIG } from './types';
import { createP5Runtime, injectTimeVariables, injectProtocolVariables } from './p5-runtime';
export async function runStaticMode(config, options) {
    const { code, seed, vars, onPreview, onProgress, onComplete, onError } = options;
    const width = config.width ?? DEFAULT_CONFIG.width;
    const height = config.height ?? DEFAULT_CONFIG.height;
    try {
        onProgress?.({
            phase: 'setup',
            percent: 0,
            message: 'Initializing canvas...',
        });
        // Create offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
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
        // Create wrapped setup function with p5 context and VAR
        const wrappedSetup = new Function('p', 'frameCount', 't', 'time', 'tGlobal', 'VAR', `with(p) { ${setupCode} }`);
        // Execute setup() only
        wrappedSetup(p, 0, 0, 0, 0, p.VAR);
        // Provide preview callback
        onPreview?.(canvas);
        onProgress?.({
            phase: 'encoding',
            percent: 70,
            message: 'Capturing PNG...',
        });
        // Capture as PNG
        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Failed to capture PNG')), 'image/png');
        });
        onProgress?.({
            phase: 'complete',
            percent: 100,
            message: 'Complete',
        });
        const result = {
            type: 'image',
            blob,
        };
        onComplete(result);
    }
    catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
    }
}
