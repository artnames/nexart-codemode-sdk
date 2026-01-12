export const ORB_SKETCH = `
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

  const cx = width / 2 + map(S.dynamicRange, 0, 100, -150, 150);
  const cy = height / 2 + map(S.rhythmicity, 0, 100, -100, 100);
  const baseRadius = map(S.length, 0, 100, 240, 1200);
  const steps = Math.round(map(S.rhythmicity, 0, 100, 280, 400));
  const baseHue = map(S.hue, 0, 100, 0, 360);
  const hue1 = baseHue;
  const hue2 = (baseHue + map(S.attack, 0, 100, 80, 180)) % 360;

  noStroke();

  for (let i = steps; i > 0; i--) {
    const pct = i / steps;
    const r = baseRadius * pct * map(S.aggression, 0, 100, 0.92, 1.06);
    const t = pow(pct, map(S.brightness, 0, 100, 1.8, 2.8));
    const h = (lerp(hue1, hue2, t) + pct * map(S.harmonicity, 0, 100, -15, 15) + sin(pct * PI * 3) * map(S.brightness, 0, 100, -12, 12)) % 360;
    const sat = constrain(70 + map(S.treble, 0, 100, -20, 20), 0, 100);
    const bri = constrain(lerp(90, 30, t) + map(S.brightness, 0, 100, -6, 4), 0, 100);
    const alpha = (map(pct, 1, 0, 18, 70) + sin(i * 0.15) * map(S.treble, 0, 100, 1, 4)) * map(S.volume, 0, 100, 0.8, 1.1) * 1.2;
    
    fill(hslColor(h, sat, bri, constrain(alpha / 100, 0, 1)));
    
    const rx = r * map(S.aggression, 0, 100, 0.9, 1.05);
    const ry = r * map(S.aggression, 0, 100, 0.9, 1.05);
    const angle = pct * PI * map(S.rhythmicity, 0, 100, 2, 4);
    const wobbleAmp = map(S.aggression, 0, 100, 10, 40);
    const wobbleX = sin(angle) * wobbleAmp;
    const wobbleY = cos(angle) * wobbleAmp;
    
    ellipse(cx + wobbleX, cy + wobbleY, rx * 2, ry * 2);
  }
}

function hslColor(h, s, l, a) {
  if (a !== undefined) return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}
`;

export default ORB_SKETCH;
