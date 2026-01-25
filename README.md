# @nexart/codemode-sdk

**Version: 1.8.4 (Protocol v1.2.0)**

A deterministic execution runtime for reproducible, verifiable computation.

---

## Which API Should I Use?

**Decision table for choosing the right entrypoint:**

| Your Goal | Use This | Import Path |
|-----------|----------|-------------|
| Deterministic random/noise in any environment | **`createRuntime()`** ✅ DEFAULT | `@nexart/codemode-sdk` |
| AI agent integration | **`createRuntime()`** ✅ DEFAULT | `@nexart/codemode-sdk` |
| Browser/React/Vite app | **`createRuntime()`** ✅ DEFAULT | `@nexart/codemode-sdk` |
| Server-side image rendering | `executeCodeMode()` | `@nexart/codemode-sdk/node` |
| Full p5.js-style canvas execution | `executeCodeMode()` | `@nexart/codemode-sdk/node` |

**`createRuntime()`** is the **default and recommended** API:
- ✅ Works in browser and Node.js
- ✅ No canvas dependency
- ✅ Agent-first design
- ✅ Strict mode enforcement
- ✅ Lightweight

**`executeCodeMode()`** is the **legacy / Node-only** API:
- Requires Node.js with `canvas` package
- Full p5.js-style execution environment
- Returns rendered PNG/MP4
- Use only when you need actual image/video output

---

## What This SDK Does

This SDK provides a **deterministic runtime layer** for executing code that must produce identical output given identical inputs — across environments, over time, and under verification.

**Core guarantees:**
- Same `seed` + `vars` + `code` → identical output (always)
- Cross-environment stability (browser, Node.js, CI pipelines)
- Strict mode blocks non-deterministic APIs (`Math.random`, `Date.now`, etc.)
- Canonical state snapshots for replay and verification
- Stable digest for integrity verification

---

## Who This Is For

**Use this SDK if determinism is non-negotiable:**

- **On-chain generative art** — NFTs, archival renders, mint verification
- **Procedural games** — Open-world generation, replay systems, save states
- **Simulations** — Physics, agent-based models, reproducible experiments
- **Finance research** — Backtesting, Monte Carlo, reproducible analysis
- **Education labs** — Repeatable demonstrations, grading consistency

**Skip this SDK if you're building:**

- CRUD apps
- Dashboards
- E-commerce
- Typical web applications without reproducibility requirements

For most applications, seeded randomness is unnecessary complexity.

---

## For AI Coding Agents (Replit / Lovable / Claude Code)

**Always start with `createRuntime()` — it is the default and recommended API.**

### Quick Rules for AI Agents

1. **Always use `createRuntime()`** — NOT `executeCodeMode()`
2. **Never use `Math.random()` or `Date.now()`** — use `runtime.random()` instead
3. **Always use `strict: true`** — unless you explicitly know why you aren't
4. **See `examples/agent-quickstart.ts`** — copy-paste ready reference

### Minimal Example

```typescript
import { createRuntime } from "@nexart/codemode-sdk";

const runtime = createRuntime({
  seed: "my-artwork-42",
  vars: [50, 75, 25],
  strict: true,  // ALWAYS use strict: true — throws on non-deterministic APIs
  mode: "static"
});

// Deterministic APIs (use these, not Math.random!)
const value = runtime.random();          // [0, 1)
const intVal = runtime.randomInt(0, 10); // integer in range
const n = runtime.noise(0.5, 0.5);       // Perlin noise

// Execute with strict enforcement
const result = runtime.run(() => {
  // Your deterministic code here
  return runtime.random() * 100;
});

// Verification
console.log(runtime.digest());   // Stable hash for verification
console.log(runtime.getState()); // Canonical state snapshot for replay
```

### Strict Mode Explained

Strict mode protects determinism by intercepting non-deterministic APIs during `runtime.run()`:

```typescript
runtime.run(() => {
  Math.random();  // Throws: NEXART_STRICT: Non-deterministic API used: Math.random. Use runtime.random() instead.
  Date.now();     // Throws: NEXART_STRICT: Non-deterministic API used: Date.now. Pass time as an input or use deterministic counters.
});
```

