# NexArt Code Mode Runtime SDK

**Version: 1.6.0 (Protocol v1.2.0)**

╔══════════════════════════════════════════════════════════════════════════════╗
║  @nexart/codemode-sdk — Canonical Execution Surface                          ║
║                                                                              ║
║  This SDK IS the protocol. All implementations MUST use this SDK.            ║
║                                                                              ║
║  Protocol: nexart                                                            ║
║  Engine: codemode                                                            ║
║  SDK Version: 1.6.0                                                          ║
║  Protocol Version: 1.2.0                                                     ║
║  Phase: 3                                                                    ║
║  Enforcement: HARD                                                           ║
╚══════════════════════════════════════════════════════════════════════════════╝

---

## Commercial Licensing

> **Commercial usage of NexArt Protocol requires a license.**
> **Enforcement is not active yet.**

The SDK is currently provided under the MIT License for all usage. A future version may introduce commercial licensing requirements. See [LICENSE.md](./LICENSE.md) for details.

---

## PROTOCOL LOCK — v1.x

| Property | Value |
|----------|-------|
| Protocol Name | NexArt Code Mode |
| Version | v1.2.0 |
| Status | **STABLE** |
| Phase | 3 |
| Lock Date | January 2026 |

**Core protocol surface is frozen. Any breaking change requires v2.0.0.**

The following are locked and will not change in v1.x:

- Execution model (Static and Loop modes)
- VAR[0..9] specification (0-10 read-only variables, missing indices return 0)
- Determinism guarantee (seed + VAR → identical output)
- Time semantics (t, frameCount, time, tGlobal, totalFrames)
- Random and noise behavior (seeded Mulberry32, Perlin)
- Forbidden patterns list (13 patterns)
- Canvas pre-initialization (no createCanvas)

---

A minimal, deterministic rendering engine for generative art.

## Protocol Authority

**This SDK is the single source of truth for Code Mode semantics.**

If someone asks: "How does Code Mode work in NexArt?"

The answer is: "Whatever @nexart/codemode-sdk does — that is the protocol."

---

## What's New in v1.6.0

**Licensing & Builder Identity Scaffolding (Metadata Only)**

This is a non-breaking, metadata-only release. No changes to execution or determinism.

### Licensing (Informational Only)
- Added `LICENSE.md` with draft commercial licensing terms
- Enforcement is NOT active — all usage currently permitted under MIT

### Builder Manifest Schema
- Added `builder.manifest.schema.json` for optional builder attribution
- Fields: `builder_id`, `project_name`, `contact`, `website`, `intended_use`
- This file is **optional**, **not validated**, and **not loaded at runtime**

### Documentation
- SDK positioned as "canonical execution surface"
- Explicit determinism guarantees documented
- Real product references (ByX, Frontierra)

---

## Determinism Guarantees

**The NexArt Code Mode SDK guarantees deterministic output.**

Given identical inputs:
- Same `source` code
- Same `seed`
- Same `vars` array
- Same `width` and `height`
- Same `mode`

The SDK will produce **byte-for-byte identical output** across all executions.

### What Breaks Determinism

The following actions will break determinism and are **blocked** by the SDK:

| Pattern | Reason | Enforcement |
|---------|--------|-------------|
| `Math.random()` | Unseeded randomness | BLOCKED |
| `Date.now()` | Time-based entropy | BLOCKED |
| `new Date()` | Time-based entropy | BLOCKED |
| `performance.now()` | Timing entropy | BLOCKED |
| `crypto.getRandomValues()` | Crypto randomness | BLOCKED |
| `fetch()` | External IO | BLOCKED |
| External imports | Uncontrolled code | BLOCKED |

Use `random()` (seeded) and `noise()` (seeded) for all randomness needs.

### Oracle Verification

Before any release, run the determinism check:

```bash
npx tsx scripts/check-determinism.ts
```

This compares output against a known oracle hash. If the hash changes without a protocol version bump, the release is invalid.

---

## Products Using This SDK

- **NexArt**: Primary generative art platform
- **ByX**: Curated collection system
- **Frontierra**: External builder integration

---

## v1.5.1

**Builder Manifest — Passive Attribution (Write-Only)**

- `registerBuilderManifest(manifest?)` — Declare builder identity for future attribution

