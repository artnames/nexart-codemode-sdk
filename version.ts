/**
 * @nexart/codemode-sdk — Single Source of Truth for Version Constants
 * 
 * All version exports across the SDK MUST import from this module.
 * This prevents version drift between package.json, runtime exports, and documentation.
 * 
 * To update: Change values here and run `npm run build`.
 * See package.json for the canonical npm version.
 */

/** SDK version - must match package.json version */
export const SDK_VERSION = '1.8.4';

/** Protocol version - defines runtime semantics and determinism guarantees */
export const PROTOCOL_VERSION = '1.2.0';

/** Protocol phase - phase 3 = stable, production-ready */
export const PROTOCOL_PHASE = 3;

/** Combined version string for display */
export const VERSION_STRING = `v${SDK_VERSION} (Protocol v${PROTOCOL_VERSION})`;