**Why strict mode exists:**
- Determinism is the core guarantee — same inputs must always produce same outputs
- AI agents often default to `Math.random()` before reading documentation
- Strict mode catches these mistakes immediately with actionable error messages
- Interception is **scoped to `runtime.run()`** — it does NOT globally mutate your application
- Globals are restored after execution

**When to use `strict: false`:**
- Almost never. Only if you're intentionally mixing deterministic and non-deterministic code.
- If you're not sure, use `strict: true`.

---

## Where This Fits

```
┌─────────────────────────────────────────────────────────┐
│  Your Application                                       │
│  (React, Canvas, Three.js, game engine, simulation)     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  @nexart/codemode-sdk                                   │
│  Deterministic runtime layer                            │
│  - Seeded PRNG (Mulberry32)                             │
│  - Seeded noise (Perlin)                                │
│  - Strict mode enforcement                              │
│  - State snapshots + digest                             │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Output                                                 │
│  - Deterministic result                                 │
│  - Verification digest                                  │
│  - Replay state                                         │
└─────────────────────────────────────────────────────────┘
```

The SDK sits between your UI/framework and your output. It does not render, does not manage state, does not touch the DOM. It provides deterministic primitives.

---

## Why Not Roll Your Own?

**What's easy:**
- Seeded PRNG (dozens of implementations exist)
- Noise libraries (simplex, Perlin, available everywhere)

**What's hard:**
- **Cross-environment stability** — Same seed producing same sequence across browser versions, Node.js versions, bundlers, and platforms
- **Strict enforcement** — Actually blocking `Math.random()` and `Date.now()` during execution, with actionable error messages
- **Replay and verification** — Canonical state snapshots that can reconstruct execution
- **Long-term drift resistance** — Guaranteeing identical output years later, not just today

If you need a quick seeded random, use any PRNG. If you need guaranteed reproducibility across time, environments, and verification systems — that's what this SDK provides.

---

## Determinism Contract

✅ **Guaranteed:**
- Same `sdkVersion` + `seed` + `vars` → identical output
- Cross-environment stable digest (browser, Node.js, CI)
- Seeded PRNG via `runtime.random()` (Mulberry32)
- Seeded noise via `runtime.noise()` (Perlin)

❌ **Forbidden (blocked in strict mode):**
- `Math.random()` — use `runtime.random()` instead
- `Date.now()` — pass time as input or use frame counters
- `performance.now()` — use deterministic timing
- External IO during deterministic runs

---

## Feature Comparison

| Feature | Plain PRNG | This SDK |
|---------|-----------|----------|
| Seeded random | ✅ | ✅ |
| Seeded noise | ❌ (separate lib) | ✅ built-in |
| Strict mode (blocks entropy) | ❌ | ✅ |
| Canonical state snapshot | ❌ | ✅ `getState()` |
| Cross-env stable digest | ❌ | ✅ `digest()` |
| VAR protocol (0-100 inputs) | ❌ | ✅ |
| Replay/verification | Manual | Built-in |
| Error messages for agents | ❌ | ✅ actionable |

---

## Environment Imports

| Environment | Import Path |
|-------------|-------------|
| Browser / Vite / Next.js / React | `import { createRuntime } from "@nexart/codemode-sdk"` |
| Node.js (general use) | `import { createRuntime } from "@nexart/codemode-sdk"` |
| Node.js server rendering (canvas) | `import { executeCodeMode } from "@nexart/codemode-sdk/node"` |

**The default import is browser-safe.** Node-only features require explicit `/node` import.

---

## Used By

- **NexArt** — Generative art platform
- **ByX** — Curated collections
- **Frontierra** — External builder integration

These are examples — the SDK is designed for any system requiring deterministic execution.

---

## Protocol Stability

| Property | Value |
|----------|-------|
| Protocol Version | v1.2.0 |
| Status | **STABLE** |
| SDK Version | 1.8.4 |

**Core protocol surface is frozen. Breaking changes require v2.0.0.**

The following are locked in v1.x:
- Execution model (Static and Loop modes)
- VAR[0..9] specification
- Determinism guarantee
- Time semantics (t, frameCount, time, tGlobal, totalFrames)
- Random and noise behavior
- Forbidden patterns list

---

## Licensing

Free for personal projects, experiments, research, and open-source.

Commercial production deployments require a license.

See [COMMERCIAL.md](./COMMERCIAL.md) for details.

---

## Installation

```bash
npm install @nexart/codemode-sdk
```

