var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// soundart-sketches/rings.ts
var RINGS_SKETCH;
var init_rings = __esm({
  "soundart-sketches/rings.ts"() {
    RINGS_SKETCH = `
// Flow Grid Rings - SoundArt Style
// Uses S.* sound globals and standard p5-like functions

function setup() {
  // Set background based on mode (rgb derived from sound, black, or white)
  const bgMode = typeof backgroundMode !== 'undefined' ? backgroundMode : 'rgb';
  
  if (bgMode === 'white') {
    background(245, 245, 245);
  } else if (bgMode === 'black') {
    background(10, 10, 10);
  } else {
    // Deterministic RGB background derived from sound snapshot
    // Previously used clock time, now uses sound parameters for reproducibility
    const r = Math.floor((S.brightness / 100) * 255);
    const g = Math.floor((S.rhythmicity / 100) * 255);
    const b = Math.floor((S.harmonicity / 100) * 255);
    background(r, g, b);
  }
  
  // Grid dimensions based on sound volume
  const cols = Math.floor(map(S.volume, 0, 100, 2, 32));
  const rows = Math.floor(cols * 1.5);
  const margin = map(S.length, 0, 100, width * 0.05, width * 0.1);
  const innerW = width - margin * 2;
  const innerH = height - margin * 2;
  const cellW = innerW / cols;
  const cellH = innerH / rows;
  const gap = Math.min(cellW, cellH) * 0.25;
  const maxRadius = (Math.min(cellW, cellH) - gap) / 2;
  
  // Palette Harmony based on sound
  const mainHue = (S.brightness * 3.6) % 360;
  const hueShift = map(S.harmonicity, 0, 100, 20, 60);
  const sat = map(S.treble, 0, 100, 60, 90);
  const bri = map(S.bass, 0, 100, 70, 95);
  
  // Generate palette
  const palette = [
    hslColor(mainHue, sat, bri),
    hslColor((mainHue + hueShift) % 360, sat - 10, bri + 5),
    hslColor((mainHue - hueShift + 360) % 360, sat - 10, bri + 5),
    hslColor((mainHue + 180) % 360, sat - 20, bri - 10),
    hslColor((mainHue + 120) % 360, sat, bri - 5),
    hslColor((mainHue + 240) % 360, sat, bri - 5),
  ];
  
  // Flow field parameters
  const noiseScale = 0.15;
  const noiseStrength = map(S.aggression, 0, 100, 0.5, 4.0);
  const jitter = map(S.rhythmicity, 0, 100, 0, 0.15);
  const ringBias = map(S.attack, 0, 100, 0.85, 1.15);
  
  noStroke();
  
  // Render Grid
  for (let gx = 0; gx < cols; gx++) {
    for (let gy = 0; gy < rows; gy++) {
      const cx = margin + gx * cellW + cellW / 2 + (random() - 0.5) * jitter * cellW;
      const cy = margin + gy * cellH + cellH / 2 + (random() - 0.5) * jitter * cellH;
      
      const n = noise(gx * noiseScale, gy * noiseScale);
      const angle = n * PI * 2 * noiseStrength;
      const rings = Math.max(1, Math.floor(map(sin(angle), -1, 1, 1, 6)));
      const step = (maxRadius / rings) * ringBias * 0.9;
      
      for (let i = rings; i > 0; i--) {
        fill(palette[(rings - i) % palette.length]);
        ellipse(cx, cy, i * step * 2, i * step * 2);
      }
    }
  }
}

// Helper function for HSL colors
function hslColor(h, s, l) {
  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}
`;
  }
});

// soundart-sketches/pixelGlyphs.ts
var PIXEL_GLYPHS_SKETCH;
var init_pixelGlyphs = __esm({
  "soundart-sketches/pixelGlyphs.ts"() {
    PIXEL_GLYPHS_SKETCH = `
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

  const cols = Math.floor(map(S.length, 0, 100, 2, 18));
  const rows = Math.floor(map(S.length, 0, 100, 3, 24));
  const density = map(S.volume, 0, 100, 0.25, 0.6);
  const jitter = map(S.attack, 0, 100, 0, 0.25);
  const sparkRate = map(S.treble, 0, 100, 0.05, 0.45);
  const invertRate = map(S.dynamicRange, 0, 100, 0.05, 0.35);

  const margin = 140, gutter = 20, glyphRes = 7;
  const P = [[11,16,38],[255,51,102],[0,224,255],[255,209,102],[124,255,178],[138,43,226]];
  const cellW = (width - margin*2 - gutter*(cols - 1)) / cols;
  const cellH = (height - margin*2 - gutter*(rows - 1)) / rows;
  if (cellW <= 0 || cellH <= 0) return;

  noStroke();

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const cx = margin + gx * (cellW + gutter);
      const cy = margin + gy * (cellH + gutter);
      const invert = noise(gx * 0.4, gy * 0.3) < invertRate;
      const baseA = map(S.amplitude, 0, 100, 0.8, 1.0);
      const rndVal = noise(gx * 0.5, gy * 0.7);
      const baseIdx = 1 + Math.floor(rndVal * 5);
      const accentIdx = 1 + Math.floor(noise(gx + 3.3, gy + 4.4) * 5);
      const baseCol = invert ? [240, 245, 255] : P[baseIdx];
      const accCol = invert ? P[baseIdx] : P[accentIdx];

      const px = Math.floor((cellW * 0.84) / glyphRes);
      const py = Math.floor((cellH * 0.84) / glyphRes);
      const gw = px * glyphRes, gh = py * glyphRes;
      const ox = cx + Math.floor((cellW - gw) * 0.5);
      const oy = cy + Math.floor((cellH - gh) * 0.5);

      for (let j = 0; j < glyphRes; j++) {
        for (let i = 0; i < Math.ceil(glyphRes / 2); i++) {
          const pNoise = noise(gx * 0.51 + i * 0.19, gy * 0.47 + j * 0.21);
          const p = density + (pNoise - 0.5) * 0.35;
          if (random() < constrain(p, 0.05, 0.9)) {
            const jx = Math.floor((random() - 0.5) * jitter * px);
            const jy = Math.floor((random() - 0.5) * jitter * py);
            const x0 = ox + i * px + jx;
            const y0 = oy + j * py + jy;
            
            fill(baseCol[0], baseCol[1], baseCol[2], baseA * 255);
            rect(x0, y0, px, py);
            const mi = glyphRes - 1 - i;
            rect(ox + mi * px - jx, y0, px, py);
            
            if (random() < sparkRate) {
              fill(accCol[0], accCol[1], accCol[2], baseA * 255);
              rect(x0 + px * 0.2, y0 + py * 0.2, px * 0.6, py * 0.6);
            }
          }
        }
      }
    }
  }
}
`;
  }
});

// soundart-sketches/radialBurst.ts
var RADIAL_BURST_SKETCH;
var init_radialBurst = __esm({
  "soundart-sketches/radialBurst.ts"() {
    RADIAL_BURST_SKETCH = `
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

  const centerX = width / 2;
  const centerY = height / 2;
  const baseN = Math.floor(map(S.rhythmicity, 0, 100, 90, 320));
  const rhythmMask = 0.4 + (S.rhythmicity / 100) * 0.6;

  const palette = [];
  const mainHue = (S.brightness * 3.6) % 360;
  for (let i = 0; i < 16; i++) {
    const h = (mainHue + i * 22.5) % 360;
    const sat = map(S.treble, 0, 100, 60, 90);
    const bri = map(S.bass, 0, 100, 70, 95);
    palette.push('hsl(' + h + ',' + sat + '%,' + bri + '%)');
  }

  noFill();

  for (let i = 0; i < baseN; i++) {
    if ((i % 3) && random() > rhythmMask) continue;

    const angle = (i / baseN) * PI * 2;
    const col = palette[i % palette.length];

    const lenJit = map(S.dynamicRange, 0, 100, 0, height * 2.45);
    const rayLength = (S.amplitude / 100) * (height * 1.65) + random() * lenJit;

    const waveAmp = map(S.harmonicity, 0, 100, 0, 42);
    const waveFreq = map(S.treble, 0, 100, 1, 48);
    const segments = 28;

    const thickness = 1.2 + (S.attack / 100) * 7 + (S.aggression / 100) * 5 + sin(i * 0.9) * 1.4;

    stroke(col);
    strokeWeight(thickness);

    beginShape();
    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      const radius = t * rayLength;
      const wobble = sin(t * PI * waveFreq + i * 0.2) * waveAmp * (1 - t);
      const wx = centerX + cos(angle + wobble * 0.01) * radius;
      const wy = centerY + sin(angle + wobble * 0.01) * radius;
      vertex(wx, wy);
    }
    endShape();
  }
}
`;
  }
});

// soundart-sketches/orb.ts
var ORB_SKETCH;
var init_orb = __esm({
  "soundart-sketches/orb.ts"() {
    ORB_SKETCH = `
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
  }
});

// soundart-sketches/waveStripes.ts
var WAVE_STRIPES_SKETCH;
var init_waveStripes = __esm({
  "soundart-sketches/waveStripes.ts"() {
    WAVE_STRIPES_SKETCH = `
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
  }
});

// soundart-sketches/squares.ts
var SQUARES_SKETCH;
var init_squares = __esm({
  "soundart-sketches/squares.ts"() {
    SQUARES_SKETCH = `
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
  }
});

// soundart-sketches/loomWeave.ts
var LOOM_WEAVE_SKETCH;
var init_loomWeave = __esm({
  "soundart-sketches/loomWeave.ts"() {
    LOOM_WEAVE_SKETCH = `
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
  }
});

