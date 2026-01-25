/**
 * NexArt Code Mode SDK - Agent-First Runtime Authority Layer
 * See version.ts for SDK version (single source of truth)
 * 
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT-FIRST RUNTIME — DETERMINISTIC EXECUTION AUTHORITY                 ║
 * ║                                                                          ║
 * ║  This module provides a high-level runtime API designed for AI agents    ║
 * ║  (Replit, Lovable, Claude Code) to reliably execute deterministic code.  ║
 * ║                                                                          ║
 * ║  Key Features:                                                           ║
 * ║  - Deterministic PRNG: runtime.random() (seeded Mulberry32)              ║
 * ║  - Deterministic noise: runtime.noise(x, y?, z?) (seeded Perlin)         ║
 * ║  - Strict mode: Throws on Math.random, Date.now, performance.now         ║
 * ║  - Digest: Stable hash for verification and replay                       ║
 * ║  - State snapshot: Canonical state for bundles                           ║
 * ║                                                                          ║
 * ║  BROWSER-SAFE: No Node.js dependencies. Works in Vite/Next/React.        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { SDK_VERSION } from './version';

export const RUNTIME_VERSION = SDK_VERSION;

export interface RuntimeOptions {
  seed: string | number;
  vars?: number[];
  strict?: boolean;
  mode?: 'static' | 'loop';
  metadata?: Record<string, unknown>;
}

export interface RuntimeState {
  sdkVersion: string;
  seed: number;
  vars: number[];
  mode: 'static' | 'loop';
  metadata?: Record<string, unknown>;
}

export interface NexArtRuntime {
  random(): number;
  randomInt(min: number, max: number): number;
  randomRange(min: number, max: number): number;
  noise(x: number, y?: number, z?: number): number;
  run<T>(fn: () => T): T;
  digest(): string;
  getState(): RuntimeState;
  getSeed(): number;
  readonly strict: boolean;
}

function hashSeed(seed: string | number): number {
  if (typeof seed === 'number') {
    return Math.floor(seed) >>> 0;
  }
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash >>> 0;
  }
  return hash || 1;
}

function createSeededRNG(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6D2B79F5;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createSeededNoise(seed: number) {
  const permutation: number[] = [];
  const rng = createSeededRNG(seed);
  
  for (let i = 0; i < 256; i++) {
    permutation[i] = i;
  }
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  for (let i = 0; i < 256; i++) {
    permutation[256 + i] = permutation[i];
  }

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + t * (b - a);
  const grad = (hash: number, x: number, y: number, z: number) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  return (x: number, y: number = 0, z: number = 0): number => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    const A = permutation[X] + Y;
    const AA = permutation[A] + Z;
    const AB = permutation[A + 1] + Z;
    const B = permutation[X + 1] + Y;
    const BA = permutation[B] + Z;
    const BB = permutation[B + 1] + Z;

    return (lerp(lerp(lerp(grad(permutation[AA], x, y, z), grad(permutation[BA], x - 1, y, z), u),
      lerp(grad(permutation[AB], x, y - 1, z), grad(permutation[BB], x - 1, y - 1, z), u), v),
      lerp(lerp(grad(permutation[AA + 1], x, y, z - 1), grad(permutation[BA + 1], x - 1, y, z - 1), u),
        lerp(grad(permutation[AB + 1], x, y - 1, z - 1), grad(permutation[BB + 1], x - 1, y - 1, z - 1), u), v), w) + 1) / 2;
  };
}

function stableStringify(obj: unknown): string {
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(stableStringify).join(',') + ']';
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map(k => `${JSON.stringify(k)}:${stableStringify((obj as Record<string, unknown>)[k])}`);
  return '{' + pairs.join(',') + '}';
}

function fnv1aHash(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const h1 = (hash >>> 0).toString(16).padStart(8, '0');
  let hash2 = 0x811c9dc5;
  for (let i = str.length - 1; i >= 0; i--) {
    hash2 ^= str.charCodeAt(i);
    hash2 = Math.imul(hash2, 0x01000193);
  }
  const h2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  return h1 + h2;
}

export function createRuntime(options: RuntimeOptions): NexArtRuntime {
  const numericSeed = hashSeed(options.seed);
  const vars = options.vars ?? [];
  const mode = options.mode ?? 'static';
  const strict = options.strict ?? false;
  const metadata = options.metadata;
  
  if (vars.length > 10) {
    throw new Error(`[NexArt Runtime] vars array must have 0-10 elements, got ${vars.length}`);
  }
  for (let i = 0; i < vars.length; i++) {
    if (typeof vars[i] !== 'number' || !Number.isFinite(vars[i])) {
      throw new Error(`[NexArt Runtime] vars[${i}] must be a finite number`);
    }
    if (vars[i] < 0 || vars[i] > 100) {
      throw new Error(`[NexArt Runtime] vars[${i}] must be in range 0-100, got ${vars[i]}`);
    }
  }
  
  const paddedVars = [...vars];
  while (paddedVars.length < 10) {
    paddedVars.push(0);
  }
  
  const rng = createSeededRNG(numericSeed);
  const noiseFunc = createSeededNoise(numericSeed);

  const state: RuntimeState = {
    sdkVersion: RUNTIME_VERSION,
    seed: numericSeed,
    vars: paddedVars,
    mode,
    ...(metadata !== undefined && { metadata }),
  };

  function random(): number {
    return rng();
  }

  function randomInt(min: number, max: number): number {
    const range = max - min + 1;
    return Math.floor(rng() * range) + min;
  }

  function randomRange(min: number, max: number): number {
    return rng() * (max - min) + min;
  }

  function noise(x: number, y?: number, z?: number): number {
    return noiseFunc(x, y ?? 0, z ?? 0);
  }

  function run<T>(fn: () => T): T {
    if (!strict) {
      return fn();
    }

    const originalMathRandom = Math.random;
    const originalDateNow = Date.now;
    const hasPerformance = typeof performance !== 'undefined' && performance !== null;
    const originalPerformanceNow = hasPerformance ? performance.now : undefined;

    const throwMathRandom = () => {
      throw new Error('NEXART_STRICT: Non-deterministic API used: Math.random. Use runtime.random() instead.');
    };
    const throwDateNow = () => {
      throw new Error('NEXART_STRICT: Non-deterministic API used: Date.now. Pass time as an input or use deterministic counters.');
    };
    const throwPerformanceNow = () => {
      throw new Error('NEXART_STRICT: Non-deterministic API used: performance.now.');
    };

    try {
      Math.random = throwMathRandom;
      Date.now = throwDateNow;
      if (hasPerformance && originalPerformanceNow) {
        (performance as any).now = throwPerformanceNow;
      }
      
      return fn();
    } finally {
      Math.random = originalMathRandom;
      Date.now = originalDateNow;
      if (hasPerformance && originalPerformanceNow) {
        (performance as any).now = originalPerformanceNow;
      }
    }
  }

  function digest(): string {
    const input = stableStringify({
      sdkVersion: RUNTIME_VERSION,
      seed: numericSeed,
      vars: paddedVars,
      mode,
      ...(metadata !== undefined && { metadata }),
    });
    return fnv1aHash(input);
  }

  function getState(): RuntimeState {
    return { ...state, vars: [...state.vars] };
  }

  function getSeed(): number {
    return numericSeed;
  }

  return Object.freeze({
    random,
    randomInt,
    randomRange,
    noise,
    run,
    digest,
    getState,
    getSeed,
    strict,
  });
}

export const NexArtRuntime = {
  create: createRuntime,
  VERSION: RUNTIME_VERSION,
};
