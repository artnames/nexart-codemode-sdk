# Changelog

All notable changes to @nexart/codemode-sdk will be documented in this file.

---

## [1.6.0] — 2026-01-12

### Added — Licensing & Builder Identity Scaffolding

**Non-Breaking, Metadata-Only Release**

This release introduces scaffolding for future licensing and builder identity features. All additions are informational only — no behavior changes, no enforcement, no runtime validation.

#### Licensing (Informational Only)
- **LICENSE.md**: Draft commercial licensing terms with enforcement NOT active
- README section: "Commercial usage of NexArt Protocol requires a license. Enforcement is not active yet."

#### Builder Manifest Schema (Optional)
- **builder.manifest.schema.json**: JSON schema for optional builder attribution
- Fields: `builder_id`, `project_name`, `contact`, `website`, `intended_use`
- NOT validated, NOT loaded at runtime, NOT required

#### Documentation
- Positioned SDK as "canonical execution surface"
- Explained determinism guarantees explicitly
- Referenced real products (ByX, Frontierra)

### Unchanged

- No changes to execution or determinism
- No changes to protocol version (remains v1.2.0)
- No runtime validation or enforcement
- No new required files or dependencies
- Full backward compatibility with v1.5.x
- Existing sketches run unchanged

### Verification

Run `npx tsx scripts/check-determinism.ts` — must pass before release.

---

## [1.5.1] — 2026-01-05

### Added

- **Builder Manifest Support (Write-Only, Passive)**: Optional declarative metadata for builder attribution
  - New `NexArtBuilderManifest` type for structured attribution data
  - `registerBuilderManifest(manifest?)` — The ONLY public API (write-only)

### Design Philosophy

**The Builder Manifest is a declaration of intent, not a capability.**

The SDK does not expose any API to read or inspect manifests. This establishes the correct long-term posture: identity declaration first, incentives later, governance before economics.

### API Surface

| Function | Exported | Description |
|----------|----------|-------------|
| `registerBuilderManifest()` | ✅ Yes | Write-only manifest registration |
| `getBuilderManifest()` | ❌ No | Internal only |
| `clearBuilderManifest()` | ❌ No | Internal only |

### What This Is

- **Declarative** — Write-only, no read API exposed
- **Optional** — No errors if missing or invalid
- **Non-enforced** — No validation logic
- **Non-rewarding** — No incentives, no tracking

### What This Is NOT

- No rewards
- No analytics
- No counters
- No API endpoints
- No dashboards
- No validation logic
- No network calls
- No errors for missing/invalid manifests

### Safety Guarantees

- ✅ No code path allows runtime or userland access to the manifest
- ✅ No execution behavior changes with or without a manifest
- ✅ Determinism is unaffected
- ✅ SDK behavior is identical with or without a manifest

### Usage

```typescript
import { registerBuilderManifest } from "@nexart/codemode-sdk";

registerBuilderManifest({
  protocol: "nexart",
  manifestVersion: "0.1",
  app: { name: "My App", url: "https://myapp.com" }
});
```

---

## [1.4.0] — 2026-01-02

### Added — Protocol v1.2 Implementation

This release implements Protocol v1.2.0 (Phase 3) with vertex primitives, pixel manipulation, and offscreen graphics.

#### New Vertex Functions
- `curveVertex(x, y)` — Add Catmull-Rom spline vertex within beginShape/endShape
- `bezierVertex(cx1, cy1, cx2, cy2, x, y)` — Add cubic bezier vertex within beginShape/endShape

#### New Pixel System
- `loadPixels()` — Load canvas pixels into `pixels[]` array
- `updatePixels()` — Write `pixels[]` array back to canvas
- `pixels[]` — RGBA pixel array (length = width × height × 4)
- `get(x, y)` — Get pixel color at (x, y) as [R, G, B, A] array
- `set(x, y, color)` — Set pixel color at (x, y)

#### New Graphics System
- `createGraphics(w, h)` — Create offscreen canvas with full runtime
- `image(pg, x, y, w, h)` — Draw graphics object to main canvas

#### New Time Variable
- `totalFrames` — Total frames in loop mode, now injected into runtime

#### Protocol
- Protocol version bumped to v1.2.0 (Phase 3)
- All new functions are deterministic
- Pixel manipulation follows p5.js semantics
- Offscreen graphics inherit seed from main canvas

---

## [1.3.0] — 2026-01-02

### Added — Protocol v1.1 Implementation

This release implements Protocol v1.1.0 with expressive extensions for generative art.

#### New Math Helpers
- `fract(n)` — Fractional part: `n - floor(n)`
- `sign(n)` — Sign: `-1`, `0`, or `1`

#### New Vector Helpers (stateless, plain objects)
- `vec(x, y)` — Create vector `{ x, y }`
- `vecAdd(a, b)` — Add vectors
- `vecSub(a, b)` — Subtract vectors
- `vecMult(v, s)` — Scale vector
- `vecMag(v)` — Magnitude
- `vecNorm(v)` — Normalize to unit vector
- `vecDist(a, b)` — Distance between vectors

#### New Shape Helpers
- `polygon(cx, cy, radius, sides, rotation)` — Regular polygon
- `star(cx, cy, innerRadius, outerRadius, points, rotation)` — Star shape

#### New Blend Modes
- `blendMode(mode)` — Set compositing mode
- Supported: `NORMAL`, `ADD`, `MULTIPLY`, `SCREEN`
- Unsupported modes throw protocol error