// soundart-sketches/noiseTerraces.ts
var NOISE_TERRACES_SKETCH;
var init_noiseTerraces = __esm({
  "soundart-sketches/noiseTerraces.ts"() {
    NOISE_TERRACES_SKETCH = `
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

  const levels = Math.floor(map(S.harmonicity, 0, 100, 6, 16));
  const res = Math.floor(map(S.brightness, 0, 100, 3, 10));

  const mainHue = (S.brightness * 3.6) % 360;
  const palette = [];
  for (let i = 0; i < 16; i++) {
    const h = (mainHue + i * 22.5) % 360;
    const sat = map(S.treble, 0, 100, 60, 90);
    const bri = map(S.bass, 0, 100, 70, 95);
    palette.push([h, sat, bri]);
  }

  noStroke();

  for (let lvl = 0; lvl < levels; lvl++) {
    const iso = lvl / levels;
    const [h, sat, bri] = palette[lvl % palette.length];
    const satBoost = map(S.treble, 0, 100, 1.0, 1.4);
    const alpha = lerp(0.95, 0.5, iso) * map(S.volume, 0, 100, 0.5, 1.0);
    
    fill(hslColor(h, constrain(sat * satBoost, 0, 100), bri, alpha));
    
    const scale = 0.012 + lvl * 0.0025;
    for (let x = 0; x < width; x += res) {
      for (let y = 0; y < height; y += res) {
        if (noise(x * scale, y * scale) > iso * map(S.rhythmicity, 0, 100, 3.4, 8.3)) {
          const rw = res * (0.9 + random() * 0.3);
          const rh = res * (0.9 + random() * 0.3);
          rect(x, y, rw, rh);
        }
      }
    }
  }
}

function hslColor(h, s, l, a) {
  if (a !== undefined) return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}
`;
  }
});

// soundart-sketches/prismFlowFields.ts
var PRISM_FLOW_FIELDS_SKETCH;
var init_prismFlowFields = __esm({
  "soundart-sketches/prismFlowFields.ts"() {
    PRISM_FLOW_FIELDS_SKETCH = `
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
  }
});

// soundart-sketches/chladniBloom.ts
var CHLADNI_BLOOM_SKETCH;
var init_chladniBloom = __esm({
  "soundart-sketches/chladniBloom.ts"() {
    CHLADNI_BLOOM_SKETCH = `
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
  }
});

// soundart-sketches/dualVortex.ts
var DUAL_VORTEX_SKETCH;
var init_dualVortex = __esm({
  "soundart-sketches/dualVortex.ts"() {
    DUAL_VORTEX_SKETCH = `
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
  }
});

// soundart-sketches/isoflow.ts
var ISOFLOW_SKETCH;
var init_isoflow = __esm({
  "soundart-sketches/isoflow.ts"() {
    ISOFLOW_SKETCH = `
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
  }
});

// soundart-sketches/geometryIllusion.ts
var GEOMETRY_ILLUSION_SKETCH;
var init_geometryIllusion = __esm({
  "soundart-sketches/geometryIllusion.ts"() {
    GEOMETRY_ILLUSION_SKETCH = `
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
  }
});

// soundart-sketches/resonantSoundBodies.ts
var RESONANT_SOUND_BODIES_SKETCH;
var init_resonantSoundBodies = __esm({
  "soundart-sketches/resonantSoundBodies.ts"() {
    RESONANT_SOUND_BODIES_SKETCH = `
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
  }
});

// soundart-sketches/index.ts
var soundart_sketches_exports = {};
__export(soundart_sketches_exports, {
  CHLADNI_BLOOM_SKETCH: () => CHLADNI_BLOOM_SKETCH,
  DUAL_VORTEX_SKETCH: () => DUAL_VORTEX_SKETCH,
  GEOMETRY_ILLUSION_SKETCH: () => GEOMETRY_ILLUSION_SKETCH,
  ISOFLOW_SKETCH: () => ISOFLOW_SKETCH,
  LOOM_WEAVE_SKETCH: () => LOOM_WEAVE_SKETCH,
  NOISE_TERRACES_SKETCH: () => NOISE_TERRACES_SKETCH,
  ORB_SKETCH: () => ORB_SKETCH,
  PIXEL_GLYPHS_SKETCH: () => PIXEL_GLYPHS_SKETCH,
  PRISM_FLOW_FIELDS_SKETCH: () => PRISM_FLOW_FIELDS_SKETCH,
  RADIAL_BURST_SKETCH: () => RADIAL_BURST_SKETCH,
  RESONANT_SOUND_BODIES_SKETCH: () => RESONANT_SOUND_BODIES_SKETCH,
  RINGS_SKETCH: () => RINGS_SKETCH,
  SOUNDART_SKETCHES: () => SOUNDART_SKETCHES,
  SQUARES_SKETCH: () => SQUARES_SKETCH,
  WAVE_STRIPES_SKETCH: () => WAVE_STRIPES_SKETCH,
  getAvailableSoundArtSketches: () => getAvailableSoundArtSketches,
  getSoundArtSketch: () => getSoundArtSketch,
  isSoundArtSketchAvailable: () => isSoundArtSketchAvailable
});
function getSoundArtSketch(name) {
  return SOUNDART_SKETCHES[name];
}
function getAvailableSoundArtSketches() {
  return Object.keys(SOUNDART_SKETCHES);
}
function isSoundArtSketchAvailable(name) {
  return name in SOUNDART_SKETCHES;
}
var SOUNDART_SKETCHES;
var init_soundart_sketches = __esm({
  "soundart-sketches/index.ts"() {
    init_rings();
    init_pixelGlyphs();
    init_radialBurst();
    init_orb();
    init_waveStripes();
    init_squares();
    init_loomWeave();
    init_noiseTerraces();
    init_prismFlowFields();
    init_chladniBloom();
    init_dualVortex();
    init_isoflow();
    init_geometryIllusion();
    init_resonantSoundBodies();
    init_rings();
    init_pixelGlyphs();
    init_radialBurst();
    init_orb();
    init_waveStripes();
    init_squares();
    init_loomWeave();
    init_noiseTerraces();
    init_prismFlowFields();
    init_chladniBloom();
    init_dualVortex();
    init_isoflow();
    init_geometryIllusion();
    init_resonantSoundBodies();
    SOUNDART_SKETCHES = {
      rings: RINGS_SKETCH,
      pixelGlyphs: PIXEL_GLYPHS_SKETCH,
      radialBurst: RADIAL_BURST_SKETCH,
      orb: ORB_SKETCH,
      waveStripes: WAVE_STRIPES_SKETCH,
      squares: SQUARES_SKETCH,
      loomWeave: LOOM_WEAVE_SKETCH,
      noiseTerraces: NOISE_TERRACES_SKETCH,
      prismFlowFields: PRISM_FLOW_FIELDS_SKETCH,
      chladniBloom: CHLADNI_BLOOM_SKETCH,
      dualVortex: DUAL_VORTEX_SKETCH,
      isoflow: ISOFLOW_SKETCH,
      geometryIllusion: GEOMETRY_ILLUSION_SKETCH,
      resonantSoundBodies: RESONANT_SOUND_BODIES_SKETCH
    };
  }
});

// version.ts
var SDK_VERSION = "1.8.4";
var PROTOCOL_VERSION = "1.2.0";
var PROTOCOL_PHASE = 3;

