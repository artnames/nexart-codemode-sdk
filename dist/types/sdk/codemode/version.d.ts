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
export declare const SDK_VERSION = "1.8.4";
/** Protocol version - defines runtime semantics and determinism guarantees */
export declare const PROTOCOL_VERSION = "1.2.0";
/** Protocol phase - phase 3 = stable, production-ready */
export declare const PROTOCOL_PHASE = 3;
/** Combined version string for display */
export declare const VERSION_STRING = "v1.8.4 (Protocol v1.2.0)";
//# sourceMappingURL=version.d.ts.map