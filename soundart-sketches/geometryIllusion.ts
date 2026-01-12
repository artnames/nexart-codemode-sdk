export const GEOMETRY_ILLUSION_SKETCH = `
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

  const hueBase = map(S.hue, 0, 100, 0, 360);
  const hueVar = map(S.treble, 0, 100, 20, 240);
  const sizeScale = map(S.volume, 0, 100, 0.05, 1.8);
  const rotAmt = map(S.aggression, 0, 100, 0, PI / 3);
  const layers = Math.floor(map(S.length, 0, 100, 120, 900));
  const alphaLevel = map(S.amplitude, 0, 100, 0.25, 1.3);
  const lineCount = Math.floor(map(S.rhythmicity, 0, 100, 40, 600));
  const strokeW = map(S.attack, 0, 100, 0.5, 6.5);
  const distort = map(S.harmonicity, 0, 100, 0, 70);
  const bias = map(S.mid, 0, 100, 0, 1);
  const bright = map(S.brightness, 0, 100, 0.4, 2.2);
  const sat = map(S.chroma, 0, 100, 0.4, 5.4);
  const cont = map(S.dynamicRange, 0, 100, 0.5, 3.4);
  const layerDepth = map(S.harmonicity, 0, 100, 0.2, 2.2);

  const baseScale = map(S.volume, 0, 100, 0.5, 1.1);
  const densityScale = map(S.length, 0, 100, 0.9, 0.7);
  const scaleFactor = constrain(baseScale * densityScale, 0.6, 1.0);

  translate(width / 2, height / 2);
  scale(scaleFactor, scaleFactor);

  const combined = S.rhythmicity * 0.6 + S.harmonicity * 0.4;
  const spacingFactor = map(combined, 0, 100, 2.5, 0.3);
  const spacingAmp = map(S.volume, 0, 100, 0.3, 1.2);

  for (let i = 0; i < layers; i++) {
    push();
    rotate((random() - 0.5) * rotAmt * 2);
    
    const w = random() * width * sizeScale;
    const h = random() * height * sizeScale;
    
    translate(
      (random() - 0.5) * width * spacingFactor * spacingAmp,
      (random() - 0.5) * height * spacingFactor * spacingAmp
    );

    const hue = (hueBase + random() * hueVar - hueVar / 2 + 360) % 360;
    const fillSat = constrain(60 * sat, 0, 100);
    const fillLight = constrain(60 * bright * cont, 0, 100);
    const strokeLight = constrain(30 * cont, 0, 100);

    fill(hslColor(hue, fillSat, fillLight, alphaLevel * layerDepth));
    stroke(hslColor(hue, fillSat * 0.6, strokeLight, alphaLevel));
    strokeWeight(strokeW);

    const rectW = w * (bias > 0.5 ? lerp(0.5, 1.0, random()) : lerp(0.1, 0.5, random()));
    const rectH = h * (bias < 0.5 ? lerp(0.5, 1.0, random()) : lerp(0.1, 0.5, random()));

    rect(
      -rectW / 2 + (random() - 0.5) * distort,
      -rectH / 2 + (random() - 0.5) * distort,
      rectW,
      rectH
    );
    pop();
  }

  noFill();
  stroke(hslColor(hueBase, 25, 75, 0.25));
  strokeWeight(1);
  for (let i = 0; i < lineCount; i++) {
    const x1 = random() * width - width / 2;
    const y1 = random() * height - height / 2;
    const x2 = x1 + lerp(-100, 100, random());
    const y2 = y1 + lerp(-100, 100, random());
    line(x1, y1, x2, y2);
  }
}

function hslColor(h, s, l, a) {
  if (a !== undefined) return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}
`;

export default GEOMETRY_ILLUSION_SKETCH;
