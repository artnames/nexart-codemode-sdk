export const CHLADNI_BLOOM_SKETCH = `
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

  translate(width / 2, height / 2);
  
  const layers = Math.floor(map(S.volume + S.rhythmicity, 0, 200, 20, 90));
  const minStrokeW = map(S.volume, 0, 100, 1.0, 3.0);
  const maxStrokeW = map(S.treble, 0, 100, 2.0, 5.0);

  noFill();

  for (let i = 0; i < layers; i++) {
    const freq1 = Math.floor(map(S.aggression + random() * 50, 0, 150, 3, 20));
    const freq2 = Math.floor(map(S.treble + random() * 50, 0, 150, 2, 8));
    const amp = map(S.dynamicRange + random() * 30, 0, 130, 60, 400);
    const rotation = map(S.harmonicity + random() * 50, 0, 150, 0, PI * 4);
    const radiusOffset = map(S.bass, 0, 100, 40, 80);
    const strokeW = map(S.treble + S.volume * 0.5, 0, 100, minStrokeW, maxStrokeW);
    
    const hBase = (330 + random() * 100) % 360;
    const finalH = (hBase + (random() * 40 - 60) + map(S.hue, 0, 100, -10, 10) + 360) % 360;
    const finalC = constrain(85 + map(S.brightness, 0, 100, -20, 20), 0, 100);
    const finalL = constrain(90 + map(S.brightness, 0, 100, -15, 15), 0, 100);
    const finalA = constrain(0.5 + map(S.attack, 0, 100, 0, 0.5), 0.3, 1);

    push();
    rotate(rotation);
    strokeWeight(strokeW);
    stroke('hsla(' + finalH + ',' + finalC + '%,' + finalL + '%,' + finalA + ')');
    
    const angleStep = map(S.treble, 0, 100, 0.07, 0.03);
    beginShape();
    for (let aa = 0; aa < PI * 2; aa += angleStep) {
      const rad = radiusOffset * i + amp * sin(freq1 * aa) * cos(freq2 * aa * map(S.rhythmicity, 0, 100, 0.3, 2));
      const x = rad * cos(aa);
      const y = rad * sin(aa);
      vertex(x, y);
    }
    endShape(CLOSE);
    pop();
  }
}
`;

export default CHLADNI_BLOOM_SKETCH;