// types.ts
var PROTOCOL_IDENTITY = {
  protocol: "nexart",
  engine: "codemode",
  protocolVersion: PROTOCOL_VERSION,
  phase: PROTOCOL_PHASE,
  deterministic: true
};
var DEFAULT_VARS = {
  VAR: Object.freeze([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
};
var DEFAULT_CONFIG = {
  width: 1950,
  height: 2400,
  duration: 2,
  fps: 30,
  minDuration: 1,
  maxDuration: 4
};

// execution-sandbox.ts
function createForbiddenStub(name) {
  const stub = function() {
    throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name}`);
  };
  return new Proxy(stub, {
    get(_target, prop) {
      if (prop === Symbol.toPrimitive || prop === "toString" || prop === "valueOf") {
        return () => {
          throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name}`);
        };
      }
      throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name}.${String(prop)}`);
    },
    apply() {
      throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name}()`);
    },
    construct() {
      throw new Error(`[Code Mode Protocol Error] Forbidden API: new ${name}()`);
    },
    set() {
      throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name} (assignment blocked)`);
    },
    has() {
      return true;
    }
  });
}
function createForbiddenObject(name) {
  return new Proxy({}, {
    get(_target, prop) {
      if (prop === Symbol.toPrimitive || prop === "toString" || prop === "valueOf") {
        return () => {
          throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name}`);
        };
      }
      throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name}.${String(prop)}`);
    },
    set() {
      throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name} (assignment blocked)`);
    },
    has() {
      return true;
    },
    apply() {
      throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name}()`);
    },
    construct() {
      throw new Error(`[Code Mode Protocol Error] Forbidden API: new ${name}()`);
    }
  });
}
var FORBIDDEN_APIS = {
  Date: createForbiddenStub("Date"),
  performance: createForbiddenObject("performance"),
  process: createForbiddenObject("process"),
  navigator: createForbiddenObject("navigator"),
  globalThis: createForbiddenObject("globalThis"),
  crypto: createForbiddenObject("crypto"),
  setTimeout: createForbiddenStub("setTimeout"),
  setInterval: createForbiddenStub("setInterval"),
  clearTimeout: createForbiddenStub("clearTimeout"),
  clearInterval: createForbiddenStub("clearInterval"),
  requestAnimationFrame: createForbiddenStub("requestAnimationFrame"),
  cancelAnimationFrame: createForbiddenStub("cancelAnimationFrame"),
  fetch: createForbiddenStub("fetch"),
  XMLHttpRequest: createForbiddenStub("XMLHttpRequest"),
  WebSocket: createForbiddenStub("WebSocket"),
  document: createForbiddenObject("document"),
  window: createForbiddenObject("window"),
  self: createForbiddenObject("self"),
  top: createForbiddenObject("top"),
  parent: createForbiddenObject("parent"),
  frames: createForbiddenObject("frames"),
  location: createForbiddenObject("location"),
  history: createForbiddenObject("history"),
  localStorage: createForbiddenObject("localStorage"),
  sessionStorage: createForbiddenObject("sessionStorage"),
  indexedDB: createForbiddenObject("indexedDB"),
  caches: createForbiddenObject("caches"),
  Notification: createForbiddenStub("Notification"),
  Worker: createForbiddenStub("Worker"),
  SharedWorker: createForbiddenStub("SharedWorker"),
  ServiceWorker: createForbiddenObject("ServiceWorker"),
  Blob: createForbiddenStub("Blob"),
  File: createForbiddenStub("File"),
  FileReader: createForbiddenStub("FileReader"),
  URL: createForbiddenStub("URL"),
  URLSearchParams: createForbiddenStub("URLSearchParams"),
  Headers: createForbiddenStub("Headers"),
  Request: createForbiddenStub("Request"),
  Response: createForbiddenStub("Response"),
  EventSource: createForbiddenStub("EventSource"),
  Image: createForbiddenStub("Image"),
  Audio: createForbiddenStub("Audio"),
  Video: createForbiddenStub("Video"),
  eval: createForbiddenStub("eval"),
  Function: createForbiddenStub("Function")
};
function createSafeMath() {
  const safeMath = Object.create(Math);
  Object.defineProperty(safeMath, "random", {
    get() {
      throw new Error("[Code Mode Protocol Error] Forbidden API: Math.random() \u2014 use random() instead (seeded)");
    },
    configurable: false,
    enumerable: true
  });
  return Object.freeze(safeMath);
}
var FORBIDDEN_API_NAMES = Object.keys(FORBIDDEN_APIS);
function buildSandboxContext(p5Runtime) {
  const safeMath = createSafeMath();
  const context = {
    ...FORBIDDEN_APIS,
    Math: safeMath
  };
  for (const key of Object.keys(p5Runtime)) {
    context[key] = p5Runtime[key];
  }
  return context;
}
function createSandboxedExecutor(code, additionalParams = []) {
  const forbiddenParamNames = Object.keys(FORBIDDEN_APIS);
  const allParams = [
    "context",
    "Math",
    ...forbiddenParamNames,
    ...additionalParams
  ];
  const wrappedCode = `
    "use strict";
    with(context) {
      ${code}
    }
  `;
  return new Function(...allParams, wrappedCode);
}
function executeSandboxed(code, p5Runtime, additionalContext = {}) {
  const safeMath = createSafeMath();
  const fullContext = {
    ...p5Runtime,
    ...additionalContext,
    Math: safeMath,
    ...FORBIDDEN_APIS
  };
  const forbiddenValues = Object.keys(FORBIDDEN_APIS).map((key) => FORBIDDEN_APIS[key]);
  const additionalParamNames = Object.keys(additionalContext);
  const additionalValues = Object.values(additionalContext);
  const executor = createSandboxedExecutor(code, additionalParamNames);
  executor(
    fullContext,
    safeMath,
    ...forbiddenValues,
    ...additionalValues
  );
}

// p5-runtime.ts
var CODE_MODE_PROTOCOL_VERSION = PROTOCOL_VERSION;
var CODE_MODE_PROTOCOL_PHASE = PROTOCOL_PHASE;
var CODE_MODE_ENFORCEMENT = "HARD";
function createSeededRNG(seed = 123456) {
  let a = seed >>> 0;
  return () => {
    a += 1831565813;
    let t = Math.imul(a ^ a >>> 15, a | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function createSeededNoise(seed = 0) {
  const permutation = [];
  const rng = createSeededRNG(seed);
  for (let i = 0; i < 256; i++) {
    permutation[i] = i;
  }
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  for (let i = 0; i < 256; i++) {
    permutation[256 + i] = permutation[i];
  }
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + t * (b - a);
  const grad = (hash, x, y, z) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };
  return (x, y = 0, z = 0) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    const A = permutation[X] + Y;
    const AA = permutation[A] + Z;
    const AB = permutation[A + 1] + Z;
    const B = permutation[X + 1] + Y;
    const BA = permutation[B] + Z;
    const BB = permutation[B + 1] + Z;
    return (lerp(
      lerp(
        lerp(grad(permutation[AA], x, y, z), grad(permutation[BA], x - 1, y, z), u),
        lerp(grad(permutation[AB], x, y - 1, z), grad(permutation[BB], x - 1, y - 1, z), u),
        v
      ),
      lerp(
        lerp(grad(permutation[AA + 1], x, y, z - 1), grad(permutation[BA + 1], x - 1, y, z - 1), u),
        lerp(grad(permutation[AB + 1], x, y - 1, z - 1), grad(permutation[BB + 1], x - 1, y - 1, z - 1), u),
        v
      ),
      w
    ) + 1) / 2;
  };
}
function createP5Runtime(canvas, width, height, config) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Failed to get 2D context");
  let currentFill = "rgba(255, 255, 255, 1)";
  let currentStroke = "rgba(0, 0, 0, 1)";
  let strokeEnabled = true;
  let fillEnabled = true;
  let currentStrokeWeight = 1;
  let colorModeSettings = { mode: "RGB", maxR: 255, maxG: 255, maxB: 255, maxA: 255 };
  let shapeVertices = [];
  let pixelData = null;
  let imageDataObj = null;
  let currentTextSize = 12;
  let currentTextFont = "sans-serif";
  let currentTextAlignH = "left";
  let currentTextAlignV = "alphabetic";
  let randomSeedValue = config?.seed ?? Math.floor(Math.random() * 2147483647);
  let rng = createSeededRNG(randomSeedValue);
  let noiseSeedValue = config?.seed ?? 0;
  let noiseFunc = createSeededNoise(noiseSeedValue);
  let noiseOctaves = 4;
  let noiseFalloff = 0.5;
  const parseCssColor = (str) => {
    const s = str.trim();
    if (s.startsWith("#")) {
      const hex = s.slice(1);
      if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return { r, g, b, a: 1 };
      } else if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return { r, g, b, a: 1 };
      } else if (hex.length === 8) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const a = parseInt(hex.slice(6, 8), 16) / 255;
        return { r, g, b, a };
      }
    }
    const rgbMatch = s.match(/^rgb\s*\(\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)\s*\)$/i);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3]),
        a: 1
      };
    }
    const rgbaMatch = s.match(/^rgba\s*\(\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\/\s]\s*([\d.]+)\s*\)$/i);
    if (rgbaMatch) {
      return {
        r: parseInt(rgbaMatch[1]),
        g: parseInt(rgbaMatch[2]),
        b: parseInt(rgbaMatch[3]),
        a: parseFloat(rgbaMatch[4])
      };
    }
    const hslMatch = s.match(/^hsla?\s*\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)%?\s*[,\s]\s*([\d.]+)%?\s*(?:[,\/\s]\s*([\d.]+))?\s*\)$/i);
    if (hslMatch) {
      const h = parseFloat(hslMatch[1]) / 360;
      const sat = parseFloat(hslMatch[2]) / 100;
      const l = parseFloat(hslMatch[3]) / 100;
      const a = hslMatch[4] ? parseFloat(hslMatch[4]) : 1;
      let r, g, b;
      if (sat === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p3, q2, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p3 + (q2 - p3) * 6 * t;
          if (t < 1 / 2) return q2;
          if (t < 2 / 3) return p3 + (q2 - p3) * (2 / 3 - t) * 6;
          return p3;
        };
        const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat;
        const p2 = 2 * l - q;
        r = hue2rgb(p2, q, h + 1 / 3);
        g = hue2rgb(p2, q, h);
        b = hue2rgb(p2, q, h - 1 / 3);
      }
      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
        a
      };
    }
    return null;
  };
  const parseColor = (...args) => {
    if (args.length === 0) return "rgba(0, 0, 0, 1)";
    const { mode, maxR, maxG, maxB, maxA } = colorModeSettings;
    if (args.length === 1) {
      const val = args[0];
      if (typeof val === "string") {
        const parsed = parseCssColor(val);
        if (parsed) {
          return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${parsed.a})`;
        }
        return val;
      }
      if (mode === "HSB") {
        return `hsla(${val}, 100%, 50%, 1)`;
      }
      const gray = Math.round(val / maxR * 255);
      return `rgba(${gray}, ${gray}, ${gray}, 1)`;
    }
    if (args.length === 2) {
      const [gray, alpha] = args;
      const g = Math.round(gray / maxR * 255);
      const a = alpha / maxA;
      return `rgba(${g}, ${g}, ${g}, ${a})`;
    }
    if (args.length === 3) {
      const [r, g, b] = args;
      if (mode === "HSB") {
        return `hsla(${r / maxR * 360}, ${g / maxG * 100}%, ${b / maxB * 100}%, 1)`;
      }
      return `rgba(${Math.round(r / maxR * 255)}, ${Math.round(g / maxG * 255)}, ${Math.round(b / maxB * 255)}, 1)`;
    }
    if (args.length === 4) {
      const [r, g, b, a] = args;
      if (mode === "HSB") {
        return `hsla(${r / maxR * 360}, ${g / maxG * 100}%, ${b / maxB * 100}%, ${a / maxA})`;
      }
      return `rgba(${Math.round(r / maxR * 255)}, ${Math.round(g / maxG * 255)}, ${Math.round(b / maxB * 255)}, ${a / maxA})`;
    }
    return "rgba(0, 0, 0, 1)";
  };
  const p = {
    width,
    height,
    frameCount: 0,
    // Constants
    PI: Math.PI,
    TWO_PI: Math.PI * 2,
    TAU: Math.PI * 2,
    HALF_PI: Math.PI / 2,
    QUARTER_PI: Math.PI / 4,
    // Shape mode constants
    CORNER: "corner",
    CENTER: "center",
    CORNERS: "corners",
    RADIUS: "radius",
    ROUND: "round",
    SQUARE: "butt",
    PROJECT: "square",
    MITER: "miter",
    BEVEL: "bevel",
    CLOSE: "close",
    PIE: "pie",
    CHORD: "chord",
    OPEN: "open",
    // Blend mode constants (v1.1)
    NORMAL: "source-over",
    ADD: "lighter",
    MULTIPLY: "multiply",
    SCREEN: "screen",
    // Text alignment constants
    LEFT: "left",
    RIGHT: "right",
    TOP: "top",
    BOTTOM: "bottom",
    BASELINE: "alphabetic",
    // Canvas operations
    background: (...args) => {
      ctx.save();
      ctx.fillStyle = parseColor(...args);
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    },
    clear: () => {
      ctx.clearRect(0, 0, width, height);
    },
    blendMode: (mode) => {
      const modeMap = {
        "source-over": "source-over",
        "NORMAL": "source-over",
        "lighter": "lighter",
        "ADD": "lighter",
        "multiply": "multiply",
        "MULTIPLY": "multiply",
        "screen": "screen",
        "SCREEN": "screen"
      };
      const compositeOp = modeMap[mode];
      if (!compositeOp) {
        throw new Error(`[Code Mode Protocol Error] Unsupported blend mode: ${mode}. Supported: NORMAL, ADD, MULTIPLY, SCREEN`);
      }
      ctx.globalCompositeOperation = compositeOp;
    },
    // Color functions
    fill: (...args) => {
      fillEnabled = true;
      currentFill = parseColor(...args);
      ctx.fillStyle = currentFill;
    },
    noFill: () => {
      fillEnabled = false;
    },
    stroke: (...args) => {
      strokeEnabled = true;
      currentStroke = parseColor(...args);
      ctx.strokeStyle = currentStroke;
    },
    noStroke: () => {
      strokeEnabled = false;
    },
    strokeWeight: (weight) => {
      currentStrokeWeight = weight;
      ctx.lineWidth = weight;
    },
    strokeCap: (cap) => {
      const capMap = {
        "round": "round",
        "ROUND": "round",
        "square": "butt",
        "SQUARE": "butt",
        "project": "square",
        "PROJECT": "square",
        "butt": "butt"
      };
      ctx.lineCap = capMap[cap] || "round";
    },
    strokeJoin: (join) => {
      const joinMap = {
        "miter": "miter",
        "MITER": "miter",
        "bevel": "bevel",
        "BEVEL": "bevel",
        "round": "round",
        "ROUND": "round"
      };
      ctx.lineJoin = joinMap[join] || "miter";
    },
    colorMode: (mode, max1, max2, max3, maxA) => {
      colorModeSettings = {
        mode: mode.toUpperCase(),
        maxR: max1 ?? 255,
        maxG: max2 ?? max1 ?? 255,
        maxB: max3 ?? max1 ?? 255,
        maxA: maxA ?? 255
      };
    },
    color: (...args) => parseColor(...args),
    lerpColor: (c1, c2, amt) => {
      const color1 = parseCssColor(c1) || { r: 0, g: 0, b: 0, a: 1 };
      const color2 = parseCssColor(c2) || { r: 255, g: 255, b: 255, a: 1 };
      const r = Math.round(color1.r + (color2.r - color1.r) * amt);
      const g = Math.round(color1.g + (color2.g - color1.g) * amt);
      const b = Math.round(color1.b + (color2.b - color1.b) * amt);
      const a = color1.a + (color2.a - color1.a) * amt;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    },
    red: (color) => {
      const parsed = parseCssColor(color);
      return parsed ? parsed.r : 0;
    },
    green: (color) => {
      const parsed = parseCssColor(color);
      return parsed ? parsed.g : 0;
    },
    blue: (color) => {
      const parsed = parseCssColor(color);
      return parsed ? parsed.b : 0;
    },
    alpha: (color) => {
      const parsed = parseCssColor(color);
      return parsed ? parsed.a * 255 : 255;
    },
    brightness: (color) => {
      const parsed = parseCssColor(color);
      if (!parsed) return 0;
      return Math.max(parsed.r, parsed.g, parsed.b) / 255 * 100;
    },
    saturation: (color) => {
      const parsed = parseCssColor(color);
      if (!parsed) return 0;
      const max = Math.max(parsed.r, parsed.g, parsed.b);
      const min = Math.min(parsed.r, parsed.g, parsed.b);
      if (max === 0) return 0;
      return (max - min) / max * 100;
    },
    hue: (color) => {
      const parsed = parseCssColor(color);
      if (!parsed) return 0;
      const { r, g, b } = parsed;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (max === min) return 0;
      let h = 0;
      const d = max - min;
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
      return h * 360;
    },
    // Shape functions
    ellipse: (x, y, w, h) => {
      const rw = w / 2;
      const rh = (h ?? w) / 2;
      ctx.beginPath();
      ctx.ellipse(x, y, rw, rh, 0, 0, Math.PI * 2);
      if (fillEnabled) ctx.fill();
      if (strokeEnabled) ctx.stroke();
    },
    circle: (x, y, d) => {
      p.ellipse(x, y, d, d);
    },
    rect: (x, y, w, h, r) => {
      const height2 = h ?? w;
      ctx.beginPath();
      if (r && r > 0) {
        ctx.roundRect(x, y, w, height2, r);
      } else {
        ctx.rect(x, y, w, height2);
      }
      if (fillEnabled) ctx.fill();
      if (strokeEnabled) ctx.stroke();
    },
    square: (x, y, s, r) => {
      p.rect(x, y, s, s, r);
    },
    line: (x1, y1, x2, y2) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      if (strokeEnabled) ctx.stroke();
    },
    point: (x, y) => {
      ctx.beginPath();
      ctx.arc(x, y, currentStrokeWeight / 2, 0, Math.PI * 2);
      ctx.fillStyle = currentStroke;
      ctx.fill();
    },
    triangle: (x1, y1, x2, y2, x3, y3) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      if (fillEnabled) ctx.fill();
      if (strokeEnabled) ctx.stroke();
    },
    quad: (x1, y1, x2, y2, x3, y3, x4, y4) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.closePath();
      if (fillEnabled) ctx.fill();
      if (strokeEnabled) ctx.stroke();
    },
    arc: (x, y, w, h, start, stop, mode) => {
      ctx.beginPath();
      ctx.ellipse(x, y, w / 2, h / 2, 0, start, stop);
      if (mode === "pie" || mode === "PIE") {
        ctx.lineTo(x, y);
        ctx.closePath();
      } else if (mode === "chord" || mode === "CHORD") {
        ctx.closePath();
      }
      if (fillEnabled) ctx.fill();
      if (strokeEnabled) ctx.stroke();
    },
    // Bezier and curve functions
    bezier: (x1, y1, cx1, cy1, cx2, cy2, x2, y2) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
      if (strokeEnabled) ctx.stroke();
    },
    curve: (x1, y1, x2, y2, x3, y3, x4, y4) => {
      const tension = 1 / 6;
      const cp1x = x2 + (x3 - x1) * tension;
      const cp1y = y2 + (y3 - y1) * tension;
      const cp2x = x3 - (x4 - x2) * tension;
      const cp2y = y3 - (y4 - y2) * tension;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x3, y3);
      if (strokeEnabled) ctx.stroke();
    },
    // Shape helpers (v1.1)
    polygon: (cx, cy, radius, sides, rotation = 0) => {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = rotation + i / sides * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      if (fillEnabled) ctx.fill();
      if (strokeEnabled) ctx.stroke();
    },
    star: (cx, cy, innerRadius, outerRadius, points, rotation = 0) => {
      ctx.beginPath();
      const totalPoints = points * 2;
      for (let i = 0; i < totalPoints; i++) {
        const angle = rotation + i / totalPoints * Math.PI * 2 - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      if (fillEnabled) ctx.fill();
      if (strokeEnabled) ctx.stroke();
    },
    // Vertex-based shapes
    beginShape: () => {
      shapeVertices = [];
    },
    vertex: (x, y) => {
      shapeVertices.push({ x, y, type: "vertex" });
    },
    curveVertex: (x, y) => {
      shapeVertices.push({ x, y, type: "curve" });
    },
    bezierVertex: (cx1, cy1, cx2, cy2, x, y) => {
      shapeVertices.push({ x, y, type: "bezier", cx1, cy1, cx2, cy2 });
    },
    endShape: (mode) => {
      if (shapeVertices.length === 0) return;
      ctx.beginPath();
      let started = false;
      let curveBuffer = [];
      const tension = 1 / 6;
      const flushCurveBuffer = () => {
        if (curveBuffer.length >= 4) {
          if (!started) {
            ctx.moveTo(curveBuffer[1].x, curveBuffer[1].y);
            started = true;
          } else {
            ctx.lineTo(curveBuffer[1].x, curveBuffer[1].y);
          }
          for (let i = 1; i < curveBuffer.length - 2; i++) {
            const p0 = curveBuffer[i - 1];
            const p1 = curveBuffer[i];
            const p2 = curveBuffer[i + 1];
            const p3 = curveBuffer[i + 2];
            const cp1x = p1.x + (p2.x - p0.x) * tension;
            const cp1y = p1.y + (p2.y - p0.y) * tension;
            const cp2x = p2.x - (p3.x - p1.x) * tension;
            const cp2y = p2.y - (p3.y - p1.y) * tension;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
          }
        }
        curveBuffer = [];
      };
      for (let i = 0; i < shapeVertices.length; i++) {
        const v = shapeVertices[i];
        if (v.type === "curve") {
          curveBuffer.push({ x: v.x, y: v.y });
        } else {
          if (curveBuffer.length > 0) {
            flushCurveBuffer();
          }
          if (v.type === "vertex") {
            if (!started) {
              ctx.moveTo(v.x, v.y);
              started = true;
            } else {
              ctx.lineTo(v.x, v.y);
            }
          } else if (v.type === "bezier" && started) {
            ctx.bezierCurveTo(v.cx1, v.cy1, v.cx2, v.cy2, v.x, v.y);
          }
        }
      }
      if (curveBuffer.length > 0) {
        flushCurveBuffer();
      }
      if (mode === "close" || mode === "CLOSE") {
        ctx.closePath();
      }
      if (fillEnabled) ctx.fill();
      if (strokeEnabled) ctx.stroke();
      shapeVertices = [];
    },
    // Transform functions
    push: () => {
      ctx.save();
    },
    pop: () => {
      ctx.restore();
      ctx.fillStyle = currentFill;
      ctx.strokeStyle = currentStroke;
      ctx.lineWidth = currentStrokeWeight;
    },
    translate: (x, y) => {
      ctx.translate(x, y);
    },
    rotate: (angle) => {
      ctx.rotate(angle);
    },
    scale: (sx, sy) => {
      ctx.scale(sx, sy ?? sx);
    },
    resetMatrix: () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    },
    shearX: (angle) => {
      ctx.transform(1, 0, Math.tan(angle), 1, 0, 0);
    },
    shearY: (angle) => {
      ctx.transform(1, Math.tan(angle), 0, 1, 0, 0);
    },
    // Math functions - SEEDED for determinism
    random: (min, max) => {
      if (Array.isArray(min)) {
        return min[Math.floor(rng() * min.length)];
      }
      if (min === void 0) return rng();
      if (max === void 0) return rng() * min;
      return min + rng() * (max - min);
    },
    randomSeed: (seed) => {
      randomSeedValue = seed;
      rng = createSeededRNG(seed);
    },
    randomGaussian: (mean = 0, sd = 1) => {
      const u1 = rng();
      const u2 = rng();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return z0 * sd + mean;
    },
    noise: (x, y, z) => {
      let total = 0;
      let frequency = 1;
      let amplitude = 1;
      let maxValue = 0;
      for (let i = 0; i < noiseOctaves; i++) {
        total += noiseFunc(x * frequency, (y ?? 0) * frequency, (z ?? 0) * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= noiseFalloff;
        frequency *= 2;
      }
      return total / maxValue;
    },
    noiseSeed: (seed) => {
      noiseSeedValue = seed;
      noiseFunc = createSeededNoise(seed);
    },
    noiseDetail: (lod, falloff) => {
      noiseOctaves = Math.max(1, Math.min(8, lod));
      if (falloff !== void 0) {
        noiseFalloff = Math.max(0, Math.min(1, falloff));
      }
    },
    // Noise extensions (v1.1) - use seeded noise internally
    fbm: (x, y, octaves = 4, falloff = 0.5) => {
      let total = 0;
      let frequency = 1;
      let amplitude = 1;
      let maxValue = 0;
      for (let i = 0; i < octaves; i++) {
        total += noiseFunc(x * frequency, y * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= falloff;
        frequency *= 2;
      }
      return total / maxValue;
    },
    ridgedNoise: (x, y) => {
      let total = 0;
      let frequency = 1;
      let amplitude = 1;
      let maxValue = 0;
      for (let i = 0; i < 4; i++) {
        const n = noiseFunc(x * frequency, y * frequency);
        total += (1 - Math.abs(n * 2 - 1)) * amplitude;
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
      }
      return total / maxValue;
    },
    curlNoise: (x, y) => {
      const eps = 1e-4;
      const n1 = noiseFunc(x + eps, y);
      const n2 = noiseFunc(x - eps, y);
      const n3 = noiseFunc(x, y + eps);
      const n4 = noiseFunc(x, y - eps);
      const dx = (n1 - n2) / (2 * eps);
      const dy = (n3 - n4) / (2 * eps);
      return { x: -dy, y: dx };
    },
    map: (value, start1, stop1, start2, stop2) => {
      return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    },
    constrain: (n, low, high) => {
      return Math.max(low, Math.min(high, n));
    },
    lerp: (start, stop, amt) => {
      return start + (stop - start) * amt;
    },
    dist: (x1, y1, x2, y2) => {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    mag: (x, y) => {
      return Math.sqrt(x * x + y * y);
    },
    norm: (value, start, stop) => {
      return (value - start) / (stop - start);
    },
    // Trig functions
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    atan2: Math.atan2,
    radians: (degrees) => degrees * (Math.PI / 180),
    degrees: (radians) => radians * (180 / Math.PI),
    // Utility functions
    abs: Math.abs,
    ceil: Math.ceil,
    floor: Math.floor,
    round: Math.round,
    sqrt: Math.sqrt,
    pow: Math.pow,
    exp: Math.exp,
    log: Math.log,
    min: Math.min,
    max: Math.max,
    int: (n) => Math.floor(n),
    sq: (n) => n * n,
    fract: (n) => n - Math.floor(n),
    sign: (n) => n > 0 ? 1 : n < 0 ? -1 : 0,
    // Vector helpers (v1.1) - plain objects, no mutation
    vec: (x, y) => ({ x, y }),
    vecAdd: (a, b) => ({
      x: a.x + b.x,
      y: a.y + b.y
    }),
    vecSub: (a, b) => ({
      x: a.x - b.x,
      y: a.y - b.y
    }),
    vecMult: (v, s) => ({
      x: v.x * s,
      y: v.y * s
    }),
    vecMag: (v) => Math.sqrt(v.x * v.x + v.y * v.y),
    vecNorm: (v) => {
      const m = Math.sqrt(v.x * v.x + v.y * v.y);
      return m === 0 ? { x: 0, y: 0 } : { x: v.x / m, y: v.y / m };
    },
    vecDist: (a, b) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    // Easing functions (v1.1) - pure functions, t ∈ [0,1] → [0,1]
    easeIn: (t) => t * t,
    easeOut: (t) => t * (2 - t),
    easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    easeExpo: (t) => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      if (t < 0.5) {
        return Math.pow(2, 20 * t - 10) / 2;
      }
      return (2 - Math.pow(2, -20 * t + 10)) / 2;
    },
    // Text functions
    text: (str, x, y) => {
      ctx.font = `${currentTextSize}px ${currentTextFont}`;
      ctx.textAlign = currentTextAlignH;
      ctx.textBaseline = currentTextAlignV;
      if (fillEnabled) {
        ctx.fillStyle = currentFill;
        ctx.fillText(String(str), x, y);
      }
      if (strokeEnabled) {
        ctx.strokeStyle = currentStroke;
        ctx.strokeText(String(str), x, y);
      }
    },
    textSize: (size) => {
      currentTextSize = size;
      ctx.font = `${currentTextSize}px ${currentTextFont}`;
    },
    textFont: (font) => {
      currentTextFont = font;
      ctx.font = `${currentTextSize}px ${currentTextFont}`;
    },
    textAlign: (horizAlign, vertAlign) => {
      const hMap = {
        "left": "left",
        "LEFT": "left",
        "center": "center",
        "CENTER": "center",
        "right": "right",
        "RIGHT": "right"
      };
      const vMap = {
        "top": "top",
        "TOP": "top",
        "bottom": "bottom",
        "BOTTOM": "bottom",
        "center": "middle",
        "CENTER": "middle",
        "baseline": "alphabetic",
        "BASELINE": "alphabetic"
      };
      currentTextAlignH = hMap[horizAlign] || "left";
      if (vertAlign) {
        currentTextAlignV = vMap[vertAlign] || "alphabetic";
      }
    },
    textWidth: (str) => {
      ctx.font = `${currentTextSize}px ${currentTextFont}`;
      return ctx.measureText(String(str)).width;
    },
    // Pixel manipulation (v1.2)
    loadPixels: () => {
      imageDataObj = ctx.getImageData(0, 0, width, height);
      pixelData = imageDataObj.data;
      p.pixels = pixelData;
    },
    updatePixels: () => {
      if (imageDataObj && pixelData) {
        ctx.putImageData(imageDataObj, 0, 0);
      }
    },
    pixels: null,
    get: (x, y) => {
      const imgData = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
      return [imgData.data[0], imgData.data[1], imgData.data[2], imgData.data[3]];
    },
    set: (x, y, c) => {
      const fx = Math.floor(x);
      const fy = Math.floor(y);
      if (Array.isArray(c)) {
        const imgData = ctx.createImageData(1, 1);
        imgData.data[0] = c[0];
        imgData.data[1] = c[1];
        imgData.data[2] = c[2];
        imgData.data[3] = c[3] ?? 255;
        ctx.putImageData(imgData, fx, fy);
      } else {
        const parsed = parseCssColor(c);
        if (parsed) {
          const imgData = ctx.createImageData(1, 1);
          imgData.data[0] = parsed.r;
          imgData.data[1] = parsed.g;
          imgData.data[2] = parsed.b;
          imgData.data[3] = Math.round(parsed.a * 255);
          ctx.putImageData(imgData, fx, fy);
        }
      }
    },
    // Offscreen graphics (v1.2)
    createGraphics: (w, h) => {
      const offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = w;
      offscreenCanvas.height = h;
      const pg = createP5Runtime(offscreenCanvas, w, h, config);
      pg._canvas = offscreenCanvas;
      return pg;
    },
    // Draw image or graphics object to canvas
    image: (src, x, y, w, h) => {
      const srcCanvas = src._canvas || src;
      if (srcCanvas instanceof HTMLCanvasElement) {
        const dw = w ?? srcCanvas.width;
        const dh = h ?? srcCanvas.height;
        ctx.drawImage(srcCanvas, x, y, dw, dh);
      }
    },
    // Loop control (no-ops for SDK)
    noLoop: () => {
    },
    loop: () => {
    },
    redraw: () => {
    },
    frameRate: (fps) => {
    },
    // totalFrames placeholder (injected by engine)
    totalFrames: 0
  };
  return p;
}
function injectTimeVariables(p, time) {
  p.frameCount = time.frameCount;
  p.t = time.t;
  p.time = time.time;
  p.tGlobal = time.tGlobal;
  p.totalFrames = time.totalFrames;
}
var VAR_COUNT = 10;
var VAR_MIN = 0;
var VAR_MAX = 100;
function createProtocolVAR(vars) {
  const normalizedVars = [];
  for (let i = 0; i < VAR_COUNT; i++) {
    normalizedVars[i] = vars?.[i] ?? 0;
  }
  const frozenVars = Object.freeze(normalizedVars);
  return new Proxy(frozenVars, {
    set(_target, prop, _value) {
      const propName = typeof prop === "symbol" ? prop.toString() : prop;
      throw new Error(
        `[Code Mode Protocol Error] VAR is read-only. Cannot write to VAR[${propName}]. VAR[0..9] are protocol inputs, not sketch state.`
      );
    },
    deleteProperty(_target, prop) {
      const propName = typeof prop === "symbol" ? prop.toString() : prop;
      throw new Error(
        `[Code Mode Protocol Error] VAR is read-only. Cannot delete VAR[${propName}].`
      );
    },
    defineProperty(_target, prop) {
      const propName = typeof prop === "symbol" ? prop.toString() : prop;
      throw new Error(
        `[Code Mode Protocol Error] Cannot define new VAR properties. VAR is fixed at 10 elements (VAR[0..9]). Attempted: ${propName}`
      );
    }
  });
}
function injectProtocolVariables(p, vars) {
  p.VAR = createProtocolVAR(vars);
}

