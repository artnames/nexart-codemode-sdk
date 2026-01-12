export const WAVE_STRIPES_SKETCH = `
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

  const numLines = Math.floor(map(S.length, 0, 100, 5, 100));
  const amp = map(S.volume, 0, 100, 0.012, 0.09);
  const lineNoise = map(S.harmonicity, 0, 100, 0.1, 0.8);
  const freqNoise = map(S.aggression, 0, 100, 0.004, 0.02);
  const waveFreq = map(S.rhythmicity, 0, 100, 0.0003, 0.003);
  const strokeW = map(S.bass, 0, 100, 2, 6.0);
  const vividBoost = constrain(map(S.brightness, 0, 100, 0.6, 1.2), 0.6, 1.4);

  noFill();
  strokeWeight(strokeW);

  for (let j = 0; j < numLines; j++) {
    const yBase = map(j, 0, numLines - 1, 0.05 * height, 0.95 * height);
    const lineTreble = constrain(S.treble + noise(j, 99) * 20 - 10, 0, 100);
    const hue = ((map(lineTreble, 60, 100, 0, 360) + map(S.attack, 0, 100, 0, 120) + noise(j, 100) * 20 - 10) % 360 + 360) % 360;
    
    stroke('hsl(' + hue + ',85%,' + constrain(vividBoost * 55, 40, 70) + '%)');
    
    beginShape();
    const pointSpacing = constrain(map(S.harmonicity, 0, 100, 20, 4), 4, 20);
    for (let i = 0; i <= width; i += pointSpacing) {
      const shimmer = sin(i * 0.05 + j * 0.1) * 0.05;
      const offsetY = sin(i * waveFreq + j * 0.2 + shimmer) * amp * height;
      const localNoiseVal = (noise(i * freqNoise, j * lineNoise) - 0.5) * amp * height;
      const y = yBase + offsetY + localNoiseVal;
      vertex(i, y);
    }
    endShape();
  }
}
`;

export default WAVE_STRIPES_SKETCH;