The Builder Manifest is a declaration of intent, not a capability. Write-only, optional, non-enforced.

---

## v1.4.0 (Protocol v1.2.0)

**Phase 3 — Pixel & Graphics**

- **Vertex Functions**: `curveVertex(x, y)`, `bezierVertex(cx1, cy1, cx2, cy2, x, y)` for smooth curves
- **Pixel System**: `loadPixels()`, `updatePixels()`, `pixels[]`, `get(x, y)`, `set(x, y, color)`
- **Graphics System**: `createGraphics(w, h)`, `image(pg, x, y, w, h)` for offscreen rendering
- **totalFrames**: Now injected into Loop Mode runtime

## v1.3.0 (Protocol v1.1.0)

**Phase 2 — Expressive Extensions**

- **Math Helpers**: `fract(n)`, `sign(n)`
- **Vector Helpers**: `vec`, `vecAdd`, `vecSub`, `vecMult`, `vecMag`, `vecNorm`, `vecDist`
- **Shape Helpers**: `polygon()`, `star()`
- **Blend Modes**: `blendMode(NORMAL|ADD|MULTIPLY|SCREEN)`
- **Noise Extensions**: `fbm()`, `ridgedNoise()`, `curlNoise()`
- **Easing Functions**: `easeIn`, `easeOut`, `easeInOut`, `easeCubic`, `easeExpo`

## v1.2.0

- Added `bezier()`, `curve()`, `strokeCap()`, `strokeJoin()`, `shearX()`, `shearY()`
- Added text system: `text()`, `textSize()`, `textFont()`, `textAlign()`, `textWidth()`
- Added `sq()`, `int()`, `TAU`, arc mode constants

## v1.1.1

- **Critical Fix**: `random()` now uses seeded Mulberry32 PRNG (was using Math.random)
- All randomness is now deterministic

## v1.0.x (Protocol Lock)

- **Protocol Lock**: Phase 1 execution surface is now LOCKED
- **Canonical Entry Point**: `executeCodeMode()` is the official execution API
- **VAR[0..9] Protocol Variables**: First-class protocol inputs (read-only, 0-100)
- **Determinism Guarantee**: Same code + seed + vars = identical output

---

## What This SDK Is

This SDK provides the **canonical runtime** for executing p5.js-style generative art:

- **Static Mode**: Executes `setup()` only, outputs PNG
- **Loop Mode**: Frame-authoritative rendering, outputs MP4
- **Deterministic**: Seed-controlled randomness, no external state
- **Protocol-Compliant**: All outputs include verification metadata

The SDK enforces the **NexArt Code Mode Protocol v1.2.0** for reproducible, mint-safe generative art.

---

## What This SDK Is NOT

- **Not a suggestion** — This SDK IS the protocol, not a reference implementation
- **Not a UI library** — No React components, no wallet integration
- **Not an IPFS client** — Does not handle storage or minting
- **Not p5.js** — Uses a minimal subset of p5.js-like functions

---

## Installation

```bash
# Copy the sdk/codemode folder to your project
cp -r sdk/codemode your-project/lib/codemode
```

---

## Canonical API

### `executeCodeMode(input: ExecuteCodeModeInput): Promise<ExecuteCodeModeResult>`

**This is the official, canonical entry point for Code Mode execution.**

All implementations MUST use this function.

```typescript
import { executeCodeMode } from '@nexart/codemode-sdk';

const result = await executeCodeMode({
  source: `
    function setup() {
      background(255);
      fill(0);
      let size = map(VAR[0], 0, 100, 50, 200);
      ellipse(width/2, height/2, size);
    }
  `,
  width: 1950,
  height: 2400,
  seed: 12345,
  vars: [50, 75, 0, 0, 0, 0, 0, 0, 0, 0],
  mode: 'static'
});

// Result includes protocol metadata
console.log(result.metadata.protocol);        // 'nexart'
console.log(result.metadata.engine);          // 'codemode'
console.log(result.metadata.protocolVersion); // '1.2.0'
console.log(result.metadata.deterministic);   // true
console.log(result.image);                    // PNG Blob
```

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | `string` | ✅ | Code with setup() and optional draw() |
| `width` | `number` | ✅ | Canvas width in pixels |
| `height` | `number` | ✅ | Canvas height in pixels |
| `seed` | `number` | ✅ | Seed for deterministic randomness |
| `vars` | `number[]` | ❌ | VAR[0..9] values (0-100), defaults to all zeros |
| `mode` | `'static' \| 'loop'` | ✅ | Execution mode |
| `totalFrames` | `number` | ⚠️ | Required for loop mode |

