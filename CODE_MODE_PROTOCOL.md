# Code Mode Protocol v1.2.0 — Phase 3

> **Status:** STABLE  
> **Enforcement:** HARD  
> **Effective Date:** January 2026

This document is **normative**. It defines the official Code Mode execution surface for NexArt Protocol. All implementations (NexArt app, ByX, external builders) MUST conform to this specification.

---

## 1. Protocol Identity

| Property | Value |
|----------|-------|
| Protocol | `nexart` |
| Engine | `codemode` |
| Version | `1.2.0` |
| Phase | `3` |
| Deterministic | `true` |

---

## 2. Execution Modes

### 2.1 Static Mode
- Executes `setup()` once
- `draw()` is **NOT** executed
- Output: Single PNG image
- Time variables: All `0`

### 2.2 Loop Mode
- Executes `setup()` once
- Executes `draw()` for each frame
- Canvas is cleared before each `draw()` call
- Blend mode resets to `NORMAL` before each `draw()` call
- Output: MP4 video (1-4 seconds, 30 FPS)
- Requires `totalFrames` to be specified

---

## 3. Protocol Variables (VAR[0..9])

### 3.1 Definition
- Input: 0-10 elements allowed (protocol error if > 10)
- Runtime: ALWAYS 10 elements (padded with zeros)
- Type: `readonly number[]`
- Range: `0` to `100` (strict — protocol error if out of range)
- Default: All zeros `[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]`

### 3.2 Access
```javascript
// ✅ Allowed - reading (missing indices return 0)
let size = VAR[0];        // Returns provided value or 0
let opacity = map(VAR[1], 0, 100, 0, 255);

// ❌ Forbidden - writing (throws protocol error)
VAR[0] = 50; // [Code Mode Protocol Error] VAR is read-only
```

### 3.3 Enforcement
| Condition | Enforcement |
|-----------|-------------|
| Input length > 10 | HARD — throws protocol error |
| Value outside 0-100 | HARD — throws protocol error |
| Non-number value | HARD — throws protocol error |
| Write attempt | HARD — throws protocol error |
| Missing input | Runtime padded with zeros |

---

## 4. Supported Globals

### 4.1 Canvas Environment
| Global | Type | Description |
|--------|------|-------------|
| `width` | `number` | Canvas width (default: 1950) |
| `height` | `number` | Canvas height (default: 2400) |

### 4.2 Time Variables
| Global | Type | Description |
|--------|------|-------------|
| `frameCount` | `number` | Current frame (0, 1, 2, ...) |
| `t` | `number` | Normalized time [0.0, 1.0) |
| `time` | `number` | Elapsed seconds |
| `tGlobal` | `number` | Alias for `t` |
| `totalFrames` | `number` | Total frames in loop mode |

### 4.3 Math Constants
| Global | Value |
|--------|-------|
| `PI` | `3.141592653589793` |
| `TWO_PI` | `6.283185307179586` |
| `TAU` | `6.283185307179586` |
| `HALF_PI` | `1.5707963267948966` |
| `QUARTER_PI` | `0.7853981633974483` |

---

## 5. Supported Functions

### 5.1 Drawing Primitives
- `line(x1, y1, x2, y2)`
- `rect(x, y, w, h, [r])`
- `square(x, y, s, [r])` — Square shorthand
- `ellipse(x, y, w, h)`
- `circle(x, y, d)`
- `triangle(x1, y1, x2, y2, x3, y3)`
- `quad(x1, y1, x2, y2, x3, y3, x4, y4)`
- `arc(x, y, w, h, start, stop, [mode])`
- `point(x, y)`
- `beginShape()` / `vertex(x, y)` / `endShape([close])`
- `curveVertex(x, y)` — Add Catmull-Rom spline vertex
- `bezierVertex(cx1, cy1, cx2, cy2, x, y)` — Add cubic bezier vertex
- `bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2)`
- `curve(x1, y1, x2, y2, x3, y3, x4, y4)`

### 5.1.1 Shape Helpers (v1.1)
- `polygon(cx, cy, radius, sides, [rotation])` — Regular polygon
- `star(cx, cy, innerRadius, outerRadius, points, [rotation])` — Star shape

Rules:
- Internally expand to `beginShape()` / `vertex()` / `endShape(CLOSE)`
- No hidden state
- No randomness (pure geometry)