---

## Runtime API

### `createRuntime(options)`

Create a deterministic runtime instance.

```typescript
import { createRuntime } from "@nexart/codemode-sdk";

const runtime = createRuntime({
  seed: "my-seed",
  vars: [50, 75],
  strict: true,
  mode: "static",
  metadata: { artist: "demo" }
});

runtime.random();           // Deterministic PRNG
runtime.randomInt(0, 100);  // Deterministic integer
runtime.noise(x, y, z);     // Deterministic Perlin noise
runtime.digest();           // Stable hash for verification
runtime.getState();         // Canonical state snapshot
runtime.run(() => { ... }); // Execute with strict enforcement
```

### Strict Mode

When `strict: true`, the runtime intercepts non-deterministic APIs during `run()`:

```typescript
runtime.run(() => {
  Math.random();  // Throws: NEXART_STRICT: Non-deterministic API used
});
```

Strict mode:
- Only applies during `runtime.run()` — non-invasive
- Does NOT globally mutate your application
- Provides actionable error messages

---

## Browser Usage

For Vite, React, Next.js, or any browser environment:

```typescript
import {
  createRuntime,
  runLoopMode,
  cancelLoopMode,
  createP5Runtime,
  validateCodeModeSource,
} from '@nexart/codemode-sdk';
```

**What's included:**
- Runtime API (createRuntime)
- P5 runtime (createP5Runtime, injectTimeVariables, injectProtocolVariables)
- Loop engine (runLoopMode, cancelLoopMode)
- Execution sandbox (FORBIDDEN_APIS, createSafeMath)
- Validation (validateCodeModeSource)

**What's NOT included (Node.js only):**
- `executeCodeMode` — Requires Node.js canvas
- `runStaticMode` — Requires Node.js canvas

---

## Node.js Usage

For server-side rendering, oracles, or CLI tools:

```typescript
import {
  executeCodeMode,
  runStaticMode,
  runLoopMode,
  validateCodeModeSource,
} from '@nexart/codemode-sdk/node';
```

**Requirements:**
- Node.js 18+
- `canvas` package for static mode

---

## Canonical Execution API

### `executeCodeMode(input): Promise<Result>`

For systems requiring p5.js-style execution with full protocol metadata:

```typescript
import { executeCodeMode } from '@nexart/codemode-sdk/node';

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

console.log(result.metadata.deterministic); // true
console.log(result.image);                  // PNG Blob
```

---

## Execution Rules

### Static Mode
1. `setup()` executes once
2. `draw()` is NOT executed
3. Canvas captured as PNG
4. Time variables are 0

### Loop Mode
1. `setup()` executes once
2. `draw()` executes per frame
3. Canvas cleared before each `draw()`

**Time Variables:**

| Variable | Type | Description |
|----------|------|-------------|
| `frameCount` | int | Current frame (0, 1, 2, ...) |
| `t` | float | Normalized time [0.0, 1.0) |
| `time` | float | Elapsed seconds |
| `tGlobal` | float | Alias for `t` |
| `totalFrames` | int | Total frames in loop |

---

## Forbidden Patterns

The following are rejected with `[Code Mode Protocol Error]`:

| Pattern | Reason |
|---------|--------|
| `Math.random()` | Use seeded `random()` |
| `Date.now()` | Time-based entropy |
| `new Date()` | Time-based entropy |
| `performance.now()` | Timing entropy |
| `crypto.getRandomValues()` | Crypto randomness |
| `fetch()` | External IO |
| `setTimeout` | Async timing |
| `setInterval` | Async timing |
| `requestAnimationFrame` | Async timing |
| `document.*` | DOM access |
| `window.*` | DOM access |
| `import` | External imports |
| `require()` | External imports |

---

## Examples

```bash
npm run example:agent   # Agent quickstart (RECOMMENDED for AI agents)
npm run example:basic   # Basic usage
npm run example:verify  # Determinism verification
```

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---

## License

**MIT License** — Free for all use, including commercial.

NexArt monetizes optional hosted services (attestation, verification, compliance), not the SDK.

See [Core vs Edges](./docs/core-vs-edges.md) for details on what's free vs paid.

---

## About

This SDK is a reference implementation of a deterministic execution protocol designed for replay, verification, and long-term stability.

It prioritizes correctness and reproducibility over features.
