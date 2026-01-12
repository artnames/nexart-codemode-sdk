/**
 * NexArt Code Mode Runtime SDK - Types
 * Version: 1.6.0 (Protocol v1.2.0)
 *
 * Type definitions for the Code Mode runtime engine.
 * This is the canonical type surface for @nexart/codemode-sdk.
 */
/**
 * Protocol Constants
 * These define the locked protocol identity.
 */
export const PROTOCOL_IDENTITY = {
    protocol: 'nexart',
    engine: 'codemode',
    protocolVersion: '1.2.0',
    phase: 3,
    deterministic: true,
};
/**
 * Default protocol variables (all zeros)
 */
export const DEFAULT_VARS = {
    VAR: Object.freeze([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
};
export const DEFAULT_CONFIG = {
    width: 1950,
    height: 2400,
    duration: 2,
    fps: 30,
    minDuration: 1,
    maxDuration: 4,
};
