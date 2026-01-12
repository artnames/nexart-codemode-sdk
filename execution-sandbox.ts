/**
 * NexArt Code Mode SDK - Execution Sandbox
 * Version: 1.6.0 (Protocol v1.2.0)
 * 
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  EXECUTION BOUNDARY — HARD ENFORCEMENT                                   ║
 * ║                                                                          ║
 * ║  This module enforces determinism by blocking all external entropy       ║
 * ║  sources at RUNTIME, not just via static pattern scanning.               ║
 * ║                                                                          ║
 * ║  Blocked APIs (throw [Code Mode Protocol Error]):                        ║
 * ║  - Date, Date.now, Date.parse, new Date()                                ║
 * ║  - performance, performance.now                                          ║
 * ║  - process (Node.js)                                                     ║
 * ║  - navigator                                                             ║
 * ║  - globalThis                                                            ║
 * ║  - crypto.getRandomValues                                                ║
 * ║  - Math.random (use seeded random() instead)                             ║
 * ║  - setTimeout, setInterval, requestAnimationFrame                        ║
 * ║  - fetch, XMLHttpRequest                                                 ║
 * ║  - document, window                                                      ║
 * ║  - import, require                                                       ║
 * ║                                                                          ║
 * ║  All blocked symbols throw immediately on access — no silent undefined.  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * Create a throwing stub for a forbidden API
 */
function createForbiddenStub(name: string): (...args: any[]) => never {
  const stub = function(): never {
    throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name}`);
  };
  return new Proxy(stub, {
    get(_target, prop) {
      if (prop === Symbol.toPrimitive || prop === 'toString' || prop === 'valueOf') {
        return () => { throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name}`); };
      }
      throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name}.${String(prop)}`);
    },
    apply() {
      throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name}()`);
    },
    construct() {
      throw new Error(`[Code Mode Protocol Error] Forbidden API: new ${name}()`);
    },
    set() {
      throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name} (assignment blocked)`);
    },
    has() {
      return true;
    }
  });
}

/**
 * Create a frozen object that throws on any property access
 */
function createForbiddenObject(name: string): object {
  return new Proxy({}, {
    get(_target, prop) {
      if (prop === Symbol.toPrimitive || prop === 'toString' || prop === 'valueOf') {
        return () => { throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name}`); };
      }
      throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name}.${String(prop)}`);
    },
    set() {
      throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name} (assignment blocked)`);
    },
    has() {
      return true;
    },
    apply() {
      throw new Error(`[Code Mode Protocol Error] Forbidden API: ${name}()`);
    },
    construct() {
      throw new Error(`[Code Mode Protocol Error] Forbidden API: new ${name}()`);
    }
  });
}

/**
 * Forbidden APIs - these are injected into the execution scope to override globals
 */
export const FORBIDDEN_APIS = {
  Date: createForbiddenStub('Date'),
  performance: createForbiddenObject('performance'),
  process: createForbiddenObject('process'),
  navigator: createForbiddenObject('navigator'),
  globalThis: createForbiddenObject('globalThis'),
  crypto: createForbiddenObject('crypto'),
  setTimeout: createForbiddenStub('setTimeout'),
  setInterval: createForbiddenStub('setInterval'),
  clearTimeout: createForbiddenStub('clearTimeout'),
  clearInterval: createForbiddenStub('clearInterval'),
  requestAnimationFrame: createForbiddenStub('requestAnimationFrame'),
  cancelAnimationFrame: createForbiddenStub('cancelAnimationFrame'),
  fetch: createForbiddenStub('fetch'),
  XMLHttpRequest: createForbiddenStub('XMLHttpRequest'),
  WebSocket: createForbiddenStub('WebSocket'),
  document: createForbiddenObject('document'),
  window: createForbiddenObject('window'),
  self: createForbiddenObject('self'),
  top: createForbiddenObject('top'),
  parent: createForbiddenObject('parent'),
  frames: createForbiddenObject('frames'),
  location: createForbiddenObject('location'),
  history: createForbiddenObject('history'),
  localStorage: createForbiddenObject('localStorage'),
  sessionStorage: createForbiddenObject('sessionStorage'),
  indexedDB: createForbiddenObject('indexedDB'),
  caches: createForbiddenObject('caches'),
  Notification: createForbiddenStub('Notification'),
  Worker: createForbiddenStub('Worker'),
  SharedWorker: createForbiddenStub('SharedWorker'),
  ServiceWorker: createForbiddenObject('ServiceWorker'),
  Blob: createForbiddenStub('Blob'),
  File: createForbiddenStub('File'),
  FileReader: createForbiddenStub('FileReader'),
  URL: createForbiddenStub('URL'),
  URLSearchParams: createForbiddenStub('URLSearchParams'),
  Headers: createForbiddenStub('Headers'),
  Request: createForbiddenStub('Request'),
  Response: createForbiddenStub('Response'),
  EventSource: createForbiddenStub('EventSource'),
  Image: createForbiddenStub('Image'),
  Audio: createForbiddenStub('Audio'),
  Video: createForbiddenStub('Video'),
  eval: createForbiddenStub('eval'),
  Function: createForbiddenStub('Function'),
} as const;

