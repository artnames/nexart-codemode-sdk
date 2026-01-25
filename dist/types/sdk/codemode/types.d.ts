/**
 * NexArt Code Mode Runtime SDK - Types
 * See version.ts for SDK version (single source of truth)
 *
 * Type definitions for the Code Mode runtime engine.
 * This is the canonical type surface for @nexart/codemode-sdk.
 */
/**
 * Protocol Constants
 * These define the locked protocol identity.
 * Imports from version.ts (single source of truth).
 */
export declare const PROTOCOL_IDENTITY: {
    readonly protocol: "nexart";
    readonly engine: "codemode";
    readonly protocolVersion: "1.2.0";
    readonly phase: 3;
    readonly deterministic: true;
};
export type RenderMode = 'static' | 'loop';
/**
 * Runtime Canvas
 * Abstraction for browser (HTMLCanvasElement) and Node (canvas package) environments.
 * In Node, the `canvas` npm package provides an HTMLCanvasElement-compatible interface.
 */
export type RuntimeCanvas = HTMLCanvasElement;
export interface EngineConfig {
    mode: RenderMode;
    width?: number;
    height?: number;
    duration?: number;
    fps?: number;
}
/**
 * Render Result (Discriminated Union)
 *
 * Static mode can return either:
 * - blob: For display/download (PNG)
 * - imageData: For oracle hashing (raw pixels)
 *
 * Video mode returns blob with frame/duration metadata.
 */
export type RenderResult = {
    type: 'image';
    blob: Blob;
} | {
    type: 'image';
    imageData: ImageData;
} | {
    type: 'video';
    blob: Blob;
    frames?: number;
    duration?: number;
};
export interface RunOptions {
    code: string;
    seed?: number;
    vars?: number[];
    onPreview?: (canvas: RuntimeCanvas) => void;
    onProgress?: (progress: ProgressInfo) => void;
    onComplete: (result: RenderResult) => void;
    onError?: (error: Error) => void;
    returnImageData?: boolean;
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
    t: number;
    time: number;
    tGlobal: number;
    totalFrames: number;
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
export declare const DEFAULT_VARS: ProtocolVariables;
export declare const DEFAULT_CONFIG: {
    readonly width: 1950;
    readonly height: 2400;
    readonly duration: 2;
    readonly fps: 30;
    readonly minDuration: 1;
    readonly maxDuration: 4;
};
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
    totalFrames?: number;
}
/**
 * Canonical Execution Result
 * Every execution produces this structure.
 */
export interface ExecuteCodeModeResult {
    image?: Blob;
    video?: Blob;
    frames?: ImageData[];
    metadata: ProtocolMetadata;
}
/**
 * Builder Manifest (v1.6.0)
 *
 * Passive, declarative metadata for builder attribution.
 * This is data-only with no logic, rewards, or enforcement attached.
 *
 * Rules:
 * - Registration is optional
 * - Missing or invalid manifest does NOT throw
 * - No network calls, no telemetry, no analytics
 * - Does NOT affect execution behavior or determinism
 * - Used for future attribution and ecosystem discovery
 */
export interface NexArtBuilderManifest {
    protocol: 'nexart';
    manifestVersion: string;
    app?: {
        name?: string;
        url?: string;
        description?: string;
        contact?: string;
    };
    sdk?: {
        package?: string;
        version?: string;
        execution?: string;
    };
    renderer?: {
        package?: string;
        version?: string;
        mode?: 'preview' | 'canonical';
    };
    features?: Record<string, boolean>;
    declaration?: {
        usesOfficialSdk?: boolean;
        noRuntimeModification?: boolean;
        noProtocolBypass?: boolean;
    };
    timestamp?: string;
}
//# sourceMappingURL=types.d.ts.map