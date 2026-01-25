export const DUAL_VORTEX_SKETCH = `
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

  const presence = 1.0 - S.silence / 100;
  const sizeFactor = (S.length * 0.7 + S.volume * 0.6);
  const layers = Math.floor(map(S.length, 0, 100, 60, 180));
  const baseR = map(sizeFactor, 0, 100, Math.min(width, height) * 0.15, Math.min(width, height) * 0.55);
  const steps = Math.floor(map(S.attack, 0, 100, 180, 480));
  const twist = map(S.harmonicity, 0, 100, 0.5, 3.5);
  const bulge = map(S.aggression, 0, 100, 0.05, 0.55);
  const waveF = map(S.rhythmicity, 0, 100, 0.8, 5.0);
  const CY = height * 0.5 + map(S.bass, 0, 100, -height * 0.1, height * 0.1);
  const wBase = map(S.volume, 0, 100, 1.5, 6.0);
  const alphaLo = map(S.dynamicRange, 0, 100, 80, 180) * presence;
  const alphaHi = map(S.dynamicRange, 0, 100, 180, 255) * presence;

  const mainHue = (S.brightness * 3.6) % 360;
  
  noFill();

  for (let pass = 0; pass < 2; pass++) {
    const isSecond = pass === 0;
    const alphaScale = isSecond ? 0.7 : 1.0;
    const weightScale = isSecond ? 0.85 : 1.1;
    
    for (let i = 0; i < layers; i++) {
      const t = i / (layers - 1);
      const h = (mainHue + i * 22.5) % 360;
      const sat = map(S.treble, 0, 100, 60, 90);
      const bri = map(S.bass, 0, 100, 70, 95);
      
      const r0 = baseR * (0.6 + (isSecond ? 0.8 : 0.7) * sin(PI * 2 * t + 0.42));
      const rot = t * (twist + 0.6) + sin(i * 0.05) * map(S.attack, 0, 100, 0.02, 0.12);
      
      const hueShift = (i / layers) * 120;
      const finalH = (h + hueShift) % 360;
      const a = lerp(alphaHi, alphaLo, pow(t, 0.9)) * alphaScale / 255;
      
      push();
      translate(width * 0.5, CY);
      rotate(rot);
      
      strokeWeight(max(0.6, wBase * weightScale));
      stroke('hsla(' + finalH + ',' + sat + '%,' + bri + '%,' + constrain(a, 0, 1) + ')');
      
      beginShape();
      for (let k = 0; k <= steps; k++) {
        const ang = map(k, 0, steps, 0, PI * 2);
        const baseRR = r0 * (1.0 + bulge * sin(ang * waveF + t * PI * 3));
        vertex(baseRR * cos(ang), baseRR * sin(ang));
      }
      endShape(CLOSE);
      pop();
    }
  }
}
`;

export default DUAL_VORTEX_SKETCH;