### Result Structure

```typescript
interface ExecuteCodeModeResult {
  image?: Blob;          // Static mode: PNG
  video?: Blob;          // Loop mode: MP4
  frames?: ImageData[];  // Optional: raw frame data
  metadata: {
    protocol: 'nexart';
    engine: 'codemode';
    protocolVersion: '1.0.0';
    phase: 1;
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

## Legacy API

> ⚠️ **Note**: The `createEngine()` API is still supported but new implementations should use `executeCodeMode()`.

### `createEngine(config: EngineConfig): Engine`

Create a rendering engine instance.

```typescript
import { createEngine } from './codemode';

const engine = createEngine({
  mode: 'static',      // 'static' | 'loop'
  width: 1950,         // Optional, default: 1950
  height: 2400,        // Optional, default: 2400
  duration: 2,         // Loop mode only, 1-4 seconds
  fps: 30,             // Loop mode only, default: 30
});
```

### `engine.run(options: RunOptions): Promise<void>`

Execute code and produce output.

```typescript
await engine.run({
  code: `
    function setup() {
      background(255);
      fill(0);
      // Use VAR for external control
      let size = map(VAR[0], 0, 100, 50, 200);
      ellipse(width/2, height/2, size);
    }
  `,
  seed: 12345,              // Optional: seed for deterministic randomness
  vars: [50, 75, 0, 0, 0, 0, 0, 0, 0, 0],  // Optional: VAR[0..9] values (0-100)
  onPreview: (canvas) => {
    // Optional: called with canvas after first frame
  },
  onProgress: (info) => {
    // Optional: progress updates
    console.log(info.message, info.percent + '%');
  },
  onComplete: (result) => {
    // Required: called with final result
    console.log(result.type); // 'image' | 'video'
    console.log(result.blob); // Blob
  },
  onError: (error) => {
    // Optional: called on error
    console.error(error);
  },
});
```

### Protocol Variables (VAR[0..9]) — Protocol v1.0.0

Protocol variables are first-class inputs that control artwork parameters.

**VAR Specification (SDK v1.0.2):**

| Property | Value | Enforcement |
|----------|-------|-------------|
| Input count | 0-10 (VAR[0]..VAR[9]) | HARD — throws if > 10 |
| Runtime count | Always 10 | Padded with zeros |
| Type | finite number | HARD — throws if non-number |
| Range | 0-100 | HARD — throws if out of range |
| Mutability | Read-only | HARD — Proxy blocks writes |
| Injection | Before execution | Guaranteed |
| Lifecycle | Stable for entire render | Guaranteed |
| Default | All zeros | If not provided |

```typescript
// Pass values when running (0-10 elements)
await engine.run({
  code: myCode,
  vars: [80, 50, 25],  // VAR[0]=80, VAR[1]=50, VAR[2]=25, VAR[3..9]=0
  onComplete: (result) => { /* ... */ },
});

// Or omit entirely (all zeros)
await engine.run({
  code: myCode,
  onComplete: (result) => { /* ... */ },
});

