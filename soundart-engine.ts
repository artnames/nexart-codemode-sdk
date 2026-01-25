/**
 * SoundArt → Code Mode Engine
 * 
 * This is the orchestrator that runs SoundArt styles through the Code Mode engine.
 * It replaces the old Canvas2D-based SoundArt renderer with a Code Mode pipeline.
 * 
 * Architecture:
 *   1. Sound analysis produces SoundFeatures (unchanged)
 *   2. SoundFeatures → SoundSnapshot conversion
 *   3. SoundSnapshot injected as S.* globals into Code Mode
 *   4. SoundArt sketch executed via Code Mode runtime
 *   5. Result: PNG or MP4 output
 */

import type { SoundSnapshot, SoundFeatures } from '../../shared/soundSnapshot';
import { createSoundSnapshot } from '../../shared/soundSnapshot';
import { createP5Runtime, type P5Runtime, type P5RuntimeConfig } from './p5-runtime';
import { injectSoundGlobals, generateSoundPalette, inferGenreProfile } from './sound-bridge';
import { getSoundArtSketch, type SoundArtSketchName } from './soundart-sketches';

export interface TweakParams {
  volumeRangeFactor?: number;
  centroidBrightnessFactor?: number;
  aggressionPaletteFactor?: number;
  rhythmPatternFactor?: number;
  harmonySmoothnessFactor?: number;
  attackSharpnessFactor?: number;
  dynamicRangeVariationFactor?: number;
  bassThicknessFactor?: number;
  trebleSharpnessFactor?: number;
}

export interface SoundArtEngineConfig {
  width: number;
  height: number;
  seed?: number;
  backgroundMode?: 'rgb' | 'black' | 'white';
  tweakParams?: TweakParams;
}

export interface SoundArtRenderOptions {
  style: SoundArtSketchName;
  sound: SoundFeatures;
  canvas: HTMLCanvasElement;
  config: SoundArtEngineConfig;
  onProgress?: (progress: number) => void;
}

export interface SoundArtRenderResult {
  style: SoundArtSketchName;
  mode: 'soundart';
  snapshot: SoundSnapshot;
  metadata: SoundArtMetadata;
}

export interface SoundArtMetadata {
  mode: 'SoundArt';
  style: SoundArtSketchName;
  timestamp: string;
  soundFeatures: {
    duration: number;
    amplitude: number;
    frequency: number;
    bass: number;
    treble: number;
    aggression: number;
  };
  effects: {
    timeFilter: boolean;
    backgroundMode: string;
  };
  generationParams: {
    seed: number;
    canvasSize: { width: number; height: number };
  };
}

/**
 * Apply tweak multipliers to a SoundSnapshot
 */
function applyTweaksToSnapshot(snapshot: SoundSnapshot, tweaks?: TweakParams): SoundSnapshot {
  if (!tweaks) return snapshot;
  
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  
  const tweaked: SoundSnapshot = {
    ...snapshot,
    volume: snapshot.volume * (tweaks.volumeRangeFactor ?? 1),
    brightness: snapshot.brightness * (tweaks.centroidBrightnessFactor ?? 1),
    aggression: snapshot.aggression * (tweaks.aggressionPaletteFactor ?? 1),
    rhythmicity: snapshot.rhythmicity * (tweaks.rhythmPatternFactor ?? 1),
    harmonicity: snapshot.harmonicity * (tweaks.harmonySmoothnessFactor ?? 1),
    attack: snapshot.attack * (tweaks.attackSharpnessFactor ?? 1),
    dynamicRange: snapshot.dynamicRange * (tweaks.dynamicRangeVariationFactor ?? 1),
    bass: snapshot.bass * (tweaks.bassThicknessFactor ?? 1),
    treble: snapshot.treble * (tweaks.trebleSharpnessFactor ?? 1),
  };
  
  // Clamp all numeric values to reasonable range
  tweaked.volume = clamp(tweaked.volume, 0, 250);
  tweaked.brightness = clamp(tweaked.brightness, 0, 250);
  tweaked.aggression = clamp(tweaked.aggression, 0, 250);
  tweaked.rhythmicity = clamp(tweaked.rhythmicity, 0, 250);
  tweaked.harmonicity = clamp(tweaked.harmonicity, 0, 250);
  tweaked.attack = clamp(tweaked.attack, 0, 250);
  tweaked.dynamicRange = clamp(tweaked.dynamicRange, 0, 250);
  tweaked.bass = clamp(tweaked.bass, 0, 250);
  tweaked.treble = clamp(tweaked.treble, 0, 250);
  
  return tweaked;
}

/**
 * Render a SoundArt style using Code Mode
 * 
 * This is the main entry point for the new SoundArt → Code Mode pipeline.
 */
