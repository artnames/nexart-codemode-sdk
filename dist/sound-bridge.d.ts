/**
 * SoundArt → Code Mode Bridge
 *
 * This module injects sound-derived parameters into the Code Mode runtime
 * as read-only `S.*` globals. It is the integration layer between sound
 * analysis and generative art rendering.
 *
 * Usage in Code Mode sketches:
 *   S.volume     // 0-100: Overall loudness
 *   S.bass       // 0-100: Bass frequency energy
 *   S.treble     // 0-100: Treble frequency energy
 *   S.aggression // 0-100: Intensity/harshness
 *   S.t          // 0-1: Normalized time position
 *   etc.
 */
import type { SoundSnapshot } from '../../shared/soundSnapshot';
/**
 * The injected sound globals interface
 * This is what sketches see as `S`
 */
export interface SoundGlobals extends Readonly<SoundSnapshot> {
}
/**
 * Create a frozen, read-only sound globals object from a snapshot
 */
export declare function createSoundGlobals(snapshot: SoundSnapshot): SoundGlobals;
/**
 * Create empty/default sound globals for testing or fallback
 */
export declare function createEmptySoundGlobals(): SoundGlobals;
/**
 * Inject sound globals into the p5 runtime context
 *
 * This adds the `S` global object to the runtime so sketches can access
 * sound-derived parameters like S.volume, S.bass, etc.
 *
 * @param runtime - The p5 runtime object
 * @param snapshot - The sound snapshot to inject
 * @returns The runtime with S globals added
 */
export declare function injectSoundGlobals<T extends Record<string, any>>(runtime: T, snapshot: SoundSnapshot): T & {
    S: SoundGlobals;
};
/**
 * Helper function to map S.* values to useful ranges
 *
 * Usage in sketches:
 *   const density = mapSound(S.volume, 100, 2000) // Map 0-100 to 100-2000
 */
export declare function createSoundHelpers(): {
    /**
     * Map a sound value (0-100) to a custom range
     */
    mapSound: (value: number, outMin: number, outMax: number) => number;
    /**
     * Map a sound value (0-100) with easing
     */
    mapSoundEased: (value: number, outMin: number, outMax: number, easing?: number) => number;
    /**
     * Get a value that oscillates based on sound
     */
    soundOscillate: (base: number, amplitude: number, soundValue: number) => number;
};
/**
 * Convert SoundSnapshot hue (0-100) to degrees (0-360)
 */
export declare function hueToDegrees(hue: number): number;
/**
 * Generate a color palette from sound parameters
 *
 * @param snapshot - The sound snapshot
 * @param paletteSize - Number of colors to generate
 * @returns Array of HSL color strings
 */
export declare function generateSoundPalette(snapshot: SoundSnapshot, paletteSize?: number): string[];
/**
 * Infer a genre profile from sound parameters
 * This helps sketches adapt their visual style to the audio content
 */
export type EnergyLevel = 'low' | 'mid' | 'high';
export type StructureType = 'chaotic' | 'organic' | 'geometric';
export type ClarityLevel = 'muddy' | 'clear' | 'sharp';
export interface GenreProfile {
    energy: EnergyLevel;
    structure: StructureType;
    clarity: ClarityLevel;
}
export declare function inferGenreProfile(snapshot: SoundSnapshot): GenreProfile;
//# sourceMappingURL=sound-bridge.d.ts.map