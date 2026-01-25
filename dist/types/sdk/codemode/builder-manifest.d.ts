/**
 * NexArt Code Mode SDK - Builder Manifest
 * Version: 1.6.0 (Protocol v1.2.0)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  BUILDER MANIFEST — PASSIVE ATTRIBUTION (WRITE-ONLY)                     ║
 * ║                                                                          ║
 * ║  The Builder Manifest is a declaration of intent, not a capability.      ║
 * ║  The SDK does not expose any API to read or inspect manifests.           ║
 * ║                                                                          ║
 * ║  This is:                                                                ║
 * ║    - Declarative (write-only, no read API exposed)                       ║
 * ║    - Optional (no errors if missing or invalid)                          ║
 * ║    - Non-enforced (no validation logic)                                  ║
 * ║    - Non-rewarding (no incentives, no tracking)                          ║
 * ║                                                                          ║
 * ║  There is:                                                               ║
 * ║    - No SDK API to read manifests                                        ║
 * ║    - No validation                                                       ║
 * ║    - No attribution logic                                                ║
 * ║    - No tracking, analytics, or network calls                            ║
 * ║                                                                          ║
 * ║  Execution behavior is identical with or without a manifest.             ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
import type { NexArtBuilderManifest } from './types';
/**
 * Register a builder manifest for attribution.
 *
 * This is optional and does not affect execution behavior.
 * The manifest is stored in-memory only and is not:
 * - Serialized to disk
 * - Sent over the network
 * - Logged to console
 * - Used for validation or enforcement
 *
 * @param manifest - Optional builder manifest. Pass undefined to clear.
 *
 * @example
 * ```typescript
 * import { registerBuilderManifest } from "@nexart/codemode-sdk";
 *
 * registerBuilderManifest({
 *   protocol: "nexart",
 *   manifestVersion: "0.1",
 *   app: { name: "My App", url: "https://myapp.com" }
 * });
 * ```
 */
export declare function registerBuilderManifest(manifest?: NexArtBuilderManifest): void;
/**
 * Get the currently registered builder manifest.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  INTERNAL FUNCTION — NOT EXPORTED TO SDK CONSUMERS                       ║
 * ║                                                                          ║
 * ║  This function exists only for internal SDK execution context.           ║
 * ║  It is NOT part of the public API and must NOT be exported from index.   ║
 * ║  Runtime code and sketch code cannot access this function.               ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * @internal
 */
export declare function getBuilderManifest(): NexArtBuilderManifest | null;
/**
 * Clear the registered builder manifest.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  INTERNAL FUNCTION — NOT EXPORTED TO SDK CONSUMERS                       ║
 * ║                                                                          ║
 * ║  This function exists only for internal SDK execution context.           ║
 * ║  It is NOT part of the public API and must NOT be exported from index.   ║
 * ║  Runtime code and sketch code cannot access this function.               ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * @internal
 */
export declare function clearBuilderManifest(): void;
//# sourceMappingURL=builder-manifest.d.ts.map