import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      'browser': 'entry/browser.ts',
      'node': 'entry/node.ts',
      'core': 'core-index.ts',
    },
    format: ['esm'],
    outDir: 'dist/esm',
    dts: false,
    splitting: false,
    sourcemap: false,
    clean: false,
    target: 'es2020',
    platform: 'neutral',
    external: ['canvas'],
    treeshake: true,
  },
  {
    entry: {
      'browser': 'entry/browser.ts',
      'node': 'entry/node.ts',
      'core': 'core-index.ts',
    },
    format: ['cjs'],
    outDir: 'dist/cjs',
    dts: false,
    splitting: false,
    sourcemap: false,
    clean: false,
    target: 'es2020',
    platform: 'node',
    external: ['canvas'],
    treeshake: true,
  },
]);
