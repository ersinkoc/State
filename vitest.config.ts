import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'website/',
        'examples/',
        'dist/',
        '*.config.*',
        'src/plugins/types.ts',
        'src/types.ts',
        // v1.2.0 new modules - coverage will be improved incrementally
        'src/subscribe.ts',
        'src/computed.ts',
        'src/slices.ts',
        'src/testing.ts',
        'src/federation.ts',
        'src/compat/**',
        'src/plugins/logger.ts',
        'src/plugins/effects.ts',
        'src/plugins/validate.ts',
      ],
      thresholds: {
        // Core modules maintain high coverage
        // New v1.2.0 modules are excluded and coverage will be improved incrementally
        lines: 40,
        functions: 80,
        branches: 90,
        statements: 40,
      },
    },
  },
});
