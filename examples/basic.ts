/**
 * @nexart/codemode-sdk — Basic Example
 * 
 * Demonstrates the agent-first runtime API for deterministic execution.
 * 
 * Run: npm run example:basic
 */

import { createRuntime } from '../runtime';

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  NexArt Code Mode SDK — Basic Example                        ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log();

const runtime = createRuntime({
  seed: 'demo-seed-42',
  vars: [50, 75, 25],
  strict: true,
  mode: 'static',
  metadata: { artist: 'demo', project: 'example' }
});

console.log('Runtime State:');
console.log(JSON.stringify(runtime.getState(), null, 2));
console.log();

console.log('Digest:', runtime.digest());
console.log('Seed (numeric):', runtime.getSeed());
console.log('Strict mode:', runtime.strict);
console.log();

console.log('Deterministic random values:');
const randoms: number[] = [];
for (let i = 0; i < 5; i++) {
  const val = runtime.random();
  randoms.push(val);
  console.log(`  random() #${i + 1}: ${val.toFixed(8)}`);
}
console.log();

console.log('Deterministic noise values:');
for (let i = 0; i < 5; i++) {
  const x = i * 0.5;
  const val = runtime.noise(x, 0.5);
  console.log(`  noise(${x}, 0.5): ${val.toFixed(8)}`);
}
console.log();

console.log('Running code in strict mode...');
const result = runtime.run(() => {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += runtime.random();
  }
  return sum;
});
console.log(`  Sum of 10 random values: ${result.toFixed(8)}`);
console.log();

console.log('✅ Basic example completed successfully!');