// loop-engine.ts
var isCancelled = false;
function cancelLoopMode() {
  isCancelled = true;
}
async function runLoopMode(config, options) {
  const { code, seed, vars, onPreview, onProgress, onComplete, onError } = options;
  const width = config.width ?? DEFAULT_CONFIG.width;
  const height = config.height ?? DEFAULT_CONFIG.height;
  const duration = Math.max(
    DEFAULT_CONFIG.minDuration,
    Math.min(DEFAULT_CONFIG.maxDuration, config.duration ?? DEFAULT_CONFIG.duration)
  );
  const fps = config.fps ?? DEFAULT_CONFIG.fps;
  const totalFrames = Math.floor(duration * fps);
  isCancelled = false;
  try {
    onProgress?.({
      phase: "setup",
      percent: 0,
      message: "Initializing canvas..."
    });
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const p = createP5Runtime(canvas, width, height, { seed });
    injectProtocolVariables(p, vars);
    const hasDrawFunction = /function\s+draw\s*\(\s*\)/.test(code);
    if (!hasDrawFunction) {
      throw new Error("Loop Mode requires a draw() function.");
    }
    const forbiddenPatterns = [
      { pattern: /noLoop\s*\(\s*\)/, name: "noLoop()" },
      { pattern: /setTimeout\s*\(/, name: "setTimeout" },
      { pattern: /setInterval\s*\(/, name: "setInterval" },
      { pattern: /requestAnimationFrame\s*\(/, name: "requestAnimationFrame" }
    ];
    for (const { pattern, name } of forbiddenPatterns) {
      if (pattern.test(code)) {
        throw new Error(`Forbidden function in Loop Mode: ${name}`);
      }
    }
    onProgress?.({
      phase: "setup",
      percent: 5,
      message: "Parsing code..."
    });
    const setupMatch = code.match(/function\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\}(?=\s*function|\s*$)/);
    const drawMatch = code.match(/function\s+draw\s*\(\s*\)\s*\{([\s\S]*?)\}(?=\s*function|\s*$)/);
    const setupCode = setupMatch ? setupMatch[1].trim() : "";
    const drawCode = drawMatch ? drawMatch[1].trim() : "";
    if (!drawCode) {
      throw new Error("Loop Mode requires a draw() function with content.");
    }
    p.totalFrames = totalFrames;
    const safeMath = createSafeMath();
    const forbiddenKeys = Object.keys(FORBIDDEN_APIS);
    const wrappedSetup = new Function(
      "p",
      "frameCount",
      "t",
      "time",
      "tGlobal",
      "VAR",
      "totalFrames",
      "Math",
      ...forbiddenKeys,
      `with(p) { ${setupCode} }`
    );
    const wrappedDraw = new Function(
      "p",
      "frameCount",
      "t",
      "time",
      "tGlobal",
      "VAR",
      "totalFrames",
      "Math",
      ...forbiddenKeys,
      `with(p) { ${drawCode} }`
    );
    const forbiddenValues = forbiddenKeys.map((k) => FORBIDDEN_APIS[k]);
    onProgress?.({
      phase: "setup",
      percent: 10,
      message: "Executing setup()..."
    });
    wrappedSetup(p, 0, 0, 0, 0, p.VAR, totalFrames, safeMath, ...forbiddenValues);
    const frames = [];
    onProgress?.({
      phase: "rendering",
      frame: 0,
      totalFrames,
      percent: 10,
      message: `Rendering frames (0/${totalFrames})...`
    });
    for (let frame = 0; frame < totalFrames; frame++) {
      if (isCancelled) {
        throw new Error("Rendering cancelled");
      }
      const t = frame / totalFrames;
      const time = t * duration;
      p.frameCount = frame;
      p.clear();
      p.blendMode("NORMAL");
      wrappedDraw(p, frame, t, time, t, p.VAR, totalFrames, safeMath, ...forbiddenValues);
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => b ? resolve(b) : reject(new Error(`Failed to capture frame ${frame}`)),
          "image/png"
        );
      });
      frames.push(blob);
      if (frame === 0) {
        onPreview?.(canvas);
      }
      const percent = 10 + Math.floor(frame / totalFrames * 60);
      onProgress?.({
        phase: "rendering",
        frame: frame + 1,
        totalFrames,
        percent,
        message: `Rendering frames (${frame + 1}/${totalFrames})...`
      });
      if (frame % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
    onProgress?.({
      phase: "encoding",
      frame: totalFrames,
      totalFrames,
      percent: 70,
      message: "Encoding video..."
    });
    const videoBlob = await encodeFramesToMP4(frames, fps, width, height, (progress) => {
      const percent = 70 + Math.floor(progress * 30);
      onProgress?.({
        phase: "encoding",
        frame: totalFrames,
        totalFrames,
        percent,
        message: `Encoding video (${Math.floor(progress * 100)}%)...`
      });
    });
    onProgress?.({
      phase: "complete",
      frame: totalFrames,
      totalFrames,
      percent: 100,
      message: "Complete"
    });
    const result = {
      type: "video",
      blob: videoBlob,
      frames: totalFrames,
      duration
    };
    onComplete(result);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
  }
}
async function encodeFramesToMP4(frames, fps, width, height, onProgress) {
  const frameDataUrls = [];
  for (let i = 0; i < frames.length; i++) {
    const reader = new FileReader();
    const dataUrl = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(frames[i]);
    });
    frameDataUrls.push(dataUrl);
    onProgress?.(i / frames.length * 0.3);
  }
  const response = await fetch("/api/encode-loop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      frames: frameDataUrls,
      fps,
      width,
      height
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Video encoding failed: ${errorText}`);
  }
  onProgress?.(0.8);
  const data = await response.json();
  if (!data.video) {
    throw new Error("No video data returned from encoder");
  }
  const binaryString = atob(data.video.split(",")[1] || data.video);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  onProgress?.(1);
  return new Blob([bytes], { type: "video/mp4" });
}

// static-engine.ts
var nodeCanvasModule = null;
async function getNodeCanvas() {
  if (nodeCanvasModule) return nodeCanvasModule;
  if (typeof window === "undefined") {
    try {
      const { createRequire } = await import('module');
      const require2 = createRequire(import.meta.url);
      nodeCanvasModule = require2("canvas");
      return nodeCanvasModule;
    } catch {
      return null;
    }
  }
  return null;
}
async function createRuntimeCanvas(width, height) {
  if (typeof document !== "undefined" && typeof document.createElement === "function") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  const nodeCanvas = await getNodeCanvas();
  if (nodeCanvas && nodeCanvas.createCanvas) {
    return nodeCanvas.createCanvas(width, height);
  }
  throw new Error(
    "[Code Mode Protocol Error] Headless canvas unavailable. Install `canvas` for oracle execution."
  );
}
async function runStaticMode(config, options) {
  const { code, seed, vars, onPreview, onProgress, onComplete, onError, returnImageData } = options;
  const width = config.width ?? DEFAULT_CONFIG.width;
  const height = config.height ?? DEFAULT_CONFIG.height;
  try {
    onProgress?.({
      phase: "setup",
      percent: 0,
      message: "Initializing canvas..."
    });
    const canvas = await createRuntimeCanvas(width, height);
    const p = createP5Runtime(canvas, width, height, { seed });
    injectTimeVariables(p, {
      frameCount: 0,
      t: 0,
      time: 0,
      tGlobal: 0,
      totalFrames: 1
      // Static mode has 1 frame
    });
    injectProtocolVariables(p, vars);
    onProgress?.({
      phase: "setup",
      percent: 10,
      message: "Parsing code..."
    });
    const setupMatch = code.match(/function\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\}(?=\s*function|\s*$)/);
    const setupCode = setupMatch ? setupMatch[1].trim() : code;
    const forbiddenPatterns = ["setTimeout", "setInterval", "requestAnimationFrame"];
    for (const pattern of forbiddenPatterns) {
      if (code.includes(pattern)) {
        throw new Error(`Forbidden async timing function: ${pattern}`);
      }
    }
    onProgress?.({
      phase: "rendering",
      percent: 30,
      message: "Executing setup()..."
    });
    const safeMath = createSafeMath();
    const forbiddenKeys = Object.keys(FORBIDDEN_APIS);
    const wrappedSetup = new Function(
      "p",
      "frameCount",
      "t",
      "time",
      "tGlobal",
      "VAR",
      "Math",
      ...forbiddenKeys,
      `with(p) { ${setupCode} }`
    );
    const forbiddenValues = forbiddenKeys.map((k) => FORBIDDEN_APIS[k]);
    wrappedSetup(p, 0, 0, 0, 0, p.VAR, safeMath, ...forbiddenValues);
    onPreview?.(canvas);
    onProgress?.({
      phase: "encoding",
      percent: 70,
      message: returnImageData ? "Capturing ImageData..." : "Capturing PNG..."
    });
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to acquire 2D context");
    }
    const imageData = ctx.getImageData(0, 0, width, height);
    if (returnImageData) {
      onProgress?.({
        phase: "complete",
        percent: 100,
        message: "Complete"
      });
      onComplete({
        type: "image",
        imageData
      });
      return;
    }
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error("Failed to capture PNG")),
        "image/png"
      );
    });
    onProgress?.({
      phase: "complete",
      percent: 100,
      message: "Complete"
    });
    onComplete({
      type: "image",
      blob
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
  }
}
function registerBuilderManifest(manifest) {
  if (!manifest) {
    return;
  }
  if (manifest.protocol !== "nexart") {
    return;
  }
  if (typeof manifest.manifestVersion !== "string") {
    return;
  }
}

// execute.ts
function validateCodeModeSource(source, mode) {
  const errors = [];
  const forbiddenPatterns = [
    { pattern: /setTimeout\s*\(/, name: "setTimeout" },
    { pattern: /setInterval\s*\(/, name: "setInterval" },
    { pattern: /requestAnimationFrame\s*\(/, name: "requestAnimationFrame" },
    { pattern: /Date\.now\s*\(/, name: "Date.now() \u2014 use time variable instead" },
    { pattern: /new\s+Date\s*\(/, name: "new Date() \u2014 use time variable instead" },
    { pattern: /Math\.random\s*\(/, name: "Math.random() \u2014 use random() instead (seeded)" },
    { pattern: /fetch\s*\(/, name: "fetch() \u2014 external IO forbidden" },
    { pattern: /XMLHttpRequest/, name: "XMLHttpRequest \u2014 external IO forbidden" },
    { pattern: /createCanvas\s*\(/, name: "createCanvas() \u2014 canvas is pre-initialized" },
    { pattern: /document\./, name: "DOM access \u2014 document.* forbidden" },
    { pattern: /window\./, name: "DOM access \u2014 window.* forbidden" },
    { pattern: /\bimport\s+/, name: "import \u2014 external imports forbidden" },
    { pattern: /\brequire\s*\(/, name: "require() \u2014 external imports forbidden" }
  ];
  for (const { pattern, name } of forbiddenPatterns) {
    if (pattern.test(source)) {
      errors.push(`Forbidden pattern: ${name}`);
    }
  }
  if (mode === "loop") {
    if (!/function\s+draw\s*\(\s*\)/.test(source)) {
      errors.push("Loop mode requires a draw() function");
    }
    if (/noLoop\s*\(\s*\)/.test(source)) {
      errors.push("noLoop() is forbidden in Loop mode");
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

// engine.ts
function createEngine(config) {
  const resolvedConfig = {
    mode: config.mode,
    width: config.width ?? DEFAULT_CONFIG.width,
    height: config.height ?? DEFAULT_CONFIG.height,
    duration: config.duration ?? DEFAULT_CONFIG.duration,
    fps: config.fps ?? DEFAULT_CONFIG.fps
  };
  let isRunning = false;
  const run = async (options) => {
    if (isRunning) {
      throw new Error("Engine is already running. Call stop() first.");
    }
    isRunning = true;
    try {
      if (resolvedConfig.mode === "static") {
        await runStaticMode(resolvedConfig, options);
      } else if (resolvedConfig.mode === "loop") {
        await runLoopMode(resolvedConfig, options);
      } else {
        throw new Error(`Unknown mode: ${resolvedConfig.mode}`);
      }
    } finally {
      isRunning = false;
    }
  };
  const stop = () => {
    if (resolvedConfig.mode === "loop") {
      cancelLoopMode();
    }
    isRunning = false;
  };
  const getConfig = () => {
    return { ...resolvedConfig };
  };
  return {
    run,
    stop,
    getConfig
  };
}

// runtime.ts
var RUNTIME_VERSION = SDK_VERSION;
function hashSeed(seed) {
  if (typeof seed === "number") {
    return Math.floor(seed) >>> 0;
  }
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash >>> 0;
  }
  return hash || 1;
}
function createSeededRNG2(seed) {
  let a = seed >>> 0;
  return () => {
    a += 1831565813;
    let t = Math.imul(a ^ a >>> 15, a | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function createSeededNoise2(seed) {
  const permutation = [];
  const rng = createSeededRNG2(seed);
  for (let i = 0; i < 256; i++) {
    permutation[i] = i;
  }
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  for (let i = 0; i < 256; i++) {
    permutation[256 + i] = permutation[i];
  }
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + t * (b - a);
  const grad = (hash, x, y, z) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };
  return (x, y = 0, z = 0) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    const A = permutation[X] + Y;
    const AA = permutation[A] + Z;
    const AB = permutation[A + 1] + Z;
    const B = permutation[X + 1] + Y;
    const BA = permutation[B] + Z;
    const BB = permutation[B + 1] + Z;
    return (lerp(
      lerp(
        lerp(grad(permutation[AA], x, y, z), grad(permutation[BA], x - 1, y, z), u),
        lerp(grad(permutation[AB], x, y - 1, z), grad(permutation[BB], x - 1, y - 1, z), u),
        v
      ),
      lerp(
        lerp(grad(permutation[AA + 1], x, y, z - 1), grad(permutation[BA + 1], x - 1, y, z - 1), u),
        lerp(grad(permutation[AB + 1], x, y - 1, z - 1), grad(permutation[BB + 1], x - 1, y - 1, z - 1), u),
        v
      ),
      w
    ) + 1) / 2;
  };
}
function stableStringify(obj) {
  if (obj === null) return "null";
  if (obj === void 0) return "undefined";
  if (typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return "[" + obj.map(stableStringify).join(",") + "]";
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`);
  return "{" + pairs.join(",") + "}";
}
function fnv1aHash(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const h1 = (hash >>> 0).toString(16).padStart(8, "0");
  let hash2 = 2166136261;
  for (let i = str.length - 1; i >= 0; i--) {
    hash2 ^= str.charCodeAt(i);
    hash2 = Math.imul(hash2, 16777619);
  }
  const h2 = (hash2 >>> 0).toString(16).padStart(8, "0");
  return h1 + h2;
}
function createRuntime(options) {
  const numericSeed = hashSeed(options.seed);
  const vars = options.vars ?? [];
  const mode = options.mode ?? "static";
  const strict = options.strict ?? false;
  const metadata = options.metadata;
  if (vars.length > 10) {
    throw new Error(`[NexArt Runtime] vars array must have 0-10 elements, got ${vars.length}`);
  }
  for (let i = 0; i < vars.length; i++) {
    if (typeof vars[i] !== "number" || !Number.isFinite(vars[i])) {
      throw new Error(`[NexArt Runtime] vars[${i}] must be a finite number`);
    }
    if (vars[i] < 0 || vars[i] > 100) {
      throw new Error(`[NexArt Runtime] vars[${i}] must be in range 0-100, got ${vars[i]}`);
    }
  }
  const paddedVars = [...vars];
  while (paddedVars.length < 10) {
    paddedVars.push(0);
  }
  const rng = createSeededRNG2(numericSeed);
  const noiseFunc = createSeededNoise2(numericSeed);
  const state = {
    sdkVersion: RUNTIME_VERSION,
    seed: numericSeed,
    vars: paddedVars,
    mode,
    ...metadata !== void 0 && { metadata }
  };
  function random() {
    return rng();
  }
  function randomInt(min, max) {
    const range = max - min + 1;
    return Math.floor(rng() * range) + min;
  }
  function randomRange(min, max) {
    return rng() * (max - min) + min;
  }
  function noise(x, y, z) {
    return noiseFunc(x, y ?? 0, z ?? 0);
  }
  function run(fn) {
    if (!strict) {
      return fn();
    }
    const originalMathRandom = Math.random;
    const originalDateNow = Date.now;
    const hasPerformance = typeof performance !== "undefined" && performance !== null;
    const originalPerformanceNow = hasPerformance ? performance.now : void 0;
    const throwMathRandom = () => {
      throw new Error("NEXART_STRICT: Non-deterministic API used: Math.random. Use runtime.random() instead.");
    };
    const throwDateNow = () => {
      throw new Error("NEXART_STRICT: Non-deterministic API used: Date.now. Pass time as an input or use deterministic counters.");
    };
    const throwPerformanceNow = () => {
      throw new Error("NEXART_STRICT: Non-deterministic API used: performance.now.");
    };
    try {
      Math.random = throwMathRandom;
      Date.now = throwDateNow;
      if (hasPerformance && originalPerformanceNow) {
        performance.now = throwPerformanceNow;
      }
      return fn();
    } finally {
      Math.random = originalMathRandom;
      Date.now = originalDateNow;
      if (hasPerformance && originalPerformanceNow) {
        performance.now = originalPerformanceNow;
      }
    }
  }
  function digest() {
    const input = stableStringify({
      sdkVersion: RUNTIME_VERSION,
      seed: numericSeed,
      vars: paddedVars,
      mode,
      ...metadata !== void 0 && { metadata }
    });
    return fnv1aHash(input);
  }
  function getState() {
    return { ...state, vars: [...state.vars] };
  }
  function getSeed() {
    return numericSeed;
  }
  return Object.freeze({
    random,
    randomInt,
    randomRange,
    noise,
    run,
    digest,
    getState,
    getSeed,
    strict
  });
}
var NexArtRuntime = {
  create: createRuntime,
  VERSION: RUNTIME_VERSION
};

