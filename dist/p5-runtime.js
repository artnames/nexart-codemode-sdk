/**
 * NexArt Code Mode Runtime SDK - p5-like Runtime
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CODE MODE PROTOCOL v1.2.0 (Phase 3) — STABLE                             ║
 * ║                                                                          ║
 * ║  Status: HARD PROTOCOL ENFORCEMENT                                       ║
 * ║  This is the stable, canonical execution surface.                        ║
 * ║  SDKs, ByX, and external builders can depend on this API.                ║
 * ║                                                                          ║
 * ║  Phase 1 Surface:                                                        ║
 * ║  - VAR[0..9]: 10 read-only protocol variables (0-100 range)              ║
 * ║  - Drawing: line, rect, ellipse, circle, triangle, quad, arc, etc.       ║
 * ║  - Style: fill, stroke, colorMode, strokeWeight                          ║
 * ║  - Transform: push, pop, translate, rotate, scale                        ║
 * ║  - Random: random(), randomSeed(), randomGaussian() (seeded)             ║
 * ║  - Noise: noise(), noiseSeed(), noiseDetail() (seeded)                   ║
 * ║  - Math: map, constrain, lerp, lerpColor, dist, mag, norm                ║
 * ║  - Color: Full CSS format support, color extraction functions            ║
 * ║  - Time: frameCount, t, time, tGlobal                                    ║
 * ║                                                                          ║
 * ║  Determinism Guarantees:                                                 ║
 * ║  - Same code + same seed + same VARs = identical output                  ║
 * ║  - No external state, no browser entropy, no time-based drift            ║
 * ║  - Randomness ONLY from: random(), noise() (both seeded)                 ║
 * ║                                                                          ║
 * ║  ⚠️  Future changes require Phase 2+                                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
/**
 * Code Mode Protocol Version
 * This constant defines the locked protocol version.
 * Changes to the execution surface require a version bump.
 */
export const CODE_MODE_PROTOCOL_VERSION = '1.2.0';
export const CODE_MODE_PROTOCOL_PHASE = 3;
export const CODE_MODE_ENFORCEMENT = 'HARD';
/**
 * Create a seeded random number generator (Mulberry32)
 * Same algorithm used in SoundArt for consistency
 */
