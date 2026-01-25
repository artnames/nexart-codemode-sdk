/**
 * @nexart/codemode-sdk — Preflight Release Tests
 * 
 * Extended verification tests for v1.8.3 release validation.
 * Tests strict mode restoration, error messages, and cross-env digest parity.
 * 
 * Run: npx tsx examples/preflight-test.ts
 */

import { createRuntime, RUNTIME_VERSION } from '../runtime';

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  NexArt Code Mode SDK — Preflight Release Tests              ║');
console.log(`║  Version: ${RUNTIME_VERSION.padEnd(52)}║`);
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log();

let passCount = 0;
let failCount = 0;

function test(name: string, fn: () => boolean): void {
  try {
    const result = fn();
    if (result) {
      console.log(`✅ PASS: ${name}`);
      passCount++;
    } else {
      console.log(`❌ FAIL: ${name}`);
      failCount++;
    }
  } catch (error: any) {
    console.log(`❌ FAIL: ${name} — ${error.message}`);
    failCount++;
  }
}

console.log('TEST GROUP 1: Strict Mode Restoration on Throw');
console.log('─'.repeat(60));

test('Strict mode restores Math.random after user code throws', () => {
  const runtime = createRuntime({ seed: 12345, strict: true });
  const originalMathRandom = Math.random;
  
  try {
    runtime.run(() => {
      throw new Error('User code explosion');
    });
  } catch {
    // Expected
  }
  
  const restored = Math.random === originalMathRandom;
  if (!restored) {
    console.log('   ⚠️  Math.random was NOT restored after throw');
  }
  return restored;
});

test('Strict mode restores Date.now after user code throws', () => {
  const runtime = createRuntime({ seed: 12345, strict: true });
  const originalDateNow = Date.now;
  
  try {
    runtime.run(() => {
      throw new Error('User code explosion');
    });
  } catch {
    // Expected
  }
  
  const restored = Date.now === originalDateNow;
  if (!restored) {
    console.log('   ⚠️  Date.now was NOT restored after throw');
  }
  return restored;
});

test('Strict mode restores performance.now after user code throws', () => {
  const runtime = createRuntime({ seed: 12345, strict: true });
  const hasPerformance = typeof performance !== 'undefined' && performance !== null;
  
  if (!hasPerformance) {
    console.log('   ℹ️  performance object not available, skipping');
    return true;
  }
  
  const originalPerformanceNow = performance.now;
  
  try {
    runtime.run(() => {
      throw new Error('User code explosion');
    });
  } catch {
    // Expected
  }
  
  const restored = performance.now === originalPerformanceNow;
  if (!restored) {
    console.log('   ⚠️  performance.now was NOT restored after throw');
  }
  return restored;
});

console.log();
console.log('TEST GROUP 2: Strict Mode Error Messages');
console.log('─'.repeat(60));

test('Math.random error message is actionable', () => {
  const runtime = createRuntime({ seed: 12345, strict: true });
  
  try {
    runtime.run(() => Math.random());
    return false;
  } catch (error: any) {
    const expected = 'NEXART_STRICT: Non-deterministic API used: Math.random. Use runtime.random() instead.';
    const match = error.message === expected;
    if (!match) {
      console.log(`   Expected: "${expected}"`);
      console.log(`   Got:      "${error.message}"`);
    }
    return match;
  }
});

test('Date.now error message is actionable', () => {
  const runtime = createRuntime({ seed: 12345, strict: true });
  
  try {
    runtime.run(() => Date.now());
    return false;
  } catch (error: any) {
    const expected = 'NEXART_STRICT: Non-deterministic API used: Date.now. Pass time as an input or use deterministic counters.';
    const match = error.message === expected;
    if (!match) {
      console.log(`   Expected: "${expected}"`);
      console.log(`   Got:      "${error.message}"`);
    }
    return match;
  }
});

test('performance.now error message is actionable', () => {
  const runtime = createRuntime({ seed: 12345, strict: true });
  const hasPerformance = typeof performance !== 'undefined' && performance !== null;
  
  if (!hasPerformance) {
    console.log('   ℹ️  performance object not available, skipping');
    return true;
  }
  
  try {
    runtime.run(() => performance.now());
    return false;
  } catch (error: any) {
    const expected = 'NEXART_STRICT: Non-deterministic API used: performance.now.';
    const match = error.message === expected;
    if (!match) {
      console.log(`   Expected: "${expected}"`);
      console.log(`   Got:      "${error.message}"`);
    }
    return match;
  }
});