### 5.2 Style
- `fill(...)` — Supports all CSS color formats
- `noFill()`
- `stroke(...)` — Supports all CSS color formats
- `noStroke()`
- `strokeWeight(w)`
- `strokeCap(cap)` — `ROUND`, `SQUARE`, `PROJECT`
- `strokeJoin(join)` — `MITER`, `BEVEL`, `ROUND`
- `background(...)` — Supports all CSS color formats
- `clear()` — Clear canvas to transparent
- `colorMode(mode, [max1], [max2], [max3], [maxA])`

### 5.2.1 Blend Modes (v1.1)
- `blendMode(mode)` — Set compositing mode

Supported modes (ONLY these are allowed):
| Mode | Canvas Equivalent |
|------|-------------------|
| `NORMAL` | `source-over` |
| `ADD` | `lighter` |
| `MULTIPLY` | `multiply` |
| `SCREEN` | `screen` |

Rules:
- Unsupported modes MUST throw a protocol error
- Blend mode resets to `NORMAL` before each `draw()` in Loop Mode
- No custom or dynamic modes

### 5.2.2 Shape Mode Constants
- `CORNER` / `CENTER` / `CORNERS` / `RADIUS` — Rect/ellipse mode
- `CLOSE` — For `endShape(CLOSE)`
- `ROUND` / `SQUARE` / `PROJECT` — Stroke cap styles
- `MITER` / `BEVEL` — Stroke join styles
- `PIE` / `CHORD` / `OPEN` — Arc modes
- `LEFT` / `CENTER` / `RIGHT` — Horizontal alignment
- `TOP` / `BOTTOM` / `BASELINE` — Vertical alignment
- `NORMAL` / `ADD` / `MULTIPLY` / `SCREEN` — Blend modes

### 5.3 Color Functions
- `color(...)` — Create color object
- `lerpColor(c1, c2, amt)` — Interpolate colors
- `red(c)` / `green(c)` / `blue(c)` / `alpha(c)` — Extract components
- `hue(c)` / `saturation(c)` / `brightness(c)` — HSB extraction

### 5.4 Transforms
- `push()` / `pop()`
- `translate(x, y)`
- `rotate(angle)`
- `scale(s)` / `scale(sx, sy)`
- `resetMatrix()`
- `shearX(angle)` / `shearY(angle)`

### 5.5 Random (Seeded)
- `random([min], [max])` — Seeded pseudo-random
- `randomSeed(seed)` — Set random seed
- `randomGaussian([mean], [sd])` — Seeded Gaussian

### 5.6 Noise (Seeded)
- `noise(x, [y], [z])` — Seeded Perlin noise
- `noiseSeed(seed)` — Set noise seed
- `noiseDetail(octaves, [falloff])` — Configure noise

### 5.6.1 Noise Extensions (v1.1)
- `fbm(x, y, [octaves], [falloff])` — Fractal Brownian Motion
- `ridgedNoise(x, y)` — Ridged/turbulent noise
- `curlNoise(x, y)` — Returns `{x, y}` curl noise vector

Rules:
- All use existing seeded `noise()` internally
- Pure functions with no internal state
- Deterministic for same inputs + seed

### 5.7 Math Utilities
- `map(value, start1, stop1, start2, stop2)`
- `constrain(value, min, max)`
- `lerp(start, stop, amt)`
- `dist(x1, y1, x2, y2)`
- `mag(x, y)`
- `norm(value, start, stop)`
- `abs()` / `floor()` / `ceil()` / `round()` / `sqrt()` / `pow()` / `exp()` / `log()`
- `sin()` / `cos()` / `tan()` / `asin()` / `acos()` / `atan()` / `atan2()`
- `min()` / `max()`
- `radians(degrees)` / `degrees(radians)`

### 5.7.1 Math Helpers (v1.1)
- `sq(n)` — Square: `n * n`
- `int(n)` — Floor to integer: `floor(n)`
- `fract(n)` — Fractional part: `n - floor(n)`
- `sign(n)` — Sign: `-1`, `0`, or `1`

Rules:
- Pure functions only
- No side effects
- Deterministic

### 5.8 Vector Helpers (v1.1)

Vectors are **plain objects** `{ x: number, y: number }`. No classes or mutable state.

