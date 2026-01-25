#!/usr/bin/env node
/**
 * ESM smoke test for @nexart/codemode-sdk
 * Run: node scripts/smoke-node.mjs
 */

import { createRuntime, SDK_VERSION } from '../dist/esm/browser.js';

console.log('=== ESM Smoke Test ===');
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

console.log('ESM smoke test: PASS');
