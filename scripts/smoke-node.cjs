#!/usr/bin/env node
/**
 * CJS smoke test for @nexart/codemode-sdk
 * Run: node scripts/smoke-node.cjs
 */

const { createRuntime, SDK_VERSION } = require('../dist/cjs/browser.cjs');

console.log('=== CJS Smoke Test ===');
console.log('SDK Version:', SDK_VERSION);

const runtime = createRuntime({
  seed: 12345,
  vars: [50, 50, 50],
  strict: true,
  mode: 'static',
});

const value = runtime.random();
console.log('runtime.random():', value);

if (value === 0.9797282677609473) {
  console.log('Determinism: VERIFIED');
} else {
  console.error('Determinism: FAILED');
  process.exit(1);
}

console.log('CJS smoke test: PASS');
