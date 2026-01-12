export const PIXEL_GLYPHS_SKETCH = `
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

  const cols = Math.floor(map(S.length, 0, 100, 2, 18));
  const rows = Math.floor(map(S.length, 0, 100, 3, 24));
  const density = map(S.volume, 0, 100, 0.25, 0.6);
  const jitter = map(S.attack, 0, 100, 0, 0.25);
  const sparkRate = map(S.treble, 0, 100, 0.05, 0.45);
  const invertRate = map(S.dynamicRange, 0, 100, 0.05, 0.35);

  const margin = 140, gutter = 20, glyphRes = 7;
  const P = [[11,16,38],[255,51,102],[0,224,255],[255,209,102],[124,255,178],[138,43,226]];
  const cellW = (width - margin*2 - gutter*(cols - 1)) / cols;
  const cellH = (height - margin*2 - gutter*(rows - 1)) / rows;
  if (cellW <= 0 || cellH <= 0) return;

  noStroke();

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const cx = margin + gx * (cellW + gutter);
      const cy = margin + gy * (cellH + gutter);
      const invert = noise(gx * 0.4, gy * 0.3) < invertRate;
      const baseA = map(S.amplitude, 0, 100, 0.8, 1.0);
      const rndVal = noise(gx * 0.5, gy * 0.7);
      const baseIdx = 1 + Math.floor(rndVal * 5);
      const accentIdx = 1 + Math.floor(noise(gx + 3.3, gy + 4.4) * 5);
      const baseCol = invert ? [240, 245, 255] : P[baseIdx];
      const accCol = invert ? P[baseIdx] : P[accentIdx];

      const px = Math.floor((cellW * 0.84) / glyphRes);
      const py = Math.floor((cellH * 0.84) / glyphRes);
      const gw = px * glyphRes, gh = py * glyphRes;
      const ox = cx + Math.floor((cellW - gw) * 0.5);
      const oy = cy + Math.floor((cellH - gh) * 0.5);

      for (let j = 0; j < glyphRes; j++) {
        for (let i = 0; i < Math.ceil(glyphRes / 2); i++) {
          const pNoise = noise(gx * 0.51 + i * 0.19, gy * 0.47 + j * 0.21);
          const p = density + (pNoise - 0.5) * 0.35;
          if (random() < constrain(p, 0.05, 0.9)) {
            const jx = Math.floor((random() - 0.5) * jitter * px);
            const jy = Math.floor((random() - 0.5) * jitter * py);
            const x0 = ox + i * px + jx;
            const y0 = oy + j * py + jy;
            
            fill(baseCol[0], baseCol[1], baseCol[2], baseA * 255);
            rect(x0, y0, px, py);
            const mi = glyphRes - 1 - i;
            rect(ox + mi * px - jx, y0, px, py);
            
            if (random() < sparkRate) {
              fill(accCol[0], accCol[1], accCol[2], baseA * 255);
              rect(x0 + px * 0.2, y0 + py * 0.2, px * 0.6, py * 0.6);
            }
          }
        }
      }
    }
  }
}
`;

export default PIXEL_GLYPHS_SKETCH;
