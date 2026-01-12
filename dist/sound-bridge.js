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
import { createEmptySoundSnapshot, freezeSoundSnapshot } from '../../shared/soundSnapshot';
/**
 * Create a frozen, read-only sound globals object from a snapshot
 */
export function createSoundGlobals(snapshot) {
    return freezeSoundSnapshot(snapshot);
}
/**
 * Create empty/default sound globals for testing or fallback
 */
export function createEmptySoundGlobals() {
    return freezeSoundSnapshot(createEmptySoundSnapshot());
}
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
export function injectSoundGlobals(runtime, snapshot) {
    const globals = createSoundGlobals(snapshot);
    // Create a proxy to make S immutable and prevent modification
    const immutableS = new Proxy(globals, {
        set() {
            console.warn('[SoundBridge] S.* globals are read-only');
            return false;
        },
        deleteProperty() {
            console.warn('[SoundBridge] Cannot delete S.* properties');
            return false;
        },
        defineProperty() {
            console.warn('[SoundBridge] Cannot define new S.* properties');
            return false;
        }
    });
    return {
        ...runtime,
        S: immutableS
    };
}
/**
 * Helper function to map S.* values to useful ranges
 *
 * Usage in sketches:
 *   const density = mapSound(S.volume, 100, 2000) // Map 0-100 to 100-2000
 */
export function createSoundHelpers() {
    return {
        /**
         * Map a sound value (0-100) to a custom range
         */
        mapSound: (value, outMin, outMax) => {
            return outMin + (value / 100) * (outMax - outMin);
        },
        /**
         * Map a sound value (0-100) with easing
         */
        mapSoundEased: (value, outMin, outMax, easing = 2) => {
            const t = Math.pow(value / 100, easing);
            return outMin + t * (outMax - outMin);
        },
        /**
         * Get a value that oscillates based on sound
         */
        soundOscillate: (base, amplitude, soundValue) => {
            return base + Math.sin(soundValue * Math.PI / 50) * amplitude;
        }
    };
}
/**
 * Convert SoundSnapshot hue (0-100) to degrees (0-360)
 */
export function hueToDegrees(hue) {
    return (hue / 100) * 360;
}
/**
 * Generate a color palette from sound parameters
 *
 * @param snapshot - The sound snapshot
 * @param paletteSize - Number of colors to generate
 * @returns Array of HSL color strings
 */
export function generateSoundPalette(snapshot, paletteSize = 6) {
    const mainHue = hueToDegrees(snapshot.hue);
    const hueShift = 20 + (snapshot.harmonicity / 100) * 40; // 20-60 degrees
    const sat = 60 + (snapshot.treble / 100) * 30; // 60-90%
    const light = 70 + (snapshot.bass / 100) * 25; // 70-95%
    const palette = [];
    for (let i = 0; i < paletteSize; i++) {
        const hue = (mainHue + i * hueShift) % 360;
        const satVar = sat - (i % 2) * 10;
        const lightVar = light - (i % 3) * 5;
        palette.push(`hsl(${hue}, ${satVar}%, ${lightVar}%)`);
    }
    return palette;
}
export function inferGenreProfile(snapshot) {
    // Energy based on volume and aggression
    const energy = (snapshot.volume > 60 || snapshot.aggression > 60) ? 'high' :
        (snapshot.volume > 30) ? 'mid' : 'low';
    // Structure based on rhythmicity and aggression
    const structure = (snapshot.rhythmicity > 50 && snapshot.dynamicRange < 25) ? 'geometric' :
        (snapshot.aggression > 60 && snapshot.dynamicRange > 50) ? 'chaotic' : 'organic';
    // Clarity based on brightness
    const clarity = (snapshot.brightness > 60) ? 'sharp' :
        (snapshot.brightness > 40) ? 'clear' : 'muddy';
    return { energy, structure, clarity };
}
