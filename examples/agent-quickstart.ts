/**
 * @nexart/codemode-sdk — Agent Quickstart Example
 * See package.json for SDK version
 * 
 * This example demonstrates the RECOMMENDED approach for AI coding agents.
 * 
 * Key principles:
 * - Use createRuntime() — the modern, agent-first API
 * - Always use strict: true to catch determinism violations
 * - Never use Math.random(), Date.now(), or other non-deterministic APIs
 * - Use runtime.random(), runtime.noise() for all randomness
 * - Use runtime.digest() for verification
 * 
 * This example requires NO canvas, NO p5, and is browser-safe.
 */

import { createRuntime } from "../entry/browser";

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: Create a deterministic runtime
// ─────────────────────────────────────────────────────────────────────────────

const runtime = createRuntime({
  seed: "agent-quickstart-demo",  // Any string or number
  vars: [50, 75, 25, 0, 0, 0, 0, 0, 0, 0],  // VAR[0..9] inputs (0-100 each)
  strict: true,  // ALWAYS use strict: true — throws on non-deterministic APIs
  mode: "static",  // "static" = single frame, "loop" = animation
  metadata: { example: "agent-quickstart" }  // Optional metadata for digest
});

console.log("=== Agent Quickstart Example ===\n");

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: Use deterministic APIs
// ─────────────────────────────────────────────────────────────────────────────

// Deterministic random values (Mulberry32 PRNG)
const randomValues = [
  runtime.random(),           // [0, 1) — deterministic float
  runtime.random(),           // Next value in sequence
  runtime.randomInt(0, 100),  // Deterministic integer in range [0, 100]
  runtime.randomInt(1, 6),    // Like rolling a die
  runtime.randomRange(10, 20) // Deterministic float in range [10, 20]
];

console.log("Deterministic random values:");
randomValues.forEach((val, i) => console.log(`  [${i}] ${val}`));
console.log();

// Deterministic noise (Perlin)
const noiseValues = [
  runtime.noise(0.1, 0.2),    // 2D Perlin noise
  runtime.noise(0.5, 0.5),    // Different position
  runtime.noise(1.0, 2.0, 3.0) // 3D Perlin noise
];

console.log("Deterministic noise values:");
noiseValues.forEach((val, i) => console.log(`  [${i}] ${val}`));
console.log();

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: Execute code with strict enforcement
// ─────────────────────────────────────────────────────────────────────────────

// runtime.run() executes code with strict mode enforcement
// If any non-deterministic API is called, it throws an actionable error
const result = runtime.run(() => {
  // This code is safe — uses only deterministic APIs
  const positions: Array<{x: number, y: number}> = [];
  for (let i = 0; i < 5; i++) {
    positions.push({
      x: runtime.random() * 100,
      y: runtime.random() * 100
    });
  }
  return positions;
});

console.log("Generated positions (deterministic):");
result.forEach((pos, i) => console.log(`  [${i}] x=${pos.x.toFixed(2)}, y=${pos.y.toFixed(2)}`));
console.log();

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4: Get state snapshot and digest for verification
// ─────────────────────────────────────────────────────────────────────────────

const state = runtime.getState();
const digest = runtime.digest();

console.log("State snapshot:");
console.log(`  sdkVersion: "${state.sdkVersion}"`);
console.log(`  seed: ${state.seed}`);
console.log(`  vars: [${state.vars.join(", ")}]`);
console.log(`  mode: "${state.mode}"`);
console.log();

console.log("Verification digest:");
console.log(`  ${digest}`);
console.log();

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5: Verify determinism (same inputs → same outputs)
// ─────────────────────────────────────────────────────────────────────────────

// Create a second runtime with identical inputs
const runtime2 = createRuntime({
  seed: "agent-quickstart-demo",
  vars: [50, 75, 25, 0, 0, 0, 0, 0, 0, 0],
  strict: true,
  mode: "static",
  metadata: { example: "agent-quickstart" }
});

// Generate the same sequence
for (let i = 0; i < randomValues.length; i++) {
  if (i < 2) runtime2.random();
  else if (i === 2) runtime2.randomInt(0, 100);
  else if (i === 3) runtime2.randomInt(1, 6);
  else runtime2.randomRange(10, 20);
}

// Generate the same noise values
runtime2.noise(0.1, 0.2);
runtime2.noise(0.5, 0.5);
runtime2.noise(1.0, 2.0, 3.0);

// Run the same code
runtime2.run(() => {
  for (let i = 0; i < 5; i++) {
    runtime2.random();
    runtime2.random();
  }
});

const digest2 = runtime2.digest();

console.log("Determinism verification:");
console.log(`  Runtime 1 digest: ${digest}`);
console.log(`  Runtime 2 digest: ${digest2}`);
console.log(`  Match: ${digest === digest2 ? "✅ PASS" : "❌ FAIL"}`);
console.log();

// ─────────────────────────────────────────────────────────────────────────────
// WHAT NOT TO DO — These would throw in strict mode:
// ─────────────────────────────────────────────────────────────────────────────

console.log("=== Common Mistakes (DO NOT DO THIS) ===\n");
console.log("❌ Math.random()     → Use runtime.random()");
console.log("❌ Date.now()        → Pass time as input or use frame counters");
console.log("❌ performance.now() → Use deterministic timing");
console.log("❌ new Date()        → Pass time as input");
console.log();

// Example of what strict mode catches:
// runtime.run(() => {
//   Math.random();  // Throws: NEXART_STRICT: Non-deterministic API used: Math.random. Use runtime.random() instead.
// });

console.log("=== Example Complete ===");