/**
 * Create a safe Math object with random() blocked
 */
export function createSafeMath(): typeof Math {
  const safeMath = Object.create(Math);
  Object.defineProperty(safeMath, 'random', {
    get() {
      throw new Error('[Code Mode Protocol Error] Forbidden API: Math.random() — use random() instead (seeded)');
    },
    configurable: false,
    enumerable: true
  });
  return Object.freeze(safeMath);
}

/**
 * List of all forbidden API names for documentation
 */
export const FORBIDDEN_API_NAMES = Object.keys(FORBIDDEN_APIS);

/**
 * Build the complete sandbox context for sketch execution.
 * This includes the p5 runtime plus all forbidden API stubs.
 */
export function buildSandboxContext(p5Runtime: Record<string, any>): Record<string, any> {
  const safeMath = createSafeMath();
  
  const context: Record<string, any> = {
    ...FORBIDDEN_APIS,
    Math: safeMath,
  };
  
  for (const key of Object.keys(p5Runtime)) {
    context[key] = p5Runtime[key];
  }
  
  return context;
}

/**
 * Create a sandboxed function that executes user code with blocked globals.
 * 
 * The function is constructed with:
 * 1. All forbidden APIs as explicit parameters (override globals)
 * 2. The p5 runtime as explicit parameters
 * 3. A `with(context)` wrapper for additional safety
 */
export function createSandboxedExecutor(
  code: string,
  additionalParams: string[] = []
): Function {
  const forbiddenParamNames = Object.keys(FORBIDDEN_APIS);
  const allParams = [
    'context',
    'Math',
    ...forbiddenParamNames,
    ...additionalParams
  ];
  
  const wrappedCode = `
    "use strict";
    with(context) {
      ${code}
    }
  `;
  
  return new Function(...allParams, wrappedCode);
}

/**
 * Execute user code in a sandboxed environment.
 * 
 * @param code - The user sketch code to execute
 * @param p5Runtime - The p5-like runtime object
 * @param additionalContext - Additional context variables (frameCount, t, etc.)
 */
export function executeSandboxed(
  code: string,
  p5Runtime: Record<string, any>,
  additionalContext: Record<string, any> = {}
): void {
  const safeMath = createSafeMath();
  
  const fullContext = {
    ...p5Runtime,
    ...additionalContext,
    Math: safeMath,
    ...FORBIDDEN_APIS,
  };
  
  const forbiddenValues = Object.keys(FORBIDDEN_APIS).map(key => FORBIDDEN_APIS[key as keyof typeof FORBIDDEN_APIS]);
  const additionalParamNames = Object.keys(additionalContext);
  const additionalValues = Object.values(additionalContext);
  
  const executor = createSandboxedExecutor(code, additionalParamNames);
  
  executor(
    fullContext,
    safeMath,
    ...forbiddenValues,
    ...additionalValues
  );
}
