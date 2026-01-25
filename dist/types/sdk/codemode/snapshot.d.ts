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
    code?: string;
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
export declare function normalizeCode(code: string): string;
/**
 * SHA-256 hash for bytes (Node.js only, synchronous)
 */
export declare function sha256Bytes(data: Buffer | Uint8Array): string;
/**
 * SHA-256 hash for strings (Node.js only, synchronous)
 */
export declare function sha256String(data: string): string;
/**
 * Hash code after normalization
 */
export declare function hashCode(code: string): string;
/**
 * Pad or truncate VAR array to exactly 10 elements
 */
export declare function normalizeVAR(vars?: number[]): number[];
/**
 * Create a Snapshot v1 from execution parameters
 */
export declare function createSnapshotV1(options: CreateSnapshotOptions): NexArtSnapshotV1;
/**
 * Validate snapshot structure
 */
export declare function validateSnapshot(snapshot: unknown): snapshot is NexArtSnapshotV1;
export { SDK_VERSION, PROTOCOL_VERSION };
//# sourceMappingURL=snapshot.d.ts.map