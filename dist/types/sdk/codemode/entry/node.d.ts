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
export * from './browser';
export { runStaticMode, } from '../static-engine';
export { executeCodeMode, } from '../execute';
export { SDK_VERSION, SDK_NAME } from './browser';
export declare const SDK_ENTRY = "node";
//# sourceMappingURL=node.d.ts.map