- `vec(x, y)` — Create vector `{ x, y }`
- `vecAdd(a, b)` — Add vectors: `{ x: a.x + b.x, y: a.y + b.y }`
- `vecSub(a, b)` — Subtract vectors: `{ x: a.x - b.x, y: a.y - b.y }`
- `vecMult(v, s)` — Scale vector: `{ x: v.x * s, y: v.y * s }`
- `vecMag(v)` — Magnitude: `sqrt(v.x² + v.y²)`
- `vecNorm(v)` — Normalize to unit vector
- `vecDist(a, b)` — Distance between two vectors

Rules:
- All functions return NEW objects (no mutation)
- No p5.Vector compatibility
- No methods on vector objects

### 5.9 Easing Functions (v1.1)

All easing functions:
- Input: `t ∈ [0, 1]`
- Output: `∈ [0, 1]`
- Pure functions, no clamping side effects

- `easeIn(t)` — Quadratic ease in
- `easeOut(t)` — Quadratic ease out
- `easeInOut(t)` — Quadratic ease in-out
- `easeCubic(t)` — Cubic ease in-out
- `easeExpo(t)` — Exponential ease in-out

### 5.10 Text
- `text(str, x, y)`
- `textSize(size)`
- `textFont(font)`
- `textAlign(horizAlign, [vertAlign])`
- `textWidth(str)`

### 5.11 Image/Pixel (v1.2)
- `loadPixels()` — Load canvas pixels into `pixels[]` array
- `updatePixels()` — Write `pixels[]` array back to canvas
- `pixels[]` — RGBA pixel array (length = width × height × 4)
- `get(x, y)` — Get pixel color at (x, y) as RGBA array
- `set(x, y, color)` — Set pixel color at (x, y)

Rules:
- `pixels[]` is a flat array: `[R, G, B, A, R, G, B, A, ...]`
- Index formula: `i = (y * width + x) * 4`
- Must call `loadPixels()` before reading/modifying `pixels[]`
- Must call `updatePixels()` after modifying `pixels[]`
- Deterministic: no external state

### 5.12 Offscreen Graphics (v1.2)
- `createGraphics(w, h)` — Create offscreen canvas

Returns a graphics object with:
- All drawing functions (rect, ellipse, line, etc.)
- All style functions (fill, stroke, etc.)
- All transform functions (push, pop, translate, etc.)
- `image(pg, x, y, [w], [h])` — Draw to main canvas

Rules:
- Offscreen graphics inherit seed from main canvas
- Each graphics object has independent state
- Deterministic: same execution = identical output

---

## 6. Forbidden Patterns

The following patterns are **explicitly forbidden** and MUST throw errors:

| Pattern | Reason |
|---------|--------|
| `setTimeout()` | Async timing breaks determinism |
| `setInterval()` | Async timing breaks determinism |
| `requestAnimationFrame()` | Async timing breaks determinism |
| `noLoop()` (in Loop Mode) | Incompatible with frame capture |
| `createCanvas()` | Canvas is pre-initialized |
| `fetch()` / `XMLHttpRequest` | External IO breaks determinism |
| `import` / `require` | No external modules |
| DOM manipulation | No direct DOM access |
| `Date.now()` / `new Date()` | Time-based entropy breaks determinism |
| `Math.random()` | Use `random()` instead (seeded) |
| `p5.Vector` | Use plain vector objects instead |
| Unsupported blend modes | Only NORMAL, ADD, MULTIPLY, SCREEN |

---

## 7. Determinism Guarantees

### 7.1 Invariant
```
Same code + Same seed + Same VARs = Identical output
```

### 7.2 Sources of Randomness
- **Allowed:** `random()`, `noise()` — Both are seeded
- **Forbidden:** `Math.random()`, `Date`, browser entropy

### 7.3 Verification
Any execution can be verified by re-running with the same inputs.

---

## 8. Canonical Execution API

### 8.1 Entry Point
```typescript
executeCodeMode({
  source: string,
  width: number,
  height: number,
  seed: number,
  vars?: number[],
  mode: 'static' | 'loop',
  totalFrames?: number
}) => Promise<ExecutionResult>
```

### 8.2 Result Structure
```typescript
interface ExecutionResult {
  image?: Blob;           // Static mode: PNG
  video?: Blob;           // Loop mode: MP4
  frames?: ImageData[];   // Optional: raw frames
  metadata: {
    protocol: 'nexart';
    engine: 'codemode';
    protocolVersion: '1.2.0';
    phase: 3;
    deterministic: true;
    seed: number;
    vars: number[];
    width: number;
    height: number;
    mode: 'static' | 'loop';
    totalFrames?: number;
  }
}
```

