export const ISOFLOW_SKETCH = `
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

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = min(width, height) * 0.6;
  const layers = 3;
  const burstsPerLayer = Math.floor(map(S.rhythmicity, 0, 100, 20, 40));

  noFill();

  for (let l = 0; l < layers; l++) {
    const hue = map(l === 0 ? S.bass : (l === 1 ? S.brightness : S.treble), 0, 100, 0, 360);
    const alpha = map(l === 0 ? S.volume : (l === 1 ? S.aggression : S.dynamicRange), 0, 100, 0.7, 1);
    const sat = 85 + random() * 15;
    
    stroke('hsla(' + hue + ',' + sat + '%,95%,' + alpha + ')');
    strokeWeight(map(S.volume + l * 10, 0, 130, 1.2, 4.8));
    
    const radiusScale = map(S.dynamicRange + l * 20, 0, 150, 0.8, 1.4);
    const noiseAmp = map(S.aggression, 0, 100, 0.5, 3.0);
    const swirl = map(S.treble + l * 20, 0, 150, 0.3, 1.5);
    const rotSkew = map(S.harmonicity, 0, 100, -0.5, 0.5);
    const deformSkew = map(S.attack, 0, 100, -PI * 0.4, PI * 0.4);
    const centerJitter = map(S.bass, 0, 100, -60, 60);

    for (let b = 0; b < burstsPerLayer; b++) {
      const baseAngle = map(b + l * burstsPerLayer, 0, layers * burstsPerLayer, 0, PI * 2);
      const burstCount = Math.floor(map(S.volume + S.rhythmicity, 0, 200, 30, 90));
      
      for (let j = 0; j < burstCount; j++) {
        const angle = baseAngle + map(j, 0, burstCount, -0.02, 0.02);
        const ox = cx + cos(angle) * centerJitter;
        const oy = cy + sin(angle) * centerJitter;
        
        beginShape();
        for (let r0 = 0; r0 < maxRadius * radiusScale; r0 += 3) {
          const normR = r0 / maxRadius;
          const n = noise(cos(angle + rotSkew) * normR * noiseAmp, sin(angle + swirl) * normR * noiseAmp);
          const deform = map(n, 0, 1, -PI * swirl, PI * swirl) + deformSkew;
          const px = ox + cos(angle + deform) * r0;
          const py = oy + sin(angle + deform) * r0;
          vertex(px, py);
        }
        endShape();
      }
    }
  }
}
`;

export default ISOFLOW_SKETCH;
