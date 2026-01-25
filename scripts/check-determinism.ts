/**
 * NexArt Code Mode SDK - Determinism Check
 * 
 * Validates that the current SDK produces the expected oracle hash.
 * This script is the RELEASE GATE for any SDK, renderer, or runtime change.
 * 
 * RULE: If the oracle hash changes and the protocol version does not,
 *       the release is INVALID.
 * 
 * Usage: npx tsx scripts/check-determinism.ts
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { runStaticMode } from '../static-engine';
import type { RenderResult } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = resolve(__dirname, '..');
const ORACLE_DIR = resolve(ROOT, 'oracle');

const CONFIG_PATH = resolve(ORACLE_DIR, 'oracle-config.json');
const HASH_PATH = resolve(ORACLE_DIR, 'oracle-hash.txt');

async function checkDeterminism(): Promise<boolean> {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  NexArt Code Mode SDK - Determinism Check                    ║');
  console.log('║  Protocol v1.2.0 — RELEASE GATE                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  // Load oracle configuration
  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  const expectedHash = readFileSync(HASH_PATH, 'utf-8').trim();

  console.log('Oracle Config:');
  console.log(`  Seed: ${config.seed}`);
  console.log(`  VARs: [${config.vars.join(', ')}]`);
  console.log(`  Size: ${config.width}x${config.height}`);
  console.log('');

  return new Promise((resolve) => {
    runStaticMode(
      {
        mode: 'static',
        width: config.width,
        height: config.height,
      },
      {
        code: config.source,
        seed: config.seed,
        vars: config.vars,
        returnImageData: true, // Oracle mode: capture raw pixels
        onComplete: (result: RenderResult) => {
          if (!('imageData' in result)) {
            console.error('❌ Expected imageData in oracle mode');
            resolve(false);
            return;
          }
          
          const imageData = result.imageData;
          const pixelBuffer = Buffer.from(imageData.data.buffer);
          
          const hash = createHash('sha256');
          hash.update(pixelBuffer);
          const actualHash = hash.digest('hex');
          
          console.log('Expected: ' + expectedHash);
          console.log('Actual:   ' + actualHash);
          console.log('');
          
          if (actualHash === expectedHash) {
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('✅ Determinism check passed');
            console.log('═══════════════════════════════════════════════════════════════');
            resolve(true);
          } else {
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('❌ Determinism check FAILED');
            console.log('');
            console.log('   The oracle hash has changed.');
            console.log('   This release is INVALID unless protocol version is bumped.');
            console.log('═══════════════════════════════════════════════════════════════');
            resolve(false);
          }
        },
        onError: (error) => {
          console.error('❌ Oracle execution failed:', error.message);
          resolve(false);
        },
      }
    );
  });
}

checkDeterminism()
  .then((passed) => {
    process.exit(passed ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  });
