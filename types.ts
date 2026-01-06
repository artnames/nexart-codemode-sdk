/**
 * NexArt Code Mode Runtime SDK - Types
 * Version: 1.5.0 (Protocol v1.2.0)
 * 
 * Type definitions for the Code Mode runtime engine.
 * This is the canonical type surface for @nexart/codemode-sdk.
 */

/**
 * Protocol Constants
 * These define the locked protocol identity.
 */
export const PROTOCOL_IDENTITY = {
  protocol: 'nexart' as const,
  engine: 'codemode' as const,
  protocolVersion: '1.2.0' as const,
  phase: 3 as const,
  deterministic: true as const,
} as const;

export type RenderMode = 'static' | 'loop';

export interface EngineConfig {
  mode: RenderMode;
  width?: number;
  height?: number;
  duration?: number; // Loop mode only (seconds)
  fps?: number; // Loop mode only (default: 30)
}

export interface RenderResult {
  type: 'image' | 'video';
  blob: Blob;
  frames?: number; // Loop mode only
  duration?: number; // Loop mode only (seconds)
}

export interface RunOptions {
  code: string;
  seed?: number; // Seed for deterministic randomness
  vars?: number[]; // Protocol variables VAR[0..9], values 0-100
  onPreview?: (canvas: HTMLCanvasElement) => void;
  onProgress?: (progress: ProgressInfo) => void;
  onComplete: (result: RenderResult) => void;
  onError?: (error: Error) => void;
}

export interface ProgressInfo {
  phase: 'setup' | 'rendering' | 'encoding' | 'complete';
  frame?: number;
  totalFrames?: number;
  percent: number;
  message: string;
}

export interface Engine {
  run: (options: RunOptions) => Promise<void>;
  stop: () => void;
  getConfig: () => Readonly<EngineConfig>;
}

export interface TimeVariables {
  frameCount: number;
  t: number; // Normalized time [0, 1)
  time: number; // Elapsed seconds
  tGlobal: number; // Alias for t
  totalFrames: number; // Total frames in animation (v1.4.0)
}

/**
 * Protocol Variables (VAR[0..9])
 * First-class protocol inputs for deterministic rendering.
 * Used by SoundArt, Shapes, Noise, and ByX collections.
 * 
 * Rules (SDK v1.0.2, Protocol v1.0.0):
 * - Input array can have 0-10 elements (protocol error if > 10)
 * - All values MUST be finite numbers (protocol error if not)
 * - Values MUST be in range 0-100 (protocol error if out of range, NO clamping)
 * - Runtime VAR is ALWAYS 10 elements (padded with zeros for consistency)
 * - Read-only inside sketches (write attempts throw protocol error)
 * - Default: all zeros if not provided
 */
export interface ProtocolVariables {
  VAR: readonly [number, number, number, number, number, number, number, number, number, number];
}

/**
 * Default protocol variables (all zeros)
 */
export const DEFAULT_VARS: ProtocolVariables = {
  VAR: Object.freeze([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) as readonly [number, number, number, number, number, number, number, number, number, number]
};

export const DEFAULT_CONFIG = {
  width: 1950,
  height: 2400,
  duration: 2,
  fps: 30,
  minDuration: 1,
  maxDuration: 4,
} as const;

/**
 * Protocol Metadata
 * Attached to every execution result for verification.
 */
export interface ProtocolMetadata {
  protocol: 'nexart';
  engine: 'codemode';
  protocolVersion: '1.2.0';
  phase: 3;
  deterministic: true;
  seed: number;
  vars: number[];
  width: number;
  height: number;
  mode: RenderMode;
  totalFrames?: number;
}

/**
 * Canonical Execution Input
 * The single entry point for all Code Mode execution.
 */
export interface ExecuteCodeModeInput {
  source: string;
  width: number;
  height: number;
  seed: number;
  vars?: number[];
  mode: RenderMode;
  totalFrames?: number; // Required for loop mode
}

/**
 * Canonical Execution Result
 * Every execution produces this structure.
 */
export interface ExecuteCodeModeResult {
  image?: Blob;          // Static mode: PNG
  video?: Blob;          // Loop mode: MP4
  frames?: ImageData[];  // Optional: raw frame data
  metadata: ProtocolMetadata;
}