function createSeededRNG(seed = 123456) {
    let a = seed >>> 0;
    return () => {
        a += 0x6D2B79F5;
        let t = Math.imul(a ^ (a >>> 15), a | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
/**
 * Create improved Perlin-like noise with seeding support
 */
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
        return (lerp(lerp(lerp(grad(permutation[AA], x, y, z), grad(permutation[BA], x - 1, y, z), u), lerp(grad(permutation[AB], x, y - 1, z), grad(permutation[BB], x - 1, y - 1, z), u), v), lerp(lerp(grad(permutation[AA + 1], x, y, z - 1), grad(permutation[BA + 1], x - 1, y, z - 1), u), lerp(grad(permutation[AB + 1], x, y - 1, z - 1), grad(permutation[BB + 1], x - 1, y - 1, z - 1), u), v), w) + 1) / 2;
    };
}
export function createP5Runtime(canvas, width, height, config) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let currentFill = 'rgba(255, 255, 255, 1)';
    let currentStroke = 'rgba(0, 0, 0, 1)';
    let strokeEnabled = true;
    let fillEnabled = true;
    let currentStrokeWeight = 1;
    let colorModeSettings = { mode: 'RGB', maxR: 255, maxG: 255, maxB: 255, maxA: 255 };
    let shapeStarted = false;
    let shapeVertices = [];
    // Pixel array for pixel manipulation
    let pixelData = null;
    let imageDataObj = null;
    // Text state
    let currentTextSize = 12;
    let currentTextFont = 'sans-serif';
    let currentTextAlignH = 'left';
    let currentTextAlignV = 'alphabetic';
    // Seeded random state
    let randomSeedValue = config?.seed ?? Math.floor(Math.random() * 2147483647);
    let rng = createSeededRNG(randomSeedValue);
    // Seeded noise state
    let noiseSeedValue = config?.seed ?? 0;
    let noiseFunc = createSeededNoise(noiseSeedValue);
    let noiseOctaves = 4;
    let noiseFalloff = 0.5;
    /**
     * Parse CSS color string to normalized RGBA values
     * Supports: hex (#RGB, #RRGGBB, #RRGGBBAA), rgb(), rgba(), hsl(), hsla()
     */
    const parseCssColor = (str) => {
        const s = str.trim();
        // Hex format: #RGB, #RRGGBB, #RRGGBBAA
        if (s.startsWith('#')) {
            const hex = s.slice(1);
            if (hex.length === 3) {
                const r = parseInt(hex[0] + hex[0], 16);
                const g = parseInt(hex[1] + hex[1], 16);
                const b = parseInt(hex[2] + hex[2], 16);
                return { r, g, b, a: 1 };
            }
            else if (hex.length === 6) {
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                return { r, g, b, a: 1 };
            }
            else if (hex.length === 8) {
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                const a = parseInt(hex.slice(6, 8), 16) / 255;
                return { r, g, b, a };
            }
        }
        // rgb(r, g, b) or rgb(r g b)
        const rgbMatch = s.match(/^rgb\s*\(\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)\s*\)$/i);
        if (rgbMatch) {
            return {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3]),
                a: 1
            };
        }
        // rgba(r, g, b, a) or rgba(r g b / a)
        const rgbaMatch = s.match(/^rgba\s*\(\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\/\s]\s*([\d.]+)\s*\)$/i);
        if (rgbaMatch) {
            return {
                r: parseInt(rgbaMatch[1]),
                g: parseInt(rgbaMatch[2]),
                b: parseInt(rgbaMatch[3]),
                a: parseFloat(rgbaMatch[4])
            };
        }
        // hsl(h, s%, l%) or hsla(h, s%, l%, a)
        const hslMatch = s.match(/^hsla?\s*\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)%?\s*[,\s]\s*([\d.]+)%?\s*(?:[,\/\s]\s*([\d.]+))?\s*\)$/i);
        if (hslMatch) {
            const h = parseFloat(hslMatch[1]) / 360;
            const sat = parseFloat(hslMatch[2]) / 100;
            const l = parseFloat(hslMatch[3]) / 100;
            const a = hslMatch[4] ? parseFloat(hslMatch[4]) : 1;
            // HSL to RGB conversion
            let r, g, b;
            if (sat === 0) {
                r = g = b = l;
            }
            else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0)
                        t += 1;
                    if (t > 1)
                        t -= 1;
                    if (t < 1 / 6)
                        return p + (q - p) * 6 * t;
                    if (t < 1 / 2)
                        return q;
                    if (t < 2 / 3)
                        return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
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
        if (args.length === 0)
            return 'rgba(0, 0, 0, 1)';
        const { mode, maxR, maxG, maxB, maxA } = colorModeSettings;
        if (args.length === 1) {
            const val = args[0];
            if (typeof val === 'string') {
                // Try to parse CSS color formats
                const parsed = parseCssColor(val);
                if (parsed) {
                    return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${parsed.a})`;
                }
                // Return as-is for named colors (canvas handles them)
                return val;
            }
            if (mode === 'HSB') {
                return `hsla(${val}, 100%, 50%, 1)`;
            }
            const gray = Math.round((val / maxR) * 255);
            return `rgba(${gray}, ${gray}, ${gray}, 1)`;
        }
        if (args.length === 2) {
            const [gray, alpha] = args;
            const g = Math.round((gray / maxR) * 255);
            const a = alpha / maxA;
            return `rgba(${g}, ${g}, ${g}, ${a})`;
        }
        if (args.length === 3) {
            const [r, g, b] = args;
            if (mode === 'HSB') {
                return `hsla(${(r / maxR) * 360}, ${(g / maxG) * 100}%, ${(b / maxB) * 100}%, 1)`;
            }
            return `rgba(${Math.round((r / maxR) * 255)}, ${Math.round((g / maxG) * 255)}, ${Math.round((b / maxB) * 255)}, 1)`;
        }
        if (args.length === 4) {
            const [r, g, b, a] = args;
            if (mode === 'HSB') {
                return `hsla(${(r / maxR) * 360}, ${(g / maxG) * 100}%, ${(b / maxB) * 100}%, ${a / maxA})`;
            }
            return `rgba(${Math.round((r / maxR) * 255)}, ${Math.round((g / maxG) * 255)}, ${Math.round((b / maxB) * 255)}, ${a / maxA})`;
        }
        return 'rgba(0, 0, 0, 1)';
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
        CORNER: 'corner',
        CENTER: 'center',
        CORNERS: 'corners',
        RADIUS: 'radius',
        ROUND: 'round',
        SQUARE: 'butt',
        PROJECT: 'square',
        MITER: 'miter',
        BEVEL: 'bevel',
        CLOSE: 'close',
        PIE: 'pie',
        CHORD: 'chord',
        OPEN: 'open',
        // Blend mode constants (v1.1)
        NORMAL: 'source-over',
        ADD: 'lighter',
        MULTIPLY: 'multiply',
        SCREEN: 'screen',
        // Text alignment constants
        LEFT: 'left',
        RIGHT: 'right',
        TOP: 'top',
        BOTTOM: 'bottom',
        BASELINE: 'alphabetic',
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
                'source-over': 'source-over',
                'NORMAL': 'source-over',
                'lighter': 'lighter',
                'ADD': 'lighter',
                'multiply': 'multiply',
                'MULTIPLY': 'multiply',
                'screen': 'screen',
                'SCREEN': 'screen',
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
                'round': 'round',
                'ROUND': 'round',
                'square': 'butt',
                'SQUARE': 'butt',
                'project': 'square',
                'PROJECT': 'square',
                'butt': 'butt',
            };
            ctx.lineCap = capMap[cap] || 'round';
        },
        strokeJoin: (join) => {
            const joinMap = {
                'miter': 'miter',
                'MITER': 'miter',
                'bevel': 'bevel',
                'BEVEL': 'bevel',
                'round': 'round',
                'ROUND': 'round',
            };
            ctx.lineJoin = joinMap[join] || 'miter';
        },
        colorMode: (mode, max1, max2, max3, maxA) => {
            colorModeSettings = {
                mode: mode.toUpperCase(),
                maxR: max1 ?? 255,
                maxG: max2 ?? max1 ?? 255,
                maxB: max3 ?? max1 ?? 255,
                maxA: maxA ?? 255,
            };
        },
        color: (...args) => parseColor(...args),
        lerpColor: (c1, c2, amt) => {
            // Parse both colors
            const color1 = parseCssColor(c1) || { r: 0, g: 0, b: 0, a: 1 };
            const color2 = parseCssColor(c2) || { r: 255, g: 255, b: 255, a: 1 };
            // Linearly interpolate each channel
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
            if (!parsed)
                return 0;
            return Math.max(parsed.r, parsed.g, parsed.b) / 255 * 100;
        },
        saturation: (color) => {
            const parsed = parseCssColor(color);
            if (!parsed)
                return 0;
            const max = Math.max(parsed.r, parsed.g, parsed.b);
            const min = Math.min(parsed.r, parsed.g, parsed.b);
            if (max === 0)
                return 0;
            return ((max - min) / max) * 100;
        },
        hue: (color) => {
            const parsed = parseCssColor(color);
            if (!parsed)
                return 0;
            const { r, g, b } = parsed;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            if (max === min)
                return 0;
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
            if (fillEnabled)
                ctx.fill();
            if (strokeEnabled)
                ctx.stroke();
        },
        circle: (x, y, d) => {
            p.ellipse(x, y, d, d);
        },
        rect: (x, y, w, h, r) => {
            const height = h ?? w;
            ctx.beginPath();
            if (r && r > 0) {
                ctx.roundRect(x, y, w, height, r);
            }
            else {
                ctx.rect(x, y, w, height);
            }
            if (fillEnabled)
                ctx.fill();
            if (strokeEnabled)
                ctx.stroke();
        },
        square: (x, y, s, r) => {
            p.rect(x, y, s, s, r);
        },
        line: (x1, y1, x2, y2) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            if (strokeEnabled)
                ctx.stroke();
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
            if (fillEnabled)
                ctx.fill();
            if (strokeEnabled)
                ctx.stroke();
        },
        quad: (x1, y1, x2, y2, x3, y3, x4, y4) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.lineTo(x4, y4);
            ctx.closePath();
            if (fillEnabled)
                ctx.fill();
            if (strokeEnabled)
                ctx.stroke();
        },
        arc: (x, y, w, h, start, stop, mode) => {
            ctx.beginPath();
            ctx.ellipse(x, y, w / 2, h / 2, 0, start, stop);
            if (mode === 'pie' || mode === 'PIE') {
                ctx.lineTo(x, y);
                ctx.closePath();
            }
            else if (mode === 'chord' || mode === 'CHORD') {
                ctx.closePath();
            }
            if (fillEnabled)
                ctx.fill();
            if (strokeEnabled)
                ctx.stroke();
        },
        // Bezier and curve functions
        bezier: (x1, y1, cx1, cy1, cx2, cy2, x2, y2) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
            if (strokeEnabled)
                ctx.stroke();
        },
        curve: (x1, y1, x2, y2, x3, y3, x4, y4) => {
            // Catmull-Rom spline conversion to cubic bezier
            // The curve is drawn from (x2,y2) to (x3,y3) using (x1,y1) and (x4,y4) as control points
            const tension = 1 / 6;
            const cp1x = x2 + (x3 - x1) * tension;
            const cp1y = y2 + (y3 - y1) * tension;
            const cp2x = x3 - (x4 - x2) * tension;
            const cp2y = y3 - (y4 - y2) * tension;
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x3, y3);
            if (strokeEnabled)
                ctx.stroke();
        },
        // Shape helpers (v1.1)
        polygon: (cx, cy, radius, sides, rotation = 0) => {
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = rotation + (i / sides) * Math.PI * 2 - Math.PI / 2;
                const x = cx + Math.cos(angle) * radius;
                const y = cy + Math.sin(angle) * radius;
                if (i === 0) {
                    ctx.moveTo(x, y);
                }
                else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            if (fillEnabled)
                ctx.fill();
            if (strokeEnabled)
                ctx.stroke();
        },
        star: (cx, cy, innerRadius, outerRadius, points, rotation = 0) => {
            ctx.beginPath();
            const totalPoints = points * 2;
            for (let i = 0; i < totalPoints; i++) {
                const angle = rotation + (i / totalPoints) * Math.PI * 2 - Math.PI / 2;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const x = cx + Math.cos(angle) * radius;
                const y = cy + Math.sin(angle) * radius;
                if (i === 0) {
                    ctx.moveTo(x, y);
                }
                else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            if (fillEnabled)
                ctx.fill();
            if (strokeEnabled)
                ctx.stroke();
        },
        // Vertex-based shapes
        beginShape: () => {
            shapeVertices = [];
            shapeStarted = false;
        },
        vertex: (x, y) => {
            shapeVertices.push({ x, y, type: 'vertex' });
        },
        curveVertex: (x, y) => {
            shapeVertices.push({ x, y, type: 'curve' });
        },
        bezierVertex: (cx1, cy1, cx2, cy2, x, y) => {
            shapeVertices.push({ x, y, type: 'bezier', cx1, cy1, cx2, cy2 });
        },
        endShape: (mode) => {
            if (shapeVertices.length === 0)
                return;
            ctx.beginPath();
            // Process vertices in sequence, handling mixed types correctly
            let started = false;
            let curveBuffer = [];
            const tension = 1 / 6;
            const flushCurveBuffer = () => {
                if (curveBuffer.length >= 4) {
                    // Draw Catmull-Rom spline from buffered curve vertices
                    // First and last points are control points only
                    if (!started) {
                        ctx.moveTo(curveBuffer[1].x, curveBuffer[1].y);
                        started = true;
                    }
                    else {
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
                if (v.type === 'curve') {
                    curveBuffer.push({ x: v.x, y: v.y });
                }
                else {
                    // Flush any pending curve vertices before processing non-curve vertex
                    if (curveBuffer.length > 0) {
                        flushCurveBuffer();
                    }
                    if (v.type === 'vertex') {
                        if (!started) {
                            ctx.moveTo(v.x, v.y);
                            started = true;
                        }
                        else {
                            ctx.lineTo(v.x, v.y);
                        }
                    }
                    else if (v.type === 'bezier' && started) {
                        ctx.bezierCurveTo(v.cx1, v.cy1, v.cx2, v.cy2, v.x, v.y);
                    }
                }
            }
            // Flush any remaining curve vertices at the end
            if (curveBuffer.length > 0) {
                flushCurveBuffer();
            }
            if (mode === 'close' || mode === 'CLOSE') {
                ctx.closePath();
            }
            if (fillEnabled)
                ctx.fill();
            if (strokeEnabled)
                ctx.stroke();
            shapeVertices = [];
            shapeStarted = false;
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
            // Support random() with arrays
            if (Array.isArray(min)) {
                return min[Math.floor(rng() * min.length)];
            }
            if (min === undefined)
                return rng();
            if (max === undefined)
                return rng() * min;
            return min + rng() * (max - min);
        },
        randomSeed: (seed) => {
            randomSeedValue = seed;
            rng = createSeededRNG(seed);
        },
        randomGaussian: (mean = 0, sd = 1) => {
            // Box-Muller transform for Gaussian distribution
            const u1 = rng();
            const u2 = rng();
            const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            return z0 * sd + mean;
        },
        noise: (x, y, z) => {
            // Use seeded Perlin noise with octaves
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
            if (falloff !== undefined) {
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
            // Ridged noise: absolute value creates ridge-like patterns
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
            // Curl noise: compute gradient and rotate 90 degrees
            const eps = 0.0001;
            const n1 = noiseFunc(x + eps, y);
            const n2 = noiseFunc(x - eps, y);
            const n3 = noiseFunc(x, y + eps);
            const n4 = noiseFunc(x, y - eps);
            const dx = (n1 - n2) / (2 * eps);
            const dy = (n3 - n4) / (2 * eps);
            // Rotate 90 degrees: (dx, dy) -> (-dy, dx)
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
            if (t === 0)
                return 0;
            if (t === 1)
                return 1;
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
                'left': 'left', 'LEFT': 'left',
                'center': 'center', 'CENTER': 'center',
                'right': 'right', 'RIGHT': 'right',
            };
            const vMap = {
                'top': 'top', 'TOP': 'top',
                'bottom': 'bottom', 'BOTTOM': 'bottom',
                'center': 'middle', 'CENTER': 'middle',
                'baseline': 'alphabetic', 'BASELINE': 'alphabetic',
            };
            currentTextAlignH = hMap[horizAlign] || 'left';
            if (vertAlign) {
                currentTextAlignV = vMap[vertAlign] || 'alphabetic';
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
            }
            else {
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
            const offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = w;
            offscreenCanvas.height = h;
            const pg = createP5Runtime(offscreenCanvas, w, h, config);
            // Add reference to canvas for image() drawing
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
        noLoop: () => { },
        loop: () => { },
        redraw: () => { },
        frameRate: (fps) => { },
        // totalFrames placeholder (injected by engine)
        totalFrames: 0,
    };
    return p;
}
export function injectTimeVariables(p, time) {
    p.frameCount = time.frameCount;
    p.t = time.t;
    p.time = time.time;
    p.tGlobal = time.tGlobal;
    p.totalFrames = time.totalFrames;
}
/**
 * VAR Protocol Constants (Phase 1 — Protocol v1.0.0)
 * SDK v1.0.2: VAR input is optional (0-10 elements), but runtime always has 10
 */
export const VAR_COUNT = 10; // Exactly 10 protocol variables: VAR[0..9]
export const VAR_MIN = 0; // Minimum value
export const VAR_MAX = 100; // Maximum value (normalized range)
/**
 * Create a protected, read-only VAR array for protocol execution.
 *
 * SDK v1.0.2 Rules (Protocol v1.0.0):
 * - Input accepts 0-10 elements
 * - Runtime VAR is ALWAYS 10 elements (padded with zeros)
 * - Values are numeric, must be in 0-100 range (validated upstream)
 * - Read-only: writes throw descriptive errors
 * - Available in both setup() and draw()
 */
export function createProtocolVAR(vars) {
    // Create frozen 10-element array (upstream normalizeVars ensures this)
    const normalizedVars = [];
    for (let i = 0; i < VAR_COUNT; i++) {
        normalizedVars[i] = vars?.[i] ?? 0;
    }
    // Freeze the array to prevent modifications
    const frozenVars = Object.freeze(normalizedVars);
    // Wrap in Proxy for descriptive error messages on write attempts
    return new Proxy(frozenVars, {
        set(_target, prop, _value) {
            const propName = typeof prop === 'symbol' ? prop.toString() : prop;
            throw new Error(`[Code Mode Protocol Error] VAR is read-only. ` +
                `Cannot write to VAR[${propName}]. ` +
                `VAR[0..9] are protocol inputs, not sketch state.`);
        },
        deleteProperty(_target, prop) {
            const propName = typeof prop === 'symbol' ? prop.toString() : prop;
            throw new Error(`[Code Mode Protocol Error] VAR is read-only. ` +
                `Cannot delete VAR[${propName}].`);
        },
        defineProperty(_target, prop) {
            const propName = typeof prop === 'symbol' ? prop.toString() : prop;
            throw new Error(`[Code Mode Protocol Error] Cannot define new VAR properties. ` +
                `VAR is fixed at 10 elements (VAR[0..9]). Attempted: ${propName}`);
        },
    });
}
export function injectProtocolVariables(p, vars) {
    p.VAR = createProtocolVAR(vars);
}
