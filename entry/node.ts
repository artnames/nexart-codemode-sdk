/**
 * @nexart/codemode-sdk/node — Node.js Entry Point
 * See ../version.ts for SDK version (single source of truth)
 * 
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  NODE.JS SDK ENTRY POINT                                                 ║
 * ║                                                                          ║
 * ║  This entrypoint exports Node.js-specific modules that require:          ║
 * ║  - canvas package (node-canvas)                                          ║
 * ║  - Node.js built-ins (module, fs, path)                                  ║
 * ║                                                                          ║
 * ║  Use this for server-side rendering, oracles, or CLI tools.              ║
 * ║                                                                          ║
 * ║  For browser/Vite: import from '@nexart/codemode-sdk/browser'            ║
 * ║                                                                          ║
 * ║  AI AGENTS: Start with createRuntime({ seed, strict: true })             ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORT ALL BROWSER-SAFE MODULES
// ═══════════════════════════════════════════════════════════════════════════
export * from './browser';

// ═══════════════════════════════════════════════════════════════════════════
// STATIC ENGINE — Node.js only (requires canvas package)
// ═══════════════════════════════════════════════════════════════════════════
export {
  runStaticMode,
} from '../static-engine';

// ═══════════════════════════════════════════════════════════════════════════
// CANONICAL EXECUTION — Node.js only (imports static-engine)
// ═══════════════════════════════════════════════════════════════════════════
export {
  executeCodeMode,
} from '../execute';

// ═══════════════════════════════════════════════════════════════════════════
// SDK IDENTITY (override browser entry)
// ═══════════════════════════════════════════════════════════════════════════
export { SDK_VERSION, SDK_NAME } from './browser';
export const SDK_ENTRY = 'node';