// ../../shared/soundSnapshot.ts
function clampPercent(value) {
  return Math.max(0, Math.min(100, value));
}
function toPercent(value) {
  return clampPercent(value * 100);
}
function createSoundSnapshot(sound, frames, windowMs = 800, frameIndex, totalFrames) {
  const framesArr = frames || sound.frames || [];
  const bands = {
    bass: sound.bands?.bass ?? 0.3,
    lowMid: sound.bands?.lowMid ?? 0.25,
    highMid: sound.bands?.highMid ?? 0.25,
    treble: sound.bands?.treble ?? 0.2
  };
  const now = framesArr.length > 0 ? framesArr[framesArr.length - 1].t1 * 1e3 : 0;
  const windowStart = now - windowMs;
  const recentFrames = framesArr.filter((f) => f.t1 * 1e3 >= windowStart);
  const useFrames = recentFrames.length > 0 ? recentFrames : framesArr;
  const getFrameAvg = (key, def) => {
    if (useFrames.length === 0) return def;
    const values = useFrames.map((f) => f[key] ?? def);
    return values.reduce((a, b) => a + b, 0) / values.length;
  };
  const getFrameSpan = (key, def) => {
    if (useFrames.length < 2) return 0;
    const values = useFrames.map((f) => f[key] ?? def);
    return Math.max(...values) - Math.min(...values);
  };
  const rmsNow = getFrameAvg("rms", sound.rms ?? 0);
  const ampNow = getFrameAvg("amplitude", sound.rms ?? 0);
  const attNow = getFrameAvg("attack", 0.5);
  const harmNow = getFrameAvg("harmonicity", 0.5);
  const aggrNow = getFrameAvg("aggression", 0.5);
  const rhNow = getFrameAvg("rhythmicity", 0.4);
  const silNow = getFrameAvg("silence", 0);
  const dynNow = getFrameSpan("rms", sound.rms ?? 0);
  const centNow = getFrameAvg("centroid", sound.centroid ?? 0.5);
  const amplifiedRms = Math.pow(rmsNow, 0.33);
  const amplifiedAmp = Math.pow(ampNow, 0.4);
  const t = framesArr.length > 0 ? 1 : 0;
  return {
    volume: toPercent(amplifiedRms),
    amplitude: toPercent(amplifiedAmp),
    dynamicRange: toPercent(dynNow),
    brightness: toPercent(centNow),
    bass: toPercent(bands.bass),
    mid: toPercent((bands.lowMid + bands.highMid) / 2),
    treble: toPercent(bands.treble),
    harmonicity: toPercent(harmNow),
    aggression: toPercent(aggrNow),
    attack: toPercent(attNow),
    rhythmicity: toPercent(rhNow),
    silence: toPercent(silNow),
    hue: toPercent(centNow * 0.75 + aggrNow * 0.25),
    chroma: toPercent(Math.min(1, Math.sqrt((bands.bass + bands.treble) / 2))),
    length: Math.min(100, (sound.durationSec ?? 0) * 10),
    t,
    frame: frameIndex,
    totalFrames
  };
}
function freezeSoundSnapshot(snapshot) {
  return Object.freeze({ ...snapshot });
}