console.log();
console.log('TEST GROUP 3: Digest Determinism');
console.log('─'.repeat(60));

test('Digest is stable across multiple calls', () => {
  const config = { seed: 'stable-digest-test', vars: [10, 20, 30], mode: 'static' as const };
  const runtime1 = createRuntime(config);
  const runtime2 = createRuntime(config);
  
  const digest1 = runtime1.digest();
  const digest2 = runtime2.digest();
  
  if (digest1 !== digest2) {
    console.log(`   Digest 1: ${digest1}`);
    console.log(`   Digest 2: ${digest2}`);
  }
  return digest1 === digest2;
});

test('Digest changes when seed changes', () => {
  const runtime1 = createRuntime({ seed: 'seed-a', vars: [10, 20, 30] });
  const runtime2 = createRuntime({ seed: 'seed-b', vars: [10, 20, 30] });
  
  return runtime1.digest() !== runtime2.digest();
});

test('Digest changes when vars change', () => {
  const runtime1 = createRuntime({ seed: 'same-seed', vars: [10, 20, 30] });
  const runtime2 = createRuntime({ seed: 'same-seed', vars: [10, 20, 31] });
  
  return runtime1.digest() !== runtime2.digest();
});

test('Digest changes when mode changes', () => {
  const runtime1 = createRuntime({ seed: 'same-seed', vars: [10, 20, 30], mode: 'static' });
  const runtime2 = createRuntime({ seed: 'same-seed', vars: [10, 20, 30], mode: 'loop' });
  
  return runtime1.digest() !== runtime2.digest();
});

test('Digest is 16-char hex string', () => {
  const runtime = createRuntime({ seed: 'format-test' });
  const digest = runtime.digest();
  const isValidFormat = /^[0-9a-f]{16}$/.test(digest);
  if (!isValidFormat) {
    console.log(`   Digest format invalid: "${digest}"`);
  }
  return isValidFormat;
});

console.log();
console.log('TEST GROUP 4: PRNG Determinism');
console.log('─'.repeat(60));

test('Same seed produces identical random sequence', () => {
  const seq1: number[] = [];
  const seq2: number[] = [];
  
  const runtime1 = createRuntime({ seed: 'prng-test' });
  const runtime2 = createRuntime({ seed: 'prng-test' });
  
  for (let i = 0; i < 10; i++) {
    seq1.push(runtime1.random());
    seq2.push(runtime2.random());
  }
  
  return seq1.every((v, i) => v === seq2[i]);
});

test('Different seeds produce different sequences', () => {
  const runtime1 = createRuntime({ seed: 'seed-x' });
  const runtime2 = createRuntime({ seed: 'seed-y' });
  
  return runtime1.random() !== runtime2.random();
});

test('Noise is deterministic for same inputs', () => {
  const runtime1 = createRuntime({ seed: 'noise-test' });
  const runtime2 = createRuntime({ seed: 'noise-test' });
  
  const n1 = runtime1.noise(1.5, 2.5, 3.5);
  const n2 = runtime2.noise(1.5, 2.5, 3.5);
  
  return n1 === n2;
});

console.log();
console.log('TEST GROUP 5: Known Digest Values');
console.log('─'.repeat(60));

const knownConfig = { seed: 'known-digest-oracle', vars: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50], mode: 'static' as const };
const knownRuntime = createRuntime(knownConfig);
const oracleDigest = knownRuntime.digest();
console.log(`Oracle digest for cross-env verification: ${oracleDigest}`);

test('Oracle digest format valid', () => {
  return /^[0-9a-f]{16}$/.test(oracleDigest);
});

console.log();
console.log('═'.repeat(60));
console.log(`RESULTS: ${passCount} passed, ${failCount} failed`);
console.log('═'.repeat(60));

if (failCount > 0) {
  console.log('❌ PREFLIGHT FAILED - DO NOT SHIP');
  process.exit(1);
} else {
  console.log('✅ PREFLIGHT PASSED - READY TO SHIP');
  process.exit(0);
}