// Access in sketch code
function setup() {
  let density = map(VAR[0], 0, 100, 10, 200);
  let speed = map(VAR[1], 0, 100, 0.5, 5);
  // VAR[5] returns 0 if not provided
}
```

**Rules (Protocol Law):**
- Input accepts 0-10 elements; runtime VAR is always 10 elements
- VAR is injected BEFORE code execution (padded with zeros if needed)
- VAR values are READ-ONLY at runtime (Proxy-protected)
- Writing to VAR throws a protocol error
- Values MUST be in range 0-100 (throws if out of range)
- Same code + same seed + same VARs = identical output

### `engine.stop(): void`

Cancel a running render (Loop mode only).

### `engine.getConfig(): EngineConfig`

Get the resolved engine configuration.

---

## Execution Rules

### Static Mode

1. `setup()` is executed once
2. `draw()` is **NOT** executed
3. Canvas is captured as PNG
4. Time variables are all `0`

### Loop Mode

1. `setup()` is executed once
2. `draw()` is executed once per frame
3. Canvas is **cleared** before each `draw()` call
4. If artist calls `background()` in draw, it paints over the clear
5. No canvas persistence between frames

**Time Variables:**

| Variable | Type | Description |
|----------|------|-------------|
| `frameCount` | int | Current frame (0, 1, 2, ...) |
| `t` | float | Normalized time [0.0, 1.0) |
| `time` | float | Elapsed seconds |
| `tGlobal` | float | Alias for `t` |

---

## Forbidden Patterns — LOCKED v1.0.0

The following 13 patterns are rejected with `[Code Mode Protocol Error]`:

| Pattern | Reason |
|---------|--------|
| `setTimeout` | Async timing breaks determinism |
| `setInterval` | Async timing breaks determinism |
| `requestAnimationFrame` | Async timing breaks determinism |
| `Date.now()` | Time-based entropy forbidden |
| `new Date()` | Time-based entropy forbidden |
| `Math.random()` | Use seeded `random()` instead |
| `fetch()` | External IO forbidden |
| `XMLHttpRequest` | External IO forbidden |
| `createCanvas()` | Canvas is pre-initialized |
| `document.*` | DOM access forbidden |
| `window.*` | DOM access forbidden |
| `import` | External imports forbidden |
| `require()` | External imports forbidden |

Additionally in Loop Mode:
- `noLoop()` — Incompatible with frame capture

---

## Example: Static Mode

```typescript
import { createEngine } from './codemode';

const engine = createEngine({ mode: 'static' });

await engine.run({
  code: `
    function setup() {
      background(30);
      noStroke();
      for (let i = 0; i < 100; i++) {
        fill(random(255), random(255), random(255));
        ellipse(random(width), random(height), 50);
      }
    }
  `,
  onComplete: (result) => {
    // result.type === 'image'
    // result.blob is a PNG Blob
    const url = URL.createObjectURL(result.blob);
    document.body.innerHTML = `<img src="${url}" />`;
  },
});
```

---

## Example: Loop Mode

```typescript
import { createEngine } from './codemode';

const engine = createEngine({
  mode: 'loop',
  duration: 2,  // 2 second loop
});

