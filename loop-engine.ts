/**
 * NexArt Code Mode Runtime SDK - Loop Engine
 * Protocol: v1.2.0 (Phase 3) — HARD ENFORCEMENT
 * 
 * Loop mode renderer: frame-authoritative, stateless execution.
 * - Executes setup() once
 * - Executes draw() once per frame
 * - Clears canvas before each frame (transparent)
 * - Resets blend mode to NORMAL before each frame
 * - Injects normalized time variables
 * - No canvas persistence between frames
 * 
 * Determinism Guarantee:
 * Same code + same seed + same VARs = identical frame sequence
 * 
 * Security:
 * All external entropy sources are blocked at runtime via execution sandbox.
 */

import type { EngineConfig, RunOptions, RenderResult, TimeVariables } from './types';
import { DEFAULT_CONFIG } from './types';
import { createP5Runtime, injectTimeVariables, injectProtocolVariables } from './p5-runtime';
import { FORBIDDEN_APIS, createSafeMath } from './execution-sandbox';

let isCancelled = false;

export function cancelLoopMode(): void {
  isCancelled = true;
}

export async function runLoopMode(
  config: EngineConfig,
  options: RunOptions
): Promise<void> {
  const { code, seed, vars, onPreview, onProgress, onComplete, onError } = options;
  const width = config.width ?? DEFAULT_CONFIG.width;
  const height = config.height ?? DEFAULT_CONFIG.height;
  const duration = Math.max(
    DEFAULT_CONFIG.minDuration,
    Math.min(DEFAULT_CONFIG.maxDuration, config.duration ?? DEFAULT_CONFIG.duration)
  );
  const fps = config.fps ?? DEFAULT_CONFIG.fps;
  const totalFrames = Math.floor(duration * fps);

  isCancelled = false;

  try {
    onProgress?.({
      phase: 'setup',
      percent: 0,
      message: 'Initializing canvas...',
    });

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    // Create p5 runtime with optional seed for determinism
    const p = createP5Runtime(canvas, width, height, { seed });
    
    // Inject protocol variables (VAR[0..9])
    injectProtocolVariables(p, vars);

    // Validate code
    const hasDrawFunction = /function\s+draw\s*\(\s*\)/.test(code);
    if (!hasDrawFunction) {
      throw new Error('Loop Mode requires a draw() function.');
    }

    const forbiddenPatterns = [
      { pattern: /noLoop\s*\(\s*\)/, name: 'noLoop()' },
      { pattern: /setTimeout\s*\(/, name: 'setTimeout' },
      { pattern: /setInterval\s*\(/, name: 'setInterval' },
      { pattern: /requestAnimationFrame\s*\(/, name: 'requestAnimationFrame' },
    ];

    for (const { pattern, name } of forbiddenPatterns) {
      if (pattern.test(code)) {
        throw new Error(`Forbidden function in Loop Mode: ${name}`);
      }
    }

    onProgress?.({
      phase: 'setup',
      percent: 5,
      message: 'Parsing code...',
    });

    // Extract setup() and draw() functions
    const setupMatch = code.match(/function\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\}(?=\s*function|\s*$)/);
    const drawMatch = code.match(/function\s+draw\s*\(\s*\)\s*\{([\s\S]*?)\}(?=\s*function|\s*$)/);

    const setupCode = setupMatch ? setupMatch[1].trim() : '';
    const drawCode = drawMatch ? drawMatch[1].trim() : '';

    if (!drawCode) {
      throw new Error('Loop Mode requires a draw() function with content.');
    }

    // Inject totalFrames into runtime
    p.totalFrames = totalFrames;
    
    // Create sandboxed execution context
    // All forbidden APIs are injected as parameters to override globals
    const safeMath = createSafeMath();
    const forbiddenKeys = Object.keys(FORBIDDEN_APIS);
    
    // Create wrapped functions with p5 context, time variables, VAR, totalFrames, and blocked globals
    const wrappedSetup = new Function(
      'p', 'frameCount', 't', 'time', 'tGlobal', 'VAR', 'totalFrames', 'Math', ...forbiddenKeys,
      `with(p) { ${setupCode} }`
    );

    const wrappedDraw = new Function(
      'p', 'frameCount', 't', 'time', 'tGlobal', 'VAR', 'totalFrames', 'Math', ...forbiddenKeys,
      `with(p) { ${drawCode} }`
    );
    
    // Get forbidden values array for execution
    const forbiddenValues = forbiddenKeys.map(k => FORBIDDEN_APIS[k as keyof typeof FORBIDDEN_APIS]);

    onProgress?.({
      phase: 'setup',
      percent: 10,
      message: 'Executing setup()...',
    });

    // Execute setup() once with time = 0, VAR, totalFrames, and sandboxed context
    wrappedSetup(p, 0, 0, 0, 0, p.VAR, totalFrames, safeMath, ...forbiddenValues);

    // Capture frames
    const frames: Blob[] = [];

    onProgress?.({
      phase: 'rendering',
      frame: 0,
      totalFrames,
      percent: 10,
      message: `Rendering frames (0/${totalFrames})...`,
    });

    for (let frame = 0; frame < totalFrames; frame++) {
      if (isCancelled) {
        throw new Error('Rendering cancelled');
      }

      // Calculate normalized time variables
      // t = frame / totalFrames (range [0, 1))
      const t = frame / totalFrames;
      const time = t * duration;

      // Update p5 runtime frameCount
      p.frameCount = frame;

      // CRITICAL: Reset canvas state before each draw() call
      // This enforces stateless, frame-authoritative rendering
      
      // 1. Clear canvas (transparent)
      p.clear();
      
      // 2. Reset blend mode to NORMAL (Protocol v1.1 requirement)
      // Prevents blend mode state from persisting across frames
      p.blendMode('NORMAL');

      // Execute draw() with time variables, VAR, totalFrames, and sandboxed context
      wrappedDraw(p, frame, t, time, t, p.VAR, totalFrames, safeMath, ...forbiddenValues);

      // Capture frame as PNG blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => b ? resolve(b) : reject(new Error(`Failed to capture frame ${frame}`)),
          'image/png'
        );
      });

      frames.push(blob);

      // Provide preview on first frame
      if (frame === 0) {
        onPreview?.(canvas);
      }

      // Update progress
      const percent = 10 + Math.floor((frame / totalFrames) * 60);
      onProgress?.({
        phase: 'rendering',
        frame: frame + 1,
        totalFrames,
        percent,
        message: `Rendering frames (${frame + 1}/${totalFrames})...`,
      });

      // Yield to prevent blocking UI
      if (frame % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    onProgress?.({
      phase: 'encoding',
      frame: totalFrames,
      totalFrames,
      percent: 70,
      message: 'Encoding video...',
    });

    // Encode to video (MP4)
    const videoBlob = await encodeFramesToMP4(frames, fps, width, height, (progress) => {
      const percent = 70 + Math.floor(progress * 30);
      onProgress?.({
        phase: 'encoding',
        frame: totalFrames,
        totalFrames,
        percent,
        message: `Encoding video (${Math.floor(progress * 100)}%)...`,
      });
    });

    onProgress?.({
      phase: 'complete',
      frame: totalFrames,
      totalFrames,
      percent: 100,
      message: 'Complete',
    });

    const result: RenderResult = {
      type: 'video',
      blob: videoBlob,
      frames: totalFrames,
      duration,
    };

    onComplete(result);

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
  }
}

/**
 * Encode frames to MP4 video
 * Uses server-side encoding endpoint for cross-browser reliability
 */
async function encodeFramesToMP4(
  frames: Blob[],
  fps: number,
  width: number,
  height: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  // Convert frames to base64 for server transport
  const frameDataUrls: string[] = [];
  
  for (let i = 0; i < frames.length; i++) {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(frames[i]);
    });
    frameDataUrls.push(dataUrl);
    onProgress?.(i / frames.length * 0.3);
  }

  // Send to server for encoding
  const response = await fetch('/api/encode-loop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      frames: frameDataUrls,
      fps,
      width,
      height,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Video encoding failed: ${errorText}`);
  }

  onProgress?.(0.8);

  const data = await response.json();
  
  if (!data.video) {
    throw new Error('No video data returned from encoder');
  }

  // Convert base64 to blob
  const binaryString = atob(data.video.split(',')[1] || data.video);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  onProgress?.(1);

  return new Blob([bytes], { type: 'video/mp4' });
}