#### New Noise Extensions
- `fbm(x, y, octaves, falloff)` — Fractal Brownian Motion
- `ridgedNoise(x, y)` — Ridged/turbulent noise
- `curlNoise(x, y)` — Returns `{x, y}` curl noise vector

#### New Easing Functions
- `easeIn(t)` — Quadratic ease in
- `easeOut(t)` — Quadratic ease out
- `easeInOut(t)` — Quadratic ease in-out
- `easeCubic(t)` — Cubic ease in-out
- `easeExpo(t)` — Exponential ease in-out

#### Protocol
- Protocol version bumped to v1.1.0 (Phase 2)
- All new functions are pure and deterministic
- Vectors are plain objects (no p5.Vector)
- Blend mode resets per frame in Loop Mode

---

## [1.2.0] — 2026-01-02

### Added — Capability Parity Update

This release addresses gaps identified in the Code Mode Capability Audit, bringing the SDK closer to protocol parity.

#### New Drawing Functions
- `bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2)` — Cubic bezier curves
- `curve(x1, y1, x2, y2, x3, y3, x4, y4)` — Catmull-Rom splines

#### New Style Functions
- `strokeCap(cap)` — Set line cap style (ROUND, SQUARE, PROJECT)
- `strokeJoin(join)` — Set line join style (MITER, BEVEL, ROUND)

#### New Transform Functions
- `shearX(angle)` — Shear along X axis
- `shearY(angle)` — Shear along Y axis

#### New Text System
- `text(str, x, y)` — Render text
- `textSize(size)` — Set font size
- `textFont(font)` — Set font family
- `textAlign(horizAlign, vertAlign)` — Set text alignment
- `textWidth(str)` — Measure text width

#### New Math Functions
- `int(n)` — Floor to integer
- `sq(n)` — Square (n * n)

#### New Constants
- `TAU` — Equal to TWO_PI (6.283...)
- `PIE`, `CHORD`, `OPEN` — Arc mode constants
- `LEFT`, `RIGHT`, `TOP`, `BOTTOM`, `BASELINE` — Text alignment constants

#### Protocol
- Protocol documentation updated to v1.0.1 with these additions

---

## [1.1.1] — 2024-12-31

### Critical Bug Fix: Seeded Random

**BREAKING FIX**: The published npm package (v1.1.0 and earlier) had a critical bug where `random()` used `Math.random()` instead of the seeded Mulberry32 PRNG. This broke determinism guarantees.

#### Fixed
- `random()` now correctly uses seeded Mulberry32 PRNG
- `randomSeed(seed)` now properly recreates the RNG with new seed
- `randomGaussian()` now uses seeded Box-Muller transform
- `noise()` now uses proper seeded Perlin noise with octaves
- `noiseSeed(seed)` now properly recreates the noise generator
- `lerpColor()` now properly interpolates colors (was returning c1)

#### Changed
- Rebuilt package with proper TypeScript compilation
- Added standalone package.json and tsconfig.json for clean builds
- New entry point: `core-index.ts` (excludes external dependencies)

#### Verification
```javascript
// Same seed = same output (determinism restored)
randomSeed(42);
console.log(random()); // Always 0.8379...
console.log(random()); // Always 0.9032...
```

---

## [1.1.0] — 2024-12-30

### Minor Bump for npm Publishing (DEPRECATED)

**WARNING**: This version had a critical bug. Use v1.1.1 or later.

- Updated SDK version from 1.0.2 to 1.1.0
- Protocol version remains v1.0.0 (unchanged)
- No breaking changes from 1.0.2

---

## [1.0.2] — 2024-12-30

### Changed

- **VAR input is now optional (0-10 elements)**
  - Omit `vars` or pass `[]` for empty (defaults to all zeros)
  - Input length must be 0-10 (throws if > 10)
  - Values must be finite numbers in [0, 100] (throws if out of range, NO clamping)
  - Runtime VAR is ALWAYS 10 elements (padded with zeros for consistency)
- **VAR enforcement updated**
  - Read-only via Proxy (throws on write attempts)
  - Out-of-range values now throw (previously warned)
- **Backwards compatible**: existing code passing 10 elements works unchanged

---

## [1.0.1] — 2024-12-29

### Documentation

- Protocol Lock section formalized with HARD LOCKED status
- VAR specification clarified with enforcement tables
- CHANGELOG added to track version history
- Smoke tests added for cross-SDK verification

---

## [1.0.0] — 2024-12-29

### Protocol Lock

**NexArt Code Mode Protocol v1.0.0 is now HARD LOCKED.**

This version establishes the canonical Code Mode execution surface for:
- NexArt app
- ByX curated collections
- External builders and AI platforms

### Frozen

The following are locked and will not change in v1.x:

- **Execution Model**: Static (setup-only) and Loop (frame-authoritative) modes
- **VAR[0..9]**: Exactly 10 read-only protocol variables (0-100 recommended)
- **Determinism**: Same code + same seed + same VARs = identical output
- **Time Semantics**: t ∈ [0,1), frameCount, time, tGlobal
- **Random**: Seeded Mulberry32 PRNG via random()
- **Noise**: Seeded Perlin noise via noise()
- **Forbidden Patterns**: 13 patterns rejected with [Code Mode Protocol Error]
- **Canvas**: Pre-initialized, no createCanvas()

### API

- `executeCodeMode()` — Canonical entry point for all Code Mode execution
- `validateCodeModeSource()` — Pre-flight validation without execution
- `createEngine()` — Legacy API (still supported)

### Notes

- Any breaking change requires v2.0.0
- VAR count is fixed at 10 and will not be extended
- This version enables external builders to depend on stable protocol semantics
