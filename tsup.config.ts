import { defineConfig } from 'tsup';

export default defineConfig([
  // Main bundle (ESM + CJS)
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: false,
    external: ['react'],
  },
  // IIFE bundle for CDN
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'OxogState',
    outDir: 'dist/iife',
    minify: true,
    external: ['react'],
  },
]);