export async function renderSoundArtViaCodeMode(
  options: SoundArtRenderOptions
): Promise<SoundArtRenderResult> {
  const { style, sound, canvas, config, onProgress } = options;
  
  onProgress?.(0.1);
  
  // 1. Get the sketch code
  const sketchCode = getSoundArtSketch(style);
  if (!sketchCode) {
    throw new Error(`SoundArt style "${style}" has not been converted to Code Mode yet`);
  }
  
  onProgress?.(0.2);
  
  // 2. Create SoundSnapshot from SoundFeatures
  const baseSnapshot = createSoundSnapshot(sound, sound.frames);
  
  // 3. Apply tweak multipliers to the snapshot
  const snapshot = applyTweaksToSnapshot(baseSnapshot, config.tweakParams);
  
  onProgress?.(0.3);
  
  // 3. Create the p5 runtime with seeded randomness
  // Derive deterministic seed from sound features if not provided
  const deriveSeedFromSound = (sound: SoundFeatures): number => {
    // Create a stable hash from sound parameters
    const hashInput = (sound.rms * 1000) + 
                      (sound.centroid * 100) + 
                      (sound.durationSec * 10000) +
                      ((sound.bands?.bass ?? 0) * 500) +
                      ((sound.bands?.treble ?? 0) * 700);
    // Simple hash to integer
    return Math.abs(Math.floor(hashInput * 2147483647) % 2147483647) || 123456;
  };
  
  const runtimeConfig: P5RuntimeConfig = {
    seed: config.seed ?? deriveSeedFromSound(sound),
  };
  
  canvas.width = config.width;
  canvas.height = config.height;
  
  const baseRuntime = createP5Runtime(canvas, config.width, config.height, runtimeConfig);
  
  // 4. Inject sound globals (S.*)
  const runtime = injectSoundGlobals(baseRuntime, snapshot);
  
  onProgress?.(0.4);
  
  // 5. Add helper globals
  const globals = {
    ...runtime,
    width: config.width,
    height: config.height,
    backgroundMode: config.backgroundMode ?? 'rgb',
    palette: generateSoundPalette(snapshot),
    genre: inferGenreProfile(snapshot),
  };
  
  onProgress?.(0.5);
  
  // 6. Execute the sketch
  try {
    executeSketch(sketchCode, globals);
    onProgress?.(0.9);
  } catch (error) {
    console.error(`[SoundArtEngine] Error executing style "${style}":`, error);
    throw new Error(`Style "${style}" execution failed: ${error}`);
  }
  
  onProgress?.(1.0);
  
  // 7. Build metadata
  const metadata: SoundArtMetadata = {
    mode: 'SoundArt',
    style,
    timestamp: new Date().toISOString(),
    soundFeatures: {
      duration: sound.durationSec,
      amplitude: sound.rms,
      frequency: sound.centroid,
      bass: sound.bands?.bass ?? 0,
      treble: sound.bands?.treble ?? 0,
      aggression: snapshot.aggression,
    },
    effects: {
      timeFilter: false,
      backgroundMode: config.backgroundMode ?? 'rgb',
    },
    generationParams: {
      seed: runtimeConfig.seed!,
      canvasSize: { width: config.width, height: config.height },
    },
  };
  
  return {
    style,
    mode: 'soundart',
    snapshot,
    metadata,
  };
}

/**
 * Execute a sketch string in the context of the runtime globals
 */
function executeSketch(code: string, globals: Record<string, any>): void {
  // Build the function context with all globals
  const globalNames = Object.keys(globals);
  const globalValues = Object.values(globals);
  
  // Wrap the sketch code to call setup() and optionally draw()
  const wrappedCode = `
    ${code}
    
    // Execute setup
    if (typeof setup === 'function') {
      setup();
    }
    
    // For static mode, we don't call draw()
    // Loop mode would call draw() in a frame loop
  `;
  
  // Create and execute the function
  const sketchFunction = new Function(...globalNames, wrappedCode);
  sketchFunction(...globalValues);
}

/**
 * Check if a SoundArt style can be rendered via Code Mode
 */
export function canRenderViaCodeMode(style: SoundArtSketchName): boolean {
  return getSoundArtSketch(style) !== undefined;
}

/**
 * Get the list of SoundArt styles available via Code Mode
 */
export function getCodeModeAvailableStyles(): SoundArtSketchName[] {
  const { getAvailableSoundArtSketches } = require('./soundart-sketches');
  return getAvailableSoundArtSketches();
}

// Re-export types for convenience
export type { SoundSnapshot, SoundFeatures } from '../../shared/soundSnapshot';
export type { SoundArtSketchName } from './soundart-sketches';
