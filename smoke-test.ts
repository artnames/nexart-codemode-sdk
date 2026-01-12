/**
 * Minimal Smoke Tests for NexArt SDKs
 * 
 * SDK v1.4.0 — Protocol v1.2.0
 * 
 * Goal: Verify that the same input produces:
 * - The same errors (validation)
 * - The same edge behavior
 * 
 * Tests @nexart/codemode-sdk
 * 
 * NOTE: Execution tests require a browser environment (canvas/document).
 * In Node.js, only validation tests run. Execution tests are skipped.
 */

import { executeCodeMode, validateCodeModeSource } from './execute';

interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
}

const results: TestResult[] = [];
const isNode = typeof document === 'undefined';

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true, expected: 'pass', actual: 'pass' });
  } catch (e: any) {
    results.push({ name, passed: false, expected: 'pass', actual: e.message });
  }
}

function expectError(name: string, fn: () => void, expectedMessage: string) {
  try {
    fn();
    results.push({ name, passed: false, expected: `Error: ${expectedMessage}`, actual: 'No error thrown' });
  } catch (e: any) {
    const matches = e.message.includes(expectedMessage);
    results.push({ 
      name, 
      passed: matches, 
      expected: `Error containing: ${expectedMessage}`, 
      actual: e.message 
    });
  }
}

async function expectAsyncError(name: string, fn: () => Promise<any>, expectedMessage: string) {
  try {
    await fn();
    results.push({ name, passed: false, expected: `Error: ${expectedMessage}`, actual: 'No error thrown' });
  } catch (e: any) {
    const matches = e.message.includes(expectedMessage);
    results.push({ 
      name, 
      passed: matches, 
      expected: `Error containing: ${expectedMessage}`, 
      actual: e.message 
    });
  }
}

async function expectAsyncSuccess(name: string, fn: () => Promise<any>) {
  try {
    await fn();
    results.push({ name, passed: true, expected: 'success', actual: 'success' });
  } catch (e: any) {
    results.push({ name, passed: false, expected: 'success', actual: e.message });
  }
}

function skip(name: string, reason: string) {
  results.push({ name: `[SKIP] ${name}`, passed: true, expected: reason, actual: reason });
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('  SMOKE TESTS: @nexart/codemode-sdk v1.1.1');
console.log('═══════════════════════════════════════════════════════════════\n');

if (isNode) {
  console.log('  Environment: Node.js (no DOM)');
  console.log('  Execution tests will be skipped.\n');
} else {
  console.log('  Environment: Browser\n');
}

console.log('1. VAR Validation Tests (0-10 elements allowed)\n');

// These tests validate input before execution, so they work in Node.js
// The error is thrown during validation, not during canvas operations

if (isNode) {
  skip('VAR omitted works', 'Requires browser (canvas)');
  skip('VAR empty array works', 'Requires browser (canvas)');
  skip('VAR length 2 works', 'Requires browser (canvas)');
  skip('VAR length 10 works (backwards compatible)', 'Requires browser (canvas)');
} else {
  await expectAsyncSuccess(
    'VAR omitted works',
    () => executeCodeMode({
      source: 'function setup() { background(VAR[0]); }',
      width: 100,
      height: 100,
      seed: 1,
      mode: 'static'
    })
  );

  await expectAsyncSuccess(
    'VAR empty array works',
    () => executeCodeMode({
      source: 'function setup() { background(VAR[0]); }',
      width: 100,
      height: 100,
      seed: 1,
      vars: [],
      mode: 'static'
    })
  );

  await expectAsyncSuccess(
    'VAR length 2 works',
    () => executeCodeMode({
      source: 'function setup() { background(VAR[0] + VAR[1]); }',
      width: 100,
      height: 100,
      seed: 1,
      vars: [50, 75],
      mode: 'static'
    })
  );

  await expectAsyncSuccess(
    'VAR length 10 works (backwards compatible)',
    () => executeCodeMode({
      source: 'function setup() { background(VAR[9]); }',
      width: 100,
      height: 100,
      seed: 1,
      vars: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90],
      mode: 'static'
    })
  );
}

// These throw before canvas operations, so they work in Node.js
await expectAsyncError(
  'VAR length 11 throws',
  () => executeCodeMode({
    source: 'function setup() { background(0); }',
    width: 100,
    height: 100,
    seed: 1,
    vars: [1,2,3,4,5,6,7,8,9,10,11],
    mode: 'static'
  }),
  'VAR array must have at most 10 elements'
);