await engine.run({
  code: `
    function setup() {
      // Called once
    }
    
    function draw() {
      background(30);
      
      // t goes from 0 to 1 over the loop duration
      let x = width/2 + cos(t * TWO_PI) * 200;
      let y = height/2 + sin(t * TWO_PI) * 200;
      
      fill(255);
      ellipse(x, y, 80);
    }
  `,
  onProgress: (info) => {
    console.log(info.message);
  },
  onComplete: (result) => {
    // result.type === 'video'
    // result.blob is an MP4 Blob
    const url = URL.createObjectURL(result.blob);
    document.body.innerHTML = `<video src="${url}" autoplay loop />`;
  },
});
```

---

## Supported Functions

The SDK includes a comprehensive p5.js-like runtime with 130+ functions:

**Drawing:**
`background`, `clear`, `fill`, `noFill`, `stroke`, `noStroke`, `strokeWeight`, `strokeCap`, `strokeJoin`

**Shapes:**
`ellipse`, `circle`, `rect`, `square`, `line`, `point`, `triangle`, `quad`, `arc`, `bezier`, `curve`

**Vertex (v1.4.0):**
`beginShape`, `vertex`, `curveVertex`, `bezierVertex`, `endShape`

**Shape Helpers (v1.3.0):**
`polygon`, `star`

**Transform:**
`push`, `pop`, `translate`, `rotate`, `scale`, `resetMatrix`, `shearX`, `shearY`

**Color:**
`colorMode`, `color`, `lerpColor`, `red`, `green`, `blue`, `alpha`, `hue`, `saturation`, `brightness`

**Text:**
`text`, `textSize`, `textFont`, `textAlign`, `textWidth`

**Blend Modes (v1.3.0):**
`blendMode(NORMAL|ADD|MULTIPLY|SCREEN)`

**Pixel System (v1.4.0):**
`loadPixels`, `updatePixels`, `pixels[]`, `get`, `set`

**Graphics (v1.4.0):**
`createGraphics`, `image`

**Color Formats:**
All of the following are accepted by `fill()`, `stroke()`, `background()`:
- Grayscale: `fill(128)`, `fill(128, 127)`
- RGB: `fill(255, 0, 0)`, `fill(255, 0, 0, 128)`
- Hex: `fill('#ff0000')`, `fill('#f00')`
- CSS: `fill('rgb(255,0,0)')`, `fill('rgba(255,0,0,0.5)')`, `fill('hsl(180,50%,50%)')`

**Protocol Variables:**
`VAR` — Array of 10 values (VAR[0] through VAR[9])

**Math:**
`random`, `noise`, `map`, `constrain`, `lerp`, `dist`, `mag`, `norm`, `sq`, `int`, `fract`, `sign`

**Vectors (v1.3.0):**
`vec`, `vecAdd`, `vecSub`, `vecMult`, `vecMag`, `vecNorm`, `vecDist`

**Noise Extensions (v1.3.0):**
`fbm`, `ridgedNoise`, `curlNoise`

**Easing (v1.3.0):**
`easeIn`, `easeOut`, `easeInOut`, `easeCubic`, `easeExpo`

**Trig:**
`sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`, `radians`, `degrees`

**Constants:**
`PI`, `TWO_PI`, `TAU`, `HALF_PI`, `QUARTER_PI`, `width`, `height`, `frameCount`, `totalFrames`

---

## Video Encoding

Loop Mode requires server-side video encoding. The SDK calls:

```
POST /api/encode-loop
```

Ensure your server has this endpoint available (NexArt provides this).

---

## Files

```
sdk/codemode/
├── index.ts          # Main export
├── execute.ts        # executeCodeMode canonical entry point
├── engine.ts         # createEngine entry point (legacy)
├── types.ts          # TypeScript types
├── static-engine.ts  # Static mode implementation
├── loop-engine.ts    # Loop mode implementation
├── p5-runtime.ts     # p5.js-like runtime
├── builder-manifest.ts # Builder manifest (write-only)
├── CHANGELOG.md      # Version history
└── README.md         # This file
```

---

## License

MIT License

Copyright (c) 2024-2026 NexArt

---

## External Builders

This SDK is designed for use by:

- **NexArt App**: The main generative art platform
- **ByX**: Curated collection system
- **External Builders**: Any platform consuming NexArt Code Mode

### Integration Example

```typescript
import { executeCodeMode } from '@nexart/codemode-sdk';

// Execute with explicit VAR values
const result = await executeCodeMode({
  source: artistCode,
  width: 1950,
  height: 2400,
  seed: 12345,
  vars: [50, 75, 25, 0, 0, 0, 0, 0, 0, 0],  // Exactly 10 values
  mode: 'static'
});

// Result includes full protocol metadata for verification
const { image, metadata } = result;
console.log(metadata.protocolVersion); // '1.2.0'
console.log(metadata.deterministic);   // true
```

### Error Handling

All protocol violations throw descriptive errors:

```typescript
try {
  await executeCodeMode({ ... });
} catch (error) {
  // "[Code Mode Protocol Error] VAR array must have exactly 10 elements, got 5"
  // "[Code Mode Protocol Error] Forbidden pattern: Math.random()"
  console.error(error.message);
}
```

---

## Frozen Execution Guarantees — v1.0.0

The following guarantees are LOCKED and will not change in v1.x:

| Guarantee | Description |
|-----------|-------------|
| Determinism | Same code + same seed + same VARs = identical output |
| Static Mode | `setup()` only, single PNG output |
| Loop Mode | Frame-authoritative, `draw()` per frame, MP4 output |
| Time Semantics | `t` ∈ [0,1), `frameCount` ∈ [0,totalFrames), `time` in seconds |
| Random | Seeded Mulberry32 PRNG via `random()` |
| Noise | Seeded Perlin noise via `noise()` |
| Canvas | Pre-initialized, no `createCanvas()` |
| VAR | Exactly 10 read-only protocol variables |
| Forbidden Patterns | 13 patterns rejected (see above) |

---

## Future Work (Phase 4+)

- External asset loading (controlled)
- WebGL/3D rendering support
- GIF output option
- GSL v1 SDK (protocol layer) — separate package
