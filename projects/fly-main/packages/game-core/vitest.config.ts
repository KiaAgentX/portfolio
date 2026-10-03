import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    // Workspace deps ship TS source directly; let Vite transform them.
    dedupe: [],
  },
  esbuild: {
    target: 'es2022',
  },
});
