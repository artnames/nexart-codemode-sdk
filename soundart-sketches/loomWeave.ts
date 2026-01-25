export const LOOM_WEAVE_SKETCH = `
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

  const threadsX = Math.round(map(S.rhythmicity, 0, 100, 4, 22));
  const threadsY = Math.round(map(S.volume, 0, 100, 4, 22));
  const margin = map(S.dynamicRange, 0, 100, 80, 220);
  const threadW = map(S.amplitude, 0, 100, 8, 26);
  const noiseFreq = map(S.harmonicity, 0, 100, 0.012, 0.035);
  const noiseAmp = map(S.aggression, 0, 100, 8, 38);
  const hueBase = map(S.hue, 0, 100, 0, 360);
  const warpHue = hueBase;
  const weftHue = (hueBase + 180) % 360;
  const brightness = map(S.brightness, 0, 100, 45, 75);
  const chroma = map(S.chroma, 0, 100, 70, 95);
  const alphaVal = map(S.attack, 0, 100, 0.8, 1.0);

  noStroke();

  for (let i = 0; i < threadsX; i++) {
    const xBase = margin + (width - 2 * margin) * (i / max(1, threadsX - 1));
    fill('hsla(' + warpHue + ',' + chroma + '%,' + brightness + '%,' + alphaVal + ')');
    beginShape();
    for (let y = 0; y <= height; y += 16) {
      const dx = map(noise(i * 0.25, y * noiseFreq), 0, 1, -noiseAmp, noiseAmp);
      vertex(xBase + dx - threadW / 2, y);
    }
    for (let y = height; y >= 0; y -= 16) {
      const dx = map(noise(i * 0.37, y * noiseFreq + 200), 0, 1, -noiseAmp, noiseAmp);
      vertex(xBase + dx + threadW / 2, y);
    }
    endShape(CLOSE);
  }

  for (let j = 0; j < threadsY; j++) {
    const yBase = margin + (height - 2 * margin) * (j / max(1, threadsY - 1));
    fill('hsla(' + weftHue + ',' + chroma + '%,' + brightness + '%,' + alphaVal + ')');
    beginShape();
    for (let x = 0; x <= width; x += 16) {
      const dy = map(noise(j * 0.25, x * noiseFreq), 0, 1, -noiseAmp, noiseAmp);
      vertex(x, yBase + dy - threadW / 2);
    }
    for (let x = width; x >= 0; x -= 16) {
      const dy = map(noise(j * 0.37, x * noiseFreq + 200), 0, 1, -noiseAmp, noiseAmp);
      vertex(x, yBase + dy + threadW / 2);
    }
    endShape(CLOSE);
  }
}
`;

export default LOOM_WEAVE_SKETCH;
