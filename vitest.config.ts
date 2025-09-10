import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    threads: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/coverage/**',
      '**/playwright-report/**',
    ],
    deps: {
      optimizer: {
        exclude: ['@mui/icons-material', '@mui/material'],
      },
    },
    transformMode: {
      web: [/node_modules/],
    },
  },
});
