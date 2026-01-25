/**
 * @nexart/codemode-sdk — Verification Example
 * 
 * Demonstrates determinism verification and strict mode error handling.
 * 
 * Run: npm run example:verify
 */

import { createRuntime } from '../runtime';

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  NexArt Code Mode SDK — Verification Example                 ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log();

function generateRandomSequence(seed: string | number, vars: number[], count: number): number[] {
  const runtime = createRuntime({ seed, vars, strict: true });
  const values: number[] = [];
  for (let i = 0; i < count; i++) {
    values.push(runtime.random());
  }
  return values;
}

console.log('TEST 1: Same seed + vars = same output');
console.log('─'.repeat(50));

const seq1 = generateRandomSequence('test-seed', [50, 25], 5);
const seq2 = generateRandomSequence('test-seed', [50, 25], 5);

console.log('Run 1:', seq1.map(v => v.toFixed(6)).join(', '));
console.log('Run 2:', seq2.map(v => v.toFixed(6)).join(', '));

const identical = seq1.every((v, i) => v === seq2[i]);
console.log(`Result: ${identical ? '✅ PASS' : '❌ FAIL'} — sequences are ${identical ? 'identical' : 'different'}`);
console.log();

console.log('TEST 2: Same seed + vars = same digest');
console.log('─'.repeat(50));

const runtime1 = createRuntime({ seed: 'digest-test', vars: [10, 20, 30] });
const runtime2 = createRuntime({ seed: 'digest-test', vars: [10, 20, 30] });

const digest1 = runtime1.digest();
const digest2 = runtime2.digest();

console.log('Digest 1:', digest1);
console.log('Digest 2:', digest2);

const digestsMatch = digest1 === digest2;
console.log(`Result: ${digestsMatch ? '✅ PASS' : '❌ FAIL'} — digests are ${digestsMatch ? 'identical' : 'different'}`);
console.log();

console.log('TEST 3: Different vars = different digest');
console.log('─'.repeat(50));

const runtime3 = createRuntime({ seed: 'digest-test', vars: [10, 20, 30] });
const runtime4 = createRuntime({ seed: 'digest-test', vars: [10, 20, 31] });

const digest3 = runtime3.digest();
const digest4 = runtime4.digest();

console.log('Digest (vars [10,20,30]):', digest3);
console.log('Digest (vars [10,20,31]):', digest4);

const digestsDiffer = digest3 !== digest4;
console.log(`Result: ${digestsDiffer ? '✅ PASS' : '❌ FAIL'} — digests are ${digestsDiffer ? 'different' : 'identical'}`);
console.log();

console.log('TEST 4: Strict mode blocks Math.random');
console.log('─'.repeat(50));

const strictRuntime = createRuntime({ seed: 12345, strict: true });

let strictErrorCaught = false;
let errorMessage = '';

try {
  strictRuntime.run(() => {
    return Math.random();
  });
} catch (error: any) {
  strictErrorCaught = true;
  errorMessage = error.message;
}

console.log('Called Math.random() in strict run...');
console.log(`Error caught: ${strictErrorCaught}`);
if (strictErrorCaught) {
  console.log(`Error message: "${errorMessage}"`);
}

const expectedMessage = 'NEXART_STRICT: Non-deterministic API used: Math.random. Use runtime.random() instead.';
const correctError = errorMessage === expectedMessage;
console.log(`Result: ${strictErrorCaught && correctError ? '✅ PASS' : '❌ FAIL'} — strict mode ${strictErrorCaught ? 'blocked' : 'did not block'} Math.random`);
console.log();

console.log('TEST 5: Strict mode blocks Date.now');
console.log('─'.repeat(50));

let dateErrorCaught = false;
let dateErrorMessage = '';

try {
  strictRuntime.run(() => {
    return Date.now();
  });
} catch (error: any) {
  dateErrorCaught = true;
  dateErrorMessage = error.message;
}

console.log('Called Date.now() in strict run...');
console.log(`Error caught: ${dateErrorCaught}`);
if (dateErrorCaught) {
  console.log(`Error message: "${dateErrorMessage}"`);
}

const expectedDateMessage = 'NEXART_STRICT: Non-deterministic API used: Date.now. Pass time as an input or use deterministic counters.';
const correctDateError = dateErrorMessage === expectedDateMessage;
console.log(`Result: ${dateErrorCaught && correctDateError ? '✅ PASS' : '❌ FAIL'} — strict mode ${dateErrorCaught ? 'blocked' : 'did not block'} Date.now`);
console.log();

console.log('TEST 6: Non-strict mode allows Math.random');
console.log('─'.repeat(50));

const nonStrictRuntime = createRuntime({ seed: 12345, strict: false });

let nonStrictResult: number | null = null;
let nonStrictError = false;

try {
  nonStrictResult = nonStrictRuntime.run(() => {
    return Math.random();
  });
} catch {
  nonStrictError = true;
}

console.log('Called Math.random() in non-strict run...');
console.log(`Error thrown: ${nonStrictError}`);
console.log(`Result value: ${nonStrictResult}`);
console.log(`Result: ${!nonStrictError && nonStrictResult !== null ? '✅ PASS' : '❌ FAIL'} — non-strict mode ${!nonStrictError ? 'allowed' : 'blocked'} Math.random`);
console.log();

const allPassed = identical && digestsMatch && digestsDiffer && strictErrorCaught && correctError && dateErrorCaught && correctDateError && !nonStrictError;
console.log('═'.repeat(50));
console.log(allPassed ? '✅ All verification tests passed!' : '❌ Some tests failed');
console.log('═'.repeat(50));

process.exit(allPassed ? 0 : 1);
