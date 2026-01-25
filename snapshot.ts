/**
 * NexArt CodeMode SDK - Snapshot Support
 * See version.ts for SDK version (single source of truth)
 * 
 * Provides snapshot utilities for deterministic execution and verification.
 */

import { SDK_VERSION, PROTOCOL_VERSION } from './version';

/**
 * Snapshot v1 format
 */
export interface NexArtSnapshotV1 {
  protocol: 'nexart';
  protocolVersion: string;
  runtime: 'canonical';
  runtimeHash: string;
  codeHash: string;
  seed: number;
  VAR: number[];
  canvas: {
    width: number;
    height: number;
  };
  outputHash: string;
  createdAt: string;
  code?: string; // Optional: embedded code for replay without original file
}

/**
 * Options for snapshot creation
 */
export interface CreateSnapshotOptions {
  code: string;
  seed: number;
  VAR: number[];
  width: number;
  height: number;
  outputHash: string;
  runtimeHash?: string;
  includeCode?: boolean;
}

/**
 * Normalize code for consistent hashing
 * - CRLF to LF
 * - Trim trailing whitespace per line
 * - Ensure single trailing newline
 */
export function normalizeCode(code: string): string {
  return code
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .replace(/\n+$/, '') + '\n';
}

/**
 * SHA-256 hash for bytes (Node.js only, synchronous)
 */
export function sha256Bytes(data: Buffer | Uint8Array): string {
  // Dynamic import to avoid issues in browser builds
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * SHA-256 hash for strings (Node.js only, synchronous)
 */
export function sha256String(data: string): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data, 'utf-8').digest('hex');
}

/**
 * Hash code after normalization
 */
export function hashCode(code: string): string {
  return sha256String(normalizeCode(code));
}

/**
 * Pad or truncate VAR array to exactly 10 elements
 */
export function normalizeVAR(vars?: number[]): number[] {
  const result = new Array(10).fill(0);
  if (vars) {
    for (let i = 0; i < Math.min(vars.length, 10); i++) {
      result[i] = Math.max(0, Math.min(100, vars[i] ?? 0));
    }
  }
  return result;
}

/**
 * Create a Snapshot v1 from execution parameters
 */
export function createSnapshotV1(options: CreateSnapshotOptions): NexArtSnapshotV1 {
  const snapshot: NexArtSnapshotV1 = {
    protocol: 'nexart',
    protocolVersion: PROTOCOL_VERSION,
    runtime: 'canonical',
    runtimeHash: options.runtimeHash ?? sha256String(SDK_VERSION),
    codeHash: hashCode(options.code),
    seed: options.seed,
    VAR: normalizeVAR(options.VAR),
    canvas: { width: options.width, height: options.height },
    outputHash: options.outputHash,
    createdAt: new Date().toISOString(),
  };
  
  if (options.includeCode) {
    snapshot.code = options.code;
  }
  
  return snapshot;
}

/**
 * Validate snapshot structure
 */
export function validateSnapshot(snapshot: unknown): snapshot is NexArtSnapshotV1 {
  if (!snapshot || typeof snapshot !== 'object') return false;
  const s = snapshot as Record<string, unknown>;
  return (
    s.protocol === 'nexart' &&
    typeof s.protocolVersion === 'string' &&
    s.runtime === 'canonical' &&
    typeof s.runtimeHash === 'string' &&
    typeof s.codeHash === 'string' &&
    typeof s.seed === 'number' &&
    Array.isArray(s.VAR) &&
    s.VAR.length === 10 &&
    typeof s.canvas === 'object' &&
    s.canvas !== null &&
    typeof (s.canvas as Record<string, unknown>).width === 'number' &&
    typeof (s.canvas as Record<string, unknown>).height === 'number' &&
    typeof s.outputHash === 'string' &&
    typeof s.createdAt === 'string'
  );
}

// Re-export version constants for convenience
export { SDK_VERSION, PROTOCOL_VERSION };
