export const RESONANT_SOUND_BODIES_SKETCH = `
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
  const maxR = min(width, height) * 0.45;
  const shapeSeed = S.bass * 17.3 + S.treble * 23.7 + S.rhythmicity * 11.1;

  const numBodies = Math.floor(8 + (S.volume / 100) * 12 + (S.bass / 100) * 8);
  
  noFill();

  for (let i = 0; i < numBodies; i++) {
    const t = i / numBodies;
    const radius = maxR * (0.15 + t * 0.85);
    
    const hue = (((S.hue / 100) + t * 0.3 + (S.harmonicity / 100) * 0.2) % 1) * 360;
    const sat = lerp(50, 80, S.brightness / 100);
    const lum = lerp(30, 60, S.brightness / 100);
    
    const alpha = lerp(0.4, 0.15, t) * (0.5 + (S.volume / 100) * 0.5);
    stroke('hsla(' + hue + ',' + sat + '%,' + lum + '%,' + alpha + ')');
    strokeWeight(lerp(3, 1, t) * (1 + (S.aggression / 100) * 2));
    
    beginShape();
    const points = Math.floor(64 + (S.aggression / 100) * 64);
    
    for (let j = 0; j <= points; j++) {
      const angle = (j / points) * PI * 2;
      
      const wobble = noise(
        cos(angle) * 3 + i * 0.5 + shapeSeed * 0.001,
        sin(angle) * 3 + i * 0.5
      );
      
      const bassWobble = sin(angle * (2 + Math.floor((S.bass / 100) * 6))) * (S.bass / 100) * 0.15;
      const trebleWobble = sin(angle * (8 + Math.floor((S.treble / 100) * 12))) * (S.treble / 100) * 0.08;
      
      const r = radius * (1 + (wobble - 0.5) * 0.3 * (S.aggression / 100) + bassWobble + trebleWobble);
      
      const x = cx + cos(angle) * r;
      const y = cy + sin(angle) * r;
      
      vertex(x, y);
    }
    endShape(CLOSE);
    
    if (i % 3 === 0) {
      const fillAlpha = alpha * 0.1;
      fill('hsla(' + hue + ',' + sat + '%,' + lum + '%,' + fillAlpha + ')');
      beginShape();
      for (let j = 0; j <= points; j++) {
        const angle = (j / points) * PI * 2;
        const wobble = noise(cos(angle) * 3 + i * 0.5 + shapeSeed * 0.001, sin(angle) * 3 + i * 0.5);
        const bodyR = radius * (1 + (wobble - 0.5) * 0.3 * (S.aggression / 100));
        vertex(cx + cos(angle) * bodyR, cy + sin(angle) * bodyR);
      }
      endShape(CLOSE);
      noFill();
    }
  }

  const numNodes = Math.floor(12 + (S.rhythmicity / 100) * 20);
  for (let i = 0; i < numNodes; i++) {
    const angle = (i / numNodes) * PI * 2 + shapeSeed * 0.001;
    const dist = maxR * (0.3 + noise(i * 0.1, shapeSeed * 0.001) * 0.6);
    
    const x = cx + cos(angle) * dist;
    const y = cy + sin(angle) * dist;
    
    const nodeSize = lerp(2, 8, S.volume / 100) * (1 + (S.bass / 100) * 2);
    const hue = ((((S.hue / 100) + i * 0.05 + (S.treble / 100) * 0.3) % 1)) * 360;
    
    fill('hsla(' + hue + ',70%,' + lerp(40, 70, S.brightness / 100) + '%,' + lerp(0.3, 0.7, S.harmonicity / 100) + ')');
    noStroke();
    ellipse(x, y, nodeSize * 2, nodeSize * 2);
  }
}
`;

export default RESONANT_SOUND_BODIES_SKETCH;