// sound-bridge.ts
function createSoundGlobals(snapshot) {
  return freezeSoundSnapshot(snapshot);
}
function injectSoundGlobals(runtime, snapshot) {
  const globals = createSoundGlobals(snapshot);
  const immutableS = new Proxy(globals, {
    set() {
      console.warn("[SoundBridge] S.* globals are read-only");
      return false;
    },
    deleteProperty() {
      console.warn("[SoundBridge] Cannot delete S.* properties");
      return false;
    },
    defineProperty() {
      console.warn("[SoundBridge] Cannot define new S.* properties");
      return false;
    }
  });
  return {
    ...runtime,
    S: immutableS
  };
}
function hueToDegrees(hue) {
  return hue / 100 * 360;
}
function generateSoundPalette(snapshot, paletteSize = 6) {
  const mainHue = hueToDegrees(snapshot.hue);
  const hueShift = 20 + snapshot.harmonicity / 100 * 40;
  const sat = 60 + snapshot.treble / 100 * 30;
  const light = 70 + snapshot.bass / 100 * 25;
  const palette = [];
  for (let i = 0; i < paletteSize; i++) {
    const hue = (mainHue + i * hueShift) % 360;
    const satVar = sat - i % 2 * 10;
    const lightVar = light - i % 3 * 5;
    palette.push(`hsl(${hue}, ${satVar}%, ${lightVar}%)`);
  }
  return palette;
}
function inferGenreProfile(snapshot) {
  const energy = snapshot.volume > 60 || snapshot.aggression > 60 ? "high" : snapshot.volume > 30 ? "mid" : "low";
  const structure = snapshot.rhythmicity > 50 && snapshot.dynamicRange < 25 ? "geometric" : snapshot.aggression > 60 && snapshot.dynamicRange > 50 ? "chaotic" : "organic";
  const clarity = snapshot.brightness > 60 ? "sharp" : snapshot.brightness > 40 ? "clear" : "muddy";
  return { energy, structure, clarity };
}

