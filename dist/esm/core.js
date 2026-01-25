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

// execute.ts
function normalizeVars(vars) {
  if (!vars || !Array.isArray(vars)) {
    console.log("[CodeMode] No vars provided, using defaults [0,0,0,0,0,0,0,0,0,0]");
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  if (vars.length > 10) {
    throw new Error(`[Code Mode Protocol Error] VAR array must have at most 10 elements, got ${vars.length}`);
  }
  const result = [];
  for (let i = 0; i < vars.length; i++) {
    const v = vars[i];
    if (typeof v !== "number" || !Number.isFinite(v)) {
      throw new Error(`[Code Mode Protocol Error] VAR[${i}] must be a finite number, got ${typeof v === "number" ? v : typeof v}`);
    }
    if (v < 0 || v > 100) {
      throw new Error(`[Code Mode Protocol Error] VAR[${i}] = ${v} is out of range. Values must be 0-100.`);
    }
    result.push(v);
  }
  while (result.length < 10) {
    result.push(0);
  }
  return result;
}
function validateInput(input) {
  if (!input.source || typeof input.source !== "string") {
    throw new Error("[Code Mode Protocol Error] source is required and must be a string");
  }
  if (typeof input.width !== "number" || input.width <= 0) {
    throw new Error("[Code Mode Protocol Error] width must be a positive number");
  }
  if (typeof input.height !== "number" || input.height <= 0) {
    throw new Error("[Code Mode Protocol Error] height must be a positive number");
  }
  if (typeof input.seed !== "number") {
    throw new Error("[Code Mode Protocol Error] seed is required and must be a number");
  }
  if (input.mode !== "static" && input.mode !== "loop") {
    throw new Error('[Code Mode Protocol Error] mode must be "static" or "loop"');
  }
  if (input.mode === "loop") {
    if (typeof input.totalFrames !== "number" || input.totalFrames <= 0) {
      throw new Error("[Code Mode Protocol Error] totalFrames is required for loop mode and must be a positive number");
    }
  }
  const forbiddenPatterns = [
    // Async timing (breaks determinism)
    { pattern: /setTimeout\s*\(/, name: "setTimeout" },
    { pattern: /setInterval\s*\(/, name: "setInterval" },
    { pattern: /requestAnimationFrame\s*\(/, name: "requestAnimationFrame" },
    // Time-based entropy (breaks determinism)
    { pattern: /Date\.now\s*\(/, name: "Date.now() \u2014 use time variable instead" },
    { pattern: /new\s+Date\s*\(/, name: "new Date() \u2014 use time variable instead" },
    // Unseeded random (use random() instead)
    { pattern: /Math\.random\s*\(/, name: "Math.random() \u2014 use random() instead (seeded)" },
    // External IO (breaks determinism)
    { pattern: /fetch\s*\(/, name: "fetch() \u2014 external IO forbidden" },
    { pattern: /XMLHttpRequest/, name: "XMLHttpRequest \u2014 external IO forbidden" },
    // Canvas is pre-initialized
    { pattern: /createCanvas\s*\(/, name: "createCanvas() \u2014 canvas is pre-initialized" },
    // DOM manipulation forbidden
    { pattern: /document\./, name: "DOM access \u2014 document.* forbidden" },
    { pattern: /window\./, name: "DOM access \u2014 window.* forbidden" },
    // External imports forbidden
    { pattern: /\bimport\s+/, name: "import \u2014 external imports forbidden" },
    { pattern: /\brequire\s*\(/, name: "require() \u2014 external imports forbidden" }
  ];
  for (const { pattern, name } of forbiddenPatterns) {
    if (pattern.test(input.source)) {
      throw new Error(`[Code Mode Protocol Error] Forbidden pattern: ${name}`);
    }
  }
  if (input.mode === "loop") {
    if (!/function\s+draw\s*\(\s*\)/.test(input.source)) {
      throw new Error("[Code Mode Protocol Error] Loop mode requires a draw() function");
    }
    if (/noLoop\s*\(\s*\)/.test(input.source)) {
      throw new Error("[Code Mode Protocol Error] noLoop() is forbidden in Loop mode");
    }
  }
}
function createMetadata(input, vars) {
  return {
    ...PROTOCOL_IDENTITY,
    seed: input.seed,
    vars,
    width: input.width,
    height: input.height,
    mode: input.mode,
    ...input.mode === "loop" && input.totalFrames ? { totalFrames: input.totalFrames } : {}
  };
}
async function executeStatic(input, vars) {
  console.log("[CodeMode] Rendered via @nexart/codemode-sdk (Protocol v1.2.0)");
  console.log("[CodeMode] Execution: Static mode \u2014 delegating to static-engine");
  return new Promise((resolve, reject) => {
    runStaticMode(
      {
        width: input.width,
        height: input.height
      },
      {
        code: input.source,
        seed: input.seed,
        vars,
        onComplete: (result) => {
          resolve({
            image: "blob" in result ? result.blob : void 0,
            frames: "imageData" in result ? [result.imageData] : void 0,
            metadata: createMetadata(input, vars)
          });
        },
        onError: (error) => {
          reject(error);
        }
      }
    );
  });
}
async function executeLoop(input, vars) {
  console.log("[CodeMode] Rendered via @nexart/codemode-sdk (Protocol v1.2.0)");
  console.log(`[CodeMode] Execution: Loop mode \u2014 delegating to loop-engine (${input.totalFrames} frames)`);
  const fps = DEFAULT_CONFIG.fps;
  const duration = (input.totalFrames || 60) / fps;
  return new Promise((resolve, reject) => {
    runLoopMode(
      {
        width: input.width,
        height: input.height,
        duration,
        fps
      },
      {
        code: input.source,
        seed: input.seed,
        vars,
        onComplete: (result) => {
          resolve({
            video: "blob" in result && result.type === "video" ? result.blob : void 0,
            metadata: createMetadata(input, vars)
          });
        },
        onError: (error) => {
          reject(error);
        }
      }
    );
  });
}
async function executeCodeMode(input) {
  validateInput(input);
  const vars = normalizeVars(input.vars);
  console.log("[CodeMode] \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  console.log("[CodeMode] Protocol v1.2.0 \u2014 Phase 3 \u2014 HARD Enforcement");
  console.log(`[CodeMode] Mode: ${input.mode}`);
  console.log(`[CodeMode] Seed: ${input.seed}`);
  console.log(`[CodeMode] VAR: [${vars.join(", ")}]`);
  console.log("[CodeMode] \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  if (input.mode === "static") {
    return executeStatic(input, vars);
  } else {
    return executeLoop(input, vars);
  }
}
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

// core-index.ts
var SDK_VERSION2 = SDK_VERSION;
var SDK_NAME = "@nexart/codemode-sdk";

export { CODE_MODE_ENFORCEMENT, CODE_MODE_PROTOCOL_PHASE, CODE_MODE_PROTOCOL_VERSION, DEFAULT_CONFIG, DEFAULT_VARS, PROTOCOL_IDENTITY, PROTOCOL_PHASE, PROTOCOL_VERSION, SDK_NAME, SDK_VERSION2 as SDK_VERSION, VAR_COUNT, VAR_MAX, VAR_MIN, cancelLoopMode, createEngine, createP5Runtime, createProtocolVAR, executeCodeMode, injectTimeVariables, runLoopMode, runStaticMode, validateCodeModeSource };
