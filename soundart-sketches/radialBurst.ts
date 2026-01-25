export const RADIAL_BURST_SKETCH = `
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

  const centerX = width / 2;
  const centerY = height / 2;
  const baseN = Math.floor(map(S.rhythmicity, 0, 100, 90, 320));
  const rhythmMask = 0.4 + (S.rhythmicity / 100) * 0.6;

  const palette = [];
  const mainHue = (S.brightness * 3.6) % 360;
  for (let i = 0; i < 16; i++) {
    const h = (mainHue + i * 22.5) % 360;
    const sat = map(S.treble, 0, 100, 60, 90);
    const bri = map(S.bass, 0, 100, 70, 95);
    palette.push('hsl(' + h + ',' + sat + '%,' + bri + '%)');
  }

  noFill();

  for (let i = 0; i < baseN; i++) {
    if ((i % 3) && random() > rhythmMask) continue;

    const angle = (i / baseN) * PI * 2;
    const col = palette[i % palette.length];

    const lenJit = map(S.dynamicRange, 0, 100, 0, height * 2.45);
    const rayLength = (S.amplitude / 100) * (height * 1.65) + random() * lenJit;

    const waveAmp = map(S.harmonicity, 0, 100, 0, 42);
    const waveFreq = map(S.treble, 0, 100, 1, 48);
    const segments = 28;

    const thickness = 1.2 + (S.attack / 100) * 7 + (S.aggression / 100) * 5 + sin(i * 0.9) * 1.4;

    stroke(col);
    strokeWeight(thickness);

    beginShape();
    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      const radius = t * rayLength;
      const wobble = sin(t * PI * waveFreq + i * 0.2) * waveAmp * (1 - t);
      const wx = centerX + cos(angle + wobble * 0.01) * radius;
      const wy = centerY + sin(angle + wobble * 0.01) * radius;
      vertex(wx, wy);
    }
    endShape();
  }
}
`;

export default RADIAL_BURST_SKETCH;