---

## 9. Implementation Requirements

### 9.1 SDK Authority
- `@nexart/codemode-sdk` is the single source of truth
- NexArt app, ByX, and external clients MUST delegate to this SDK
- No other renderer may redefine Code Mode semantics

### 9.2 Logging
All executions MUST log:
```
[CodeMode] Rendered via @nexart/codemode-sdk (Protocol v1.2.0)
```

### 9.3 Error Handling
- Missing `draw()` in Loop Mode → Error
- Missing `totalFrames` in Loop Mode → Error
- VAR mutation attempt → Warning + Error log (no crash)
- Unsupported function → Clear error message
- Unsupported blend mode → Protocol error

---

## 10. Why These Were Added (v1.1 Rationale)

### Expressive Power
- **Shape Helpers**: `polygon()` and `star()` reduce boilerplate for common patterns
- **Vector Helpers**: Enable clean geometric calculations without p5.Vector overhead
- **Easing Functions**: Essential for smooth animations in Loop Mode

### Determinism
- **All new functions are pure**: No side effects, no hidden state
- **Blend modes are strictly limited**: Only 4 safe compositing modes
- **Noise extensions use seeded noise()**: No new sources of randomness

### Cross-Runtime Portability
- **Plain vector objects**: Work identically in browser, Node.js, and headless environments
- **No DOM dependencies**: All functions work without a browser
- **Stateless math**: Every function can be verified independently

---

## 11. Future Phases

| Phase | Scope | Status |
|-------|-------|--------|
| Phase 3 | Pixel manipulation, offscreen buffers | ✅ COMPLETE (v1.2.0) |
| Phase 4 | External asset loading (controlled) | Planned |
| Phase 5 | WebGL/3D support | Planned |

Each phase requires a protocol version bump and formal specification.

---

## 12. Changelog

### v1.2.0 (January 2026)
**Phase 3 — Pixel & Graphics**

Added:
- Vertex functions: `curveVertex(x, y)`, `bezierVertex(cx1, cy1, cx2, cy2, x, y)`
- Pixel system: `loadPixels()`, `updatePixels()`, `pixels[]`, `get(x, y)`, `set(x, y, color)`
- Graphics system: `createGraphics(w, h)`, `image(pg, x, y, w, h)`
- Time variable: `totalFrames` now injected in Loop Mode

Rules:
- All new functions are pure and deterministic
- Pixel manipulation follows p5.js semantics
- Offscreen graphics inherit seed from main canvas

### v1.1.0 (January 2026)
**Phase 2 — Expressive Extensions**

Added:
- Math helpers: `fract(n)`, `sign(n)` (sq, int already in v1.0.1)
- Vector helpers: `vec`, `vecAdd`, `vecSub`, `vecMult`, `vecMag`, `vecNorm`, `vecDist`
- Shape helpers: `polygon(cx, cy, r, sides, rotation)`, `star(cx, cy, rIn, rOut, points, rotation)`
- Blend modes: `blendMode(NORMAL|ADD|MULTIPLY|SCREEN)`
- Noise extensions: `fbm(x, y, octaves, falloff)`, `ridgedNoise(x, y)`, `curlNoise(x, y)`
- Easing functions: `easeIn`, `easeOut`, `easeInOut`, `easeCubic`, `easeExpo`

Rules:
- All new functions are pure and deterministic
- Vectors are plain objects (no p5.Vector)
- Blend mode resets per frame in Loop Mode
- Unsupported blend modes throw protocol errors

### v1.0.1 (January 2026)
- Added `square(x, y, s, [r])` to drawing primitives
- Added `clear()` to style functions
- Added `bezier()`, `curve()` to drawing primitives
- Added `strokeCap()`, `strokeJoin()` to style
- Added `shearX()`, `shearY()` to transforms
- Added `sq()`, `int()` to math
- Added text system: `text()`, `textSize()`, `textFont()`, `textAlign()`, `textWidth()`
- Documented shape mode constants
- Documented text alignment constants

### v1.0.0 (December 2024)
- Initial locked specification
- VAR[0..9] read-only protocol variables
- Full CSS color support
- Seeded random/noise
- Static + Loop modes
- HARD enforcement enabled

---

**End of Specification**
