# Code Mode Execution Boundary

**See version.ts for SDK version (Protocol v1.2.0)**

╔══════════════════════════════════════════════════════════════════════════════╗
║  EXECUTION BOUNDARY — HARD ENFORCEMENT                                       ║
║                                                                              ║
║  Wall-clock time, monotonic time, environment globals, and external          ║
║  entropy sources are FORBIDDEN. Only protocol time variables are allowed.    ║
╚══════════════════════════════════════════════════════════════════════════════╝

---

## Overview

The NexArt Code Mode SDK enforces determinism by blocking all external entropy sources at **runtime**, not just via static pattern scanning. Any attempt to access forbidden APIs throws a `[Code Mode Protocol Error]` immediately.

---

## Blocked APIs

### Time APIs (Wall-Clock / Monotonic)

| API | Status | Error Message |
|-----|--------|---------------|
| `Date` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: Date` |
| `Date.now` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: Date.now` |
| `Date.parse` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: Date.parse` |
| `new Date()` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: new Date()` |
| `performance` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: performance` |
| `performance.now` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: performance.now` |

### Environment Globals

| API | Status | Error Message |
|-----|--------|---------------|
| `process` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: process` |
| `navigator` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: navigator` |
| `globalThis` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: globalThis` |
| `window` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: window` |
| `document` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: document` |
| `self` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: self` |

### External Entropy

| API | Status | Error Message |
|-----|--------|---------------|
| `crypto` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: crypto` |
| `crypto.getRandomValues` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: crypto.getRandomValues` |
| `Math.random` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: Math.random() — use random() instead (seeded)` |

### Async Timing

| API | Status | Error Message |
|-----|--------|---------------|
| `setTimeout` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: setTimeout` |
| `setInterval` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: setInterval` |
| `requestAnimationFrame` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: requestAnimationFrame` |
| `clearTimeout` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: clearTimeout` |
| `clearInterval` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: clearInterval` |

### External I/O

| API | Status | Error Message |
|-----|--------|---------------|
| `fetch` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: fetch` |
| `XMLHttpRequest` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: XMLHttpRequest` |
| `WebSocket` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: WebSocket` |

### Storage / DOM

| API | Status | Error Message |
|-----|--------|---------------|
| `localStorage` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: localStorage` |
| `sessionStorage` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: sessionStorage` |
| `indexedDB` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: indexedDB` |
| `location` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: location` |
| `history` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: history` |

### Dynamic Code Execution

| API | Status | Error Message |
|-----|--------|---------------|
| `eval` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: eval` |
| `Function` | ❌ BLOCKED | `[Code Mode Protocol Error] Forbidden API: Function` |

---

## Allowed Protocol Time Variables

| Variable | Type | Description |
|----------|------|-------------|
| `frameCount` | int | Current frame (0, 1, 2, ...) |
| `t` | float | Normalized time [0.0, 1.0) |
| `time` | float | Elapsed seconds |
| `tGlobal` | float | Alias for `t` |
| `totalFrames` | int | Total frames in loop mode |

---

## Allowed Random/Noise Functions

| Function | Description |
|----------|-------------|
| `random()` | Seeded Mulberry32 PRNG |
| `randomSeed(seed)` | Reset random seed |
| `randomGaussian()` | Seeded Gaussian distribution |
| `noise(x, y?, z?)` | Seeded Perlin noise |
| `noiseSeed(seed)` | Reset noise seed |

---

## Enforcement Mechanism

The SDK uses a **dual enforcement** strategy:

### 1. Static Pattern Scanning

The `validateInput()` function in `execute.ts` scans source code for forbidden patterns:

```javascript
const forbiddenPatterns = [
  { pattern: /setTimeout\s*\(/, name: 'setTimeout' },
  { pattern: /Math\.random\s*\(/, name: 'Math.random()' },
  // ... etc
];
```

### 2. Runtime Sandbox

The execution engines (`static-engine.ts`, `loop-engine.ts`) inject **blocked stubs** as function parameters that override global scope:

```javascript
// All forbidden APIs are passed as parameters to override globals
const wrappedSetup = new Function(
  'p', 'frameCount', 't', 'time', 'tGlobal', 'VAR', 'Math', 
  ...forbiddenKeys,  // Date, performance, process, navigator, etc.
  `with(p) { ${setupCode} }`
);

// Execute with blocked stubs
wrappedSetup(p, 0, 0, 0, 0, p.VAR, safeMath, ...forbiddenValues);
```

This ensures that even alternate access paths (e.g., `globalThis.Date`, `Date.parse`) are blocked.

---

## Before/After Comparison

### BEFORE (Reachable)

The following were reachable from inside a sketch:

- ✅ `Date` — Could access wall-clock time
- ✅ `Date.now()` — Could get milliseconds since epoch
- ✅ `Date.parse()` — Could parse date strings
- ✅ `new Date()` — Could create date objects
- ✅ `performance.now()` — Could get monotonic time
- ✅ `process` — Could access Node.js environment
- ✅ `navigator` — Could access browser info
- ✅ `globalThis` — Could access global scope
- ✅ `crypto.getRandomValues()` — Could get external entropy
- ⛔ `Math.random()` — Already blocked via static scan

### AFTER (All Blocked)

All of the above now throw `[Code Mode Protocol Error]` at runtime:

- ❌ `Date` — Throws immediately
- ❌ `Date.now()` — Throws immediately
- ❌ `Date.parse()` — Throws immediately
- ❌ `new Date()` — Throws immediately
- ❌ `performance.now()` — Throws immediately
- ❌ `process` — Throws immediately
- ❌ `navigator` — Throws immediately
- ❌ `globalThis` — Throws immediately
- ❌ `crypto.getRandomValues()` — Throws immediately
- ❌ `Math.random()` — Throws immediately (runtime block, not just static)

---

## Confirmation

**User code cannot access:**
- Date / performance / process / navigator / globalThis / crypto entropy

**Determinism is guaranteed:**
- Same code + same seed + same VARs = identical output
- No external state, no browser entropy, no time-based drift

---

## Tests

Run the execution boundary tests:

```bash
cd sdk/codemode
npx tsx tests/execution-boundary.test.ts
```

---

## Files

| File | Purpose |
|------|---------|
| `execution-sandbox.ts` | Forbidden API stubs and sandbox utilities |
| `static-engine.ts` | Static mode with sandboxed execution |
| `loop-engine.ts` | Loop mode with sandboxed execution |
| `tests/execution-boundary.test.ts` | Regression tests for blocked APIs |
