/**
 * Noise Bridge - Injects N.* globals into Code Mode runtime
 *
 * This is the bridge between NoiseSnapshot data and the Code Mode p5-runtime.
 * It creates frozen N.* globals that noise sketches can access deterministically.
 *
 * Similar to sound-bridge.ts for SoundArt, but for Noise parameters.
 */
/**
 * Create N.* globals from a NoiseSnapshot
 */
export function createNoiseGlobals(snapshot) {
    return Object.freeze({
        scale: snapshot.scale,
        octaves: snapshot.octaves,
        persistence: snapshot.persistence,
        lacunarity: snapshot.lacunarity,
        cellDensity: snapshot.cellDensity,
        cellDistortion: snapshot.cellDistortion,
        blendMode: snapshot.blendMode,
        isPerlinOnly: snapshot.blendMode === 'perlin_only',
        isBlend: snapshot.blendMode === 'blend',
        isWarp: snapshot.blendMode === 'warp',
        isInterleave: snapshot.blendMode === 'interleave',
        bgR: snapshot.bgR,
        bgG: snapshot.bgG,
        bgB: snapshot.bgB,
        noiseR: snapshot.noiseR,
        noiseG: snapshot.noiseG,
        noiseB: snapshot.noiseB,
        seed: snapshot.seed,
        zoom: snapshot.zoomLevel,
    });
}
/**
 * Inject N.* globals into code string
 *
 * This wraps the sketch code with N.* variable declarations
 */
export function injectNoiseGlobals(sketchCode, globals) {
    const injection = `
// === Injected Noise Globals (N.*) ===
const N = Object.freeze({
  scale: ${globals.scale},
  octaves: ${globals.octaves},
  persistence: ${globals.persistence},
  lacunarity: ${globals.lacunarity},
  cellDensity: ${globals.cellDensity},
  cellDistortion: ${globals.cellDistortion},
  blendMode: '${globals.blendMode}',
  isPerlinOnly: ${globals.isPerlinOnly},
  isBlend: ${globals.isBlend},
  isWarp: ${globals.isWarp},
  isInterleave: ${globals.isInterleave},
  bgR: ${globals.bgR},
  bgG: ${globals.bgG},
  bgB: ${globals.bgB},
  noiseR: ${globals.noiseR},
  noiseG: ${globals.noiseG},
  noiseB: ${globals.noiseB},
  seed: ${globals.seed},
  zoom: ${globals.zoom}
});
// === End Injected Globals ===

`;
    return injection + sketchCode;
}
