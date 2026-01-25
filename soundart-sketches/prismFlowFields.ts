export const PRISM_FLOW_FIELDS_SKETCH = `
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

  const particleCount = Math.floor(map(S.volume, 0, 100, 1500, 8200));
  const maxSteps = Math.floor(map(S.rhythmicity, 0, 100, 200, 680));
  const weightMin = map(S.volume, 0, 100, 0.5, 1.8);
  const weightMax = map(S.treble, 0, 100, 1.2, 3.2);
  const angleMult = map(max(0, S.harmonicity - 5), 0, 95, 2.5, 7.0);
  const stepJitter = map(S.aggression, 0, 100, 0.5, 2.5);
  const skewOffset = map(S.hue, 0, 100, -PI / 6, PI / 6);
  const alphaBase = map(S.brightness, 0, 100, 0.4, 0.7);
  const scaleF = map(S.harmonicity, 0, 100, 0.0001, 0.0024);

  noFill();

  for (let i = 0; i < particleCount; i++) {
    let x = random() * width;
    let y = random() * height;
    const hueShift = (i / particleCount) * 360 + (S.hue * 3.6);
    const h = hueShift % 360;
    const sat = map(S.aggression, 0, 100, 70, 100);
    const bri = map(S.brightness, 0, 100, 60, 100);
    
    stroke('hsla(' + h + ',' + sat + '%,' + bri + '%,' + alphaBase + ')');
    strokeWeight(map(random(), 0, 1, weightMin, weightMax));
    
    beginShape();
    vertex(x, y);
    for (let j = 0; j < maxSteps; j++) {
      const angle = noise(x * scaleF, y * scaleF) * PI * 4 + skewOffset;
      const dx = cos(angle) * (angleMult + (random() - 0.5) * stepJitter);
      const dy = sin(angle) * (angleMult + (random() - 0.5) * stepJitter);
      x += dx;
      y += dy;
      if (x < 0 || x > width || y < 0 || y > height) break;
      vertex(x, y);
    }
    endShape();
  }
}
`;

export default PRISM_FLOW_FIELDS_SKETCH;
