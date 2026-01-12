/**
 * NexArt Code Mode SDK - Oracle Hash Generator
 * 
 * Generates a deterministic SHA-256 hash from canonical sketch execution.
 * This hash serves as the release gate for Stage 3 of the NexArt protocol.
 * 
 * Usage: npx tsx scripts/generate-oracle-hash.ts
 */

import { createHash } from 'crypto';
import { runStaticMode } from '../static-engine';
import type { RenderResult } from '../types';

// Canonical test sketch - deterministic output
const ORACLE_SKETCH = `
function setup() {
  background(255);
  fill(0);
  noStroke();
  
  // Deterministic pattern using seeded random
  randomSeed(42);
  for (let i = 0; i < 100; i++) {
    const x = random(width);
    const y = random(height);
    const size = random(10, 50);
    ellipse(x, y, size, size);
  }
  
  // Protocol variables influence output
  fill(VAR[0] * 2.55, VAR[1] * 2.55, VAR[2] * 2.55);
  rect(width/4, height/4, width/2, height/2);
}
`;

// Canonical parameters
const ORACLE_SEED = 12345;
const ORACLE_VARS = [50, 75, 25, 0, 0, 0, 0, 0, 0, 0];
const ORACLE_WIDTH = 512;
const ORACLE_HEIGHT = 512;

async function generateOracleHash(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  NexArt Code Mode SDK - Oracle Hash Generator                ║');
  console.log('║  Protocol v1.2.0 (Phase 3) — HARD ENFORCEMENT                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Parameters:');
  console.log(`  Seed: ${ORACLE_SEED}`);
  console.log(`  VARs: [${ORACLE_VARS.join(', ')}]`);
  console.log(`  Size: ${ORACLE_WIDTH}x${ORACLE_HEIGHT}`);
  console.log('');

  return new Promise((resolve, reject) => {
    runStaticMode(
      {
        mode: 'static',
        width: ORACLE_WIDTH,
        height: ORACLE_HEIGHT,
      },
      {
        code: ORACLE_SKETCH,
        seed: ORACLE_SEED,
        vars: ORACLE_VARS,
        returnImageData: true, // Oracle mode: capture raw pixels
        onProgress: (progress) => {
          console.log(`  [${progress.percent}%] ${progress.message}`);
        },
        onComplete: (result: RenderResult) => {
          if (!('imageData' in result)) {
            reject(new Error('Expected imageData in oracle mode'));
            return;
          }
          
          const imageData = result.imageData;
          const pixelBuffer = Buffer.from(imageData.data.buffer);
          
          // Generate SHA-256 hash of raw pixel data
          const hash = createHash('sha256');
          hash.update(pixelBuffer);
          const oracleHash = hash.digest('hex');
          
          console.log('');
          console.log('═══════════════════════════════════════════════════════════════');
          console.log('✓ Oracle hash generated successfully');
          console.log('');
          console.log(`  Pixels: ${imageData.width * imageData.height}`);
          console.log(`  Bytes:  ${pixelBuffer.length}`);
          console.log('');
          console.log('🔐 ORACLE HASH:');
          console.log(`   ${oracleHash}`);
          console.log('');
          console.log('═══════════════════════════════════════════════════════════════');
          
          resolve();
        },
        onError: (error) => {
          reject(error);
        },
      }
    );
  });
}

generateOracleHash()
  .then(() => {
    console.log('');
    console.log('Stage 3 oracle generation complete.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Oracle generation failed:');
    console.error(`   ${error.message}`);
    process.exit(1);
  });
