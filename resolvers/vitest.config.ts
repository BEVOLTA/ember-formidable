/// <reference types="vitest" />
/// <reference types="vite/client" />

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    reporters: 'verbose',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/__tests__/**/*.+(js|jsx|ts|tsx)'],
    exclude: ['**/node_modules/**', '**/__fixtures__/**', '/\\.'],
    clearMocks: true,
    restoreMocks: true,
  },
});
