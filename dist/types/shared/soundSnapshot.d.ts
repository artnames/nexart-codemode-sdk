/**
 * SoundSnapshot - Canonical sound data interface for Code Mode integration
 *
 * This is the single source of truth for sound-derived parameters.
 * All values are normalized to 0-100 range for consistency.
 *
 * Usage:
 *   - Sound analysis produces SoundSnapshot
 *   - Code Mode receives it as read-only S.* globals
 *   - SoundArt styles become Code Mode sketches using S.*
 */
export interface SoundSnapshot {
    volume: number;
    amplitude: number;
    dynamicRange: number;
    brightness: number;
    bass: number;
    mid: number;
    treble: number;
    harmonicity: number;
    aggression: number;
    attack: number;
    rhythmicity: number;
    silence: number;
    hue: number;
    chroma: number;
    length: number;
    t: number;
    frame?: number;
    totalFrames?: number;
}
/**
 * Create an empty/default SoundSnapshot with neutral values
 */
export declare function createEmptySoundSnapshot(): SoundSnapshot;
/**
 * Clamp a value to 0-100 range
 */
export declare function clampPercent(value: number): number;
/**
 * Convert a 0-1 normalized value to 0-100 percentage
 */
export declare function toPercent(value: number): number;
/**
 * SoundFeatures type for compatibility with existing analysis code
 */
export interface SoundBands {
    sub?: number;
    bass: number;
    lowMid: number;
    highMid: number;
    treble: number;
}
export interface FrameFeatures {
    t0: number;
    t1: number;
    rms: number;
    centroid: number;
    bands: SoundBands;
    aggression: number;
    amplitude: number;
    dynamicRange: number;
    attack: number;
    rhythmicity: number;
    harmonicity: number;
    silence: number;
    tempoBpm?: number;
}
export interface SoundFeatures {
    rms: number;
    centroid: number;
    bands: SoundBands;
    durationSec: number;
    seedHint?: number;
    frames: FrameFeatures[];
    averageBpm?: number;
    featureVariances?: Record<string, number>;
}
/**
 * Create a SoundSnapshot from SoundFeatures (analysis output)
 *
 * @param sound - Raw sound features from analysis
 * @param frames - Frame features array
 * @param windowMs - Time window to average (default 800ms for recent snapshot)
 * @param frameIndex - Current frame index for loop mode
 * @param totalFrames - Total frames for loop mode
 */
export declare function createSoundSnapshot(sound: SoundFeatures, frames?: FrameFeatures[], windowMs?: number, frameIndex?: number, totalFrames?: number): SoundSnapshot;
/**
 * Freeze a SoundSnapshot to make it immutable
 * This is used when injecting into Code Mode to prevent modification
 */
export declare function freezeSoundSnapshot(snapshot: SoundSnapshot): Readonly<SoundSnapshot>;
//# sourceMappingURL=soundSnapshot.d.ts.map