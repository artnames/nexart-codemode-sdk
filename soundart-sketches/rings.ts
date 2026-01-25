/**
 * Flow Grid Rings - SoundArt Style as Code Mode Sketch
 * 
 * This is the first SoundArt style converted to a Code Mode sketch.
 * It uses S.* globals (sound snapshot) instead of direct sound data.
 * 
 * Original: client/src/pages/soundart/engine/styles_impl.ts - drawFlowGridRings
 */

export const RINGS_SKETCH = `
// Flow Grid Rings - SoundArt Style
// Uses S.* sound globals and standard p5-like functions

function setup() {
  // Set background based on mode (rgb derived from sound, black, or white)
  const bgMode = typeof backgroundMode !== 'undefined' ? backgroundMode : 'rgb';
  
  if (bgMode === 'white') {
    background(245, 245, 245);
  } else if (bgMode === 'black') {
    background(10, 10, 10);
  } else {
    // Deterministic RGB background derived from sound snapshot
    // Previously used clock time, now uses sound parameters for reproducibility
    const r = Math.floor((S.brightness / 100) * 255);
    const g = Math.floor((S.rhythmicity / 100) * 255);
    const b = Math.floor((S.harmonicity / 100) * 255);
    background(r, g, b);
  }
  
  // Grid dimensions based on sound volume
  const cols = Math.floor(map(S.volume, 0, 100, 2, 32));
  const rows = Math.floor(cols * 1.5);
  const margin = map(S.length, 0, 100, width * 0.05, width * 0.1);
  const innerW = width - margin * 2;
  const innerH = height - margin * 2;
  const cellW = innerW / cols;
  const cellH = innerH / rows;
  const gap = Math.min(cellW, cellH) * 0.25;
  const maxRadius = (Math.min(cellW, cellH) - gap) / 2;
  
  // Palette Harmony based on sound
  const mainHue = (S.brightness * 3.6) % 360;
  const hueShift = map(S.harmonicity, 0, 100, 20, 60);
  const sat = map(S.treble, 0, 100, 60, 90);
  const bri = map(S.bass, 0, 100, 70, 95);
  
  // Generate palette
  const palette = [
    hslColor(mainHue, sat, bri),
    hslColor((mainHue + hueShift) % 360, sat - 10, bri + 5),
    hslColor((mainHue - hueShift + 360) % 360, sat - 10, bri + 5),
    hslColor((mainHue + 180) % 360, sat - 20, bri - 10),
    hslColor((mainHue + 120) % 360, sat, bri - 5),
    hslColor((mainHue + 240) % 360, sat, bri - 5),
  ];
  
  // Flow field parameters
  const noiseScale = 0.15;
  const noiseStrength = map(S.aggression, 0, 100, 0.5, 4.0);
  const jitter = map(S.rhythmicity, 0, 100, 0, 0.15);
  const ringBias = map(S.attack, 0, 100, 0.85, 1.15);
  
  noStroke();
  
  // Render Grid
  for (let gx = 0; gx < cols; gx++) {
    for (let gy = 0; gy < rows; gy++) {
      const cx = margin + gx * cellW + cellW / 2 + (random() - 0.5) * jitter * cellW;
      const cy = margin + gy * cellH + cellH / 2 + (random() - 0.5) * jitter * cellH;
      
      const n = noise(gx * noiseScale, gy * noiseScale);
      const angle = n * PI * 2 * noiseStrength;
      const rings = Math.max(1, Math.floor(map(sin(angle), -1, 1, 1, 6)));
      const step = (maxRadius / rings) * ringBias * 0.9;
      
      for (let i = rings; i > 0; i--) {
        fill(palette[(rings - i) % palette.length]);
        ellipse(cx, cy, i * step * 2, i * step * 2);
      }
    }
  }
}

// Helper function for HSL colors
function hslColor(h, s, l) {
  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}
`;

export default RINGS_SKETCH;
