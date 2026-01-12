export const SQUARES_SKETCH = `
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

  const numSquares = Math.floor(map(S.length, 0, 100, 40, 300));
  let size = Math.min(width, height) * 0.9;
  const shrinkFactor = map(S.dynamicRange, 0, 100, 0.92, 1.08);
  const rotationStep = map(S.aggression, 0, 100, 0.01, 0.07);
  const strokeMin = map(S.volume, 0, 100, 1.0, 6.0);
  const strokeMax = map(S.bass, 0, 100, 2.0, 8.0);

  const colors = [];
  for (let i = 0; i < 5; i++) {
    const baseHue = (S.hue + i * 60 + random() * 20) % 360;
    const sat = constrain(map(S.treble, 0, 100, 60, 95), 50, 100);
    const bri = constrain(map(S.brightness, 0, 100, 40, 85), 30, 90);
    colors.push(hslColor(baseHue, sat, bri));
  }

  noFill();
  translate(width / 2, height / 2);

  let angle = 0;
  for (let i = 0; i < numSquares; i++) {
    const strokeW = strokeMin + (i / numSquares) * (strokeMax - strokeMin);
    strokeWeight(strokeW);
    stroke(colors[i % colors.length]);

    push();
    rotate(angle);
    rect(-size / 2, -size / 2, size, size);
    pop();

    angle += rotationStep;
    size *= shrinkFactor;
    if (size < 4) break;
  }
}

function hslColor(h, s, l) {
  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}
`;

export default SQUARES_SKETCH;
