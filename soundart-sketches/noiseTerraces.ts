export const NOISE_TERRACES_SKETCH = `
function setup() {
  const bgMode = typeof backgroundMode !== 'undefined' ? backgroundMode : 'rgb';
  if (bgMode === 'white') background(245, 245, 245);
  else if (bgMode === 'black') background(10, 10, 10);
  else {
    const r = Math.floor((S.brightness / 100) * 255);
    const g = Math.floor((S.rhythmicity / 100) * 255);
    const b = Math.floor((S.harmonicity / 100) * 255);
    background(r, g, b);
  }

  const levels = Math.floor(map(S.harmonicity, 0, 100, 6, 16));
  const res = Math.floor(map(S.brightness, 0, 100, 3, 10));

  const mainHue = (S.brightness * 3.6) % 360;
  const palette = [];
  for (let i = 0; i < 16; i++) {
    const h = (mainHue + i * 22.5) % 360;
    const sat = map(S.treble, 0, 100, 60, 90);
    const bri = map(S.bass, 0, 100, 70, 95);
    palette.push([h, sat, bri]);
  }

  noStroke();

  for (let lvl = 0; lvl < levels; lvl++) {
    const iso = lvl / levels;
    const [h, sat, bri] = palette[lvl % palette.length];
    const satBoost = map(S.treble, 0, 100, 1.0, 1.4);
    const alpha = lerp(0.95, 0.5, iso) * map(S.volume, 0, 100, 0.5, 1.0);
    
    fill(hslColor(h, constrain(sat * satBoost, 0, 100), bri, alpha));
    
    const scale = 0.012 + lvl * 0.0025;
    for (let x = 0; x < width; x += res) {
      for (let y = 0; y < height; y += res) {
        if (noise(x * scale, y * scale) > iso * map(S.rhythmicity, 0, 100, 3.4, 8.3)) {
          const rw = res * (0.9 + random() * 0.3);
          const rh = res * (0.9 + random() * 0.3);
          rect(x, y, rw, rh);
        }
      }
    }
  }
}

function hslColor(h, s, l, a) {
  if (a !== undefined) return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}
`;

export default NOISE_TERRACES_SKETCH;
