# NexArt Code Mode — Execution Boundary

Status: **LOCKED (v1.x)**
Scope: **@nexart/codemode-sdk**
Files of record: `engine.ts`, `p5-runtime.ts`

This document is normative for the Code Mode execution surface. It defines the boundary between **user code** and the **NexArt runtime**.

---

## 1) What user code CAN do

User code is JavaScript that is executed by the NexArt engine inside a constrained, p5-compatible runtime.

User code may:

- Define `setup()` and (when in loop mode) `draw()`
- Use the provided p5-style drawing API (as implemented by `p5-runtime.ts`)
- Read from the NexArt-provided global dimensions and frame state (e.g. `width`, `height`, `frameCount`, etc.)
- Use `VAR` / protocol variables (if present in the configured mode) as inputs to control the system
- Perform deterministic computation (math, loops, pure functions) to produce output
- Render content through the runtime’s drawing primitives (not through direct canvas access)

In short: **user code describes the system. The runtime executes it.**

---

## 2) What user code CANNOT do

User code must not be able to escape the canonical execution surface.

User code cannot:

- Access the raw HTMLCanvasElement
- Access the underlying 2D context (`ctx`) directly
- Modify the engine lifecycle (initialization, compilation, execution order)
- Control scheduling, timing, or the render loop outside the runtime-owned flow
- Perform network calls or IO through NexArt-provided interfaces (there are none)
- Depend on environment-specific state via NexArt runtime hooks (there are none)

### Important: “No direct canvas / ctx exposure”
The runtime **must never** expose `canvas` or `ctx` to user code, directly or indirectly.

All rendering must occur through the p5-compatible surface implemented by the SDK.

---

## 3) What the runtime GUARANTEES

The NexArt runtime (engine + p5 runtime) owns the execution boundary and guarantees:

- **Controlled execution**: user code runs only via NexArt’s engine-controlled evaluation path
- **Stable drawing surface**: drawing is done through the SDK’s provided p5-like API, not browser primitives
- **Lifecycle ownership**:
  - Static mode: `setup()` executes once, produces a single frame
  - Loop mode: `setup()` executes once, `draw()` executes on runtime-owned ticks
- **Dimension ownership**: `width` / `height` are defined by the runtime’s configured surface
- **No implicit fallbacks**: errors must surface explicitly; the engine must not silently “do something else”
- **Determinism boundary**: determinism is enforced by the runtime surface and execution model, not by user code

> Determinism is a property of the *execution boundary*.  
> If the boundary is preserved, determinism enforcement remains possible and testable.

---

## 4) Non-goals

The Code Mode SDK does **not** aim to:

- Be a full browser sandbox or security product
- Support arbitrary p5.js plugins or external runtime extensions by default
- Provide “convenience” features that bypass the canonical surface
- Guarantee performance for hostile or intentionally expensive sketches
- Guarantee cross-version equivalence when a protocol version changes (versioning exists for this reason)

---

## 5) Locked invariant (one sentence)

**User code runs inside the NexArt-owned p5-compatible runtime; determinism is enforced at the engine/runtime boundary, not by user code.**

---

## 6) Change control

Any change that affects any of the following is an **execution boundary change** and must be treated as protocol-impacting:

- Exposed globals
- Drawing API surface (add/remove/behavior changes)
- User code lifecycle (what runs when)
- Any form of `canvas` / `ctx` exposure
- Time/randomness ownership rules
- Any new capability that enables environment-dependent behavior

Execution boundary changes require:
- Explicit documentation update in this file
- Protocol versioning review (and bump if normative behavior changes)

---