await expectAsyncError(
  'VAR value -1 throws',
  () => executeCodeMode({
    source: 'function setup() { background(0); }',
    width: 100,
    height: 100,
    seed: 1,
    vars: [-1, 50],
    mode: 'static'
  }),
  'out of range'
);

await expectAsyncError(
  'VAR value 101 throws',
  () => executeCodeMode({
    source: 'function setup() { background(0); }',
    width: 100,
    height: 100,
    seed: 1,
    vars: [50, 101],
    mode: 'static'
  }),
  'out of range'
);

await expectAsyncError(
  'VAR non-number value throws',
  () => executeCodeMode({
    source: 'function setup() { background(0); }',
    width: 100,
    height: 100,
    seed: 1,
    vars: [1, 2, 'three' as any],
    mode: 'static'
  }),
  'VAR[2] must be a finite number'
);

console.log('2. Forbidden Pattern Tests\n');

// These throw during source validation, before canvas
await expectAsyncError(
  'Math.random() forbidden',
  () => executeCodeMode({
    source: 'function setup() { let x = Math.random(); }',
    width: 100,
    height: 100,
    seed: 1,
    mode: 'static'
  }),
  'Forbidden pattern: Math.random()'
);

await expectAsyncError(
  'setTimeout forbidden',
  () => executeCodeMode({
    source: 'function setup() { setTimeout(() => {}, 100); }',
    width: 100,
    height: 100,
    seed: 1,
    mode: 'static'
  }),
  'Forbidden pattern: setTimeout'
);

await expectAsyncError(
  'Date.now() forbidden',
  () => executeCodeMode({
    source: 'function setup() { let t = Date.now(); }',
    width: 100,
    height: 100,
    seed: 1,
    mode: 'static'
  }),
  'Forbidden pattern: Date.now()'
);

await expectAsyncError(
  'fetch() forbidden',
  () => executeCodeMode({
    source: 'function setup() { fetch("url"); }',
    width: 100,
    height: 100,
    seed: 1,
    mode: 'static'
  }),
  'Forbidden pattern: fetch()'
);

await expectAsyncError(
  'document.* forbidden',
  () => executeCodeMode({
    source: 'function setup() { document.body; }',
    width: 100,
    height: 100,
    seed: 1,
    mode: 'static'
  }),
  'Forbidden pattern: DOM access'
);

await expectAsyncError(
  'window.* forbidden',
  () => executeCodeMode({
    source: 'function setup() { window.location; }',
    width: 100,
    height: 100,
    seed: 1,
    mode: 'static'
  }),
  'Forbidden pattern: DOM access'
);

console.log('3. Loop Mode Validation Tests\n');

await expectAsyncError(
  'Loop mode requires draw()',
  () => executeCodeMode({
    source: 'function setup() { background(0); }',
    width: 100,
    height: 100,
    seed: 1,
    mode: 'loop',
    totalFrames: 30
  }),
  'Loop mode requires a draw() function'
);

await expectAsyncError(
  'noLoop() forbidden in loop mode',
  () => executeCodeMode({
    source: 'function setup() {} function draw() { noLoop(); }',
    width: 100,
    height: 100,
    seed: 1,
    mode: 'loop',
    totalFrames: 30
  }),
  'noLoop() is forbidden in Loop mode'
);

console.log('4. validateCodeModeSource Tests\n');

test('validateCodeModeSource detects Math.random', () => {
  const result = validateCodeModeSource('let x = Math.random();', 'static');
  if (result.valid) throw new Error('Should be invalid');
  if (!result.errors.some(e => e.includes('Math.random'))) {
    throw new Error('Should contain Math.random error');
  }
});

test('validateCodeModeSource accepts valid code', () => {
  const result = validateCodeModeSource('function setup() { background(0); }', 'static');
  if (!result.valid) throw new Error('Should be valid: ' + result.errors.join(', '));
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  RESULTS');
console.log('═══════════════════════════════════════════════════════════════\n');

const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;
const skipped = results.filter(r => r.name.startsWith('[SKIP]')).length;

results.forEach(r => {
  const status = r.passed ? (r.name.startsWith('[SKIP]') ? '○' : '✓') : '✗';
  console.log(`${status} ${r.name}`);
  if (!r.passed) {
    console.log(`  Expected: ${r.expected}`);
    console.log(`  Actual:   ${r.actual}`);
  }
});

console.log(`\n${passed - skipped} passed, ${skipped} skipped, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