// soundart-engine.ts
init_soundart_sketches();
function applyTweaksToSnapshot(snapshot, tweaks) {
  if (!tweaks) return snapshot;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const tweaked = {
    ...snapshot,
    volume: snapshot.volume * (tweaks.volumeRangeFactor ?? 1),
    brightness: snapshot.brightness * (tweaks.centroidBrightnessFactor ?? 1),
    aggression: snapshot.aggression * (tweaks.aggressionPaletteFactor ?? 1),
    rhythmicity: snapshot.rhythmicity * (tweaks.rhythmPatternFactor ?? 1),
    harmonicity: snapshot.harmonicity * (tweaks.harmonySmoothnessFactor ?? 1),
    attack: snapshot.attack * (tweaks.attackSharpnessFactor ?? 1),
    dynamicRange: snapshot.dynamicRange * (tweaks.dynamicRangeVariationFactor ?? 1),
    bass: snapshot.bass * (tweaks.bassThicknessFactor ?? 1),
    treble: snapshot.treble * (tweaks.trebleSharpnessFactor ?? 1)
  };
  tweaked.volume = clamp(tweaked.volume, 0, 250);
  tweaked.brightness = clamp(tweaked.brightness, 0, 250);
  tweaked.aggression = clamp(tweaked.aggression, 0, 250);
  tweaked.rhythmicity = clamp(tweaked.rhythmicity, 0, 250);
  tweaked.harmonicity = clamp(tweaked.harmonicity, 0, 250);
  tweaked.attack = clamp(tweaked.attack, 0, 250);
  tweaked.dynamicRange = clamp(tweaked.dynamicRange, 0, 250);
  tweaked.bass = clamp(tweaked.bass, 0, 250);
  tweaked.treble = clamp(tweaked.treble, 0, 250);
  return tweaked;
}
async function renderSoundArtViaCodeMode(options) {
  const { style, sound, canvas, config, onProgress } = options;
  onProgress?.(0.1);
  const sketchCode = getSoundArtSketch(style);
  if (!sketchCode) {
    throw new Error(`SoundArt style "${style}" has not been converted to Code Mode yet`);
  }
  onProgress?.(0.2);
  const baseSnapshot = createSoundSnapshot(sound, sound.frames);
  const snapshot = applyTweaksToSnapshot(baseSnapshot, config.tweakParams);
  onProgress?.(0.3);
  const deriveSeedFromSound = (sound2) => {
    const hashInput = sound2.rms * 1e3 + sound2.centroid * 100 + sound2.durationSec * 1e4 + (sound2.bands?.bass ?? 0) * 500 + (sound2.bands?.treble ?? 0) * 700;
    return Math.abs(Math.floor(hashInput * 2147483647) % 2147483647) || 123456;
  };
  const runtimeConfig = {
    seed: config.seed ?? deriveSeedFromSound(sound)
  };
  canvas.width = config.width;
  canvas.height = config.height;
  const baseRuntime = createP5Runtime(canvas, config.width, config.height, runtimeConfig);
  const runtime = injectSoundGlobals(baseRuntime, snapshot);
  onProgress?.(0.4);
  const globals = {
    ...runtime,
    width: config.width,
    height: config.height,
    backgroundMode: config.backgroundMode ?? "rgb",
    palette: generateSoundPalette(snapshot),
    genre: inferGenreProfile(snapshot)
  };
  onProgress?.(0.5);
  try {
    executeSketch(sketchCode, globals);
    onProgress?.(0.9);
  } catch (error) {
    console.error(`[SoundArtEngine] Error executing style "${style}":`, error);
    throw new Error(`Style "${style}" execution failed: ${error}`);
  }
  onProgress?.(1);
  const metadata = {
    mode: "SoundArt",
    style,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    soundFeatures: {
      duration: sound.durationSec,
      amplitude: sound.rms,
      frequency: sound.centroid,
      bass: sound.bands?.bass ?? 0,
      treble: sound.bands?.treble ?? 0,
      aggression: snapshot.aggression
    },
    effects: {
      timeFilter: false,
      backgroundMode: config.backgroundMode ?? "rgb"
    },
    generationParams: {
      seed: runtimeConfig.seed,
      canvasSize: { width: config.width, height: config.height }
    }
  };
  return {
    style,
    mode: "soundart",
    snapshot,
    metadata
  };
}
function executeSketch(code, globals) {
  const globalNames = Object.keys(globals);
  const globalValues = Object.values(globals);
  const wrappedCode = `
    ${code}
    
    // Execute setup
    if (typeof setup === 'function') {
      setup();
    }
    
    // For static mode, we don't call draw()
    // Loop mode would call draw() in a frame loop
  `;
  const sketchFunction = new Function(...globalNames, wrappedCode);
  sketchFunction(...globalValues);
}
function canRenderViaCodeMode(style) {
  return getSoundArtSketch(style) !== void 0;
}
function getCodeModeAvailableStyles() {
  const { getAvailableSoundArtSketches: getAvailableSoundArtSketches2 } = (init_soundart_sketches(), __toCommonJS(soundart_sketches_exports));
  return getAvailableSoundArtSketches2();
}

// entry/browser.ts
var SDK_VERSION2 = SDK_VERSION;
var SDK_NAME = "@nexart/codemode-sdk";
var SDK_ENTRY = "browser";

export { CODE_MODE_ENFORCEMENT, CODE_MODE_PROTOCOL_PHASE, CODE_MODE_PROTOCOL_VERSION, DEFAULT_CONFIG, DEFAULT_VARS, FORBIDDEN_APIS, FORBIDDEN_API_NAMES, NexArtRuntime, PROTOCOL_IDENTITY, RUNTIME_VERSION, SDK_ENTRY, SDK_NAME, SDK_VERSION2 as SDK_VERSION, VAR_COUNT, VAR_MAX, VAR_MIN, buildSandboxContext, canRenderViaCodeMode, cancelLoopMode, createEngine, createP5Runtime, createProtocolVAR, createRuntime, createSafeMath, createSandboxedExecutor, executeSandboxed, getCodeModeAvailableStyles, injectProtocolVariables, injectTimeVariables, registerBuilderManifest, renderSoundArtViaCodeMode, runLoopMode, validateCodeModeSource };
