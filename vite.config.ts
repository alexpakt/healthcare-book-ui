import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('@mantine')) return 'vendor-mantine';
            if (id.includes('@tabler')) return 'vendor-tabler';
            return 'vendor-other';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  test: {
    environment: 'jsdom',
    // Same origin as the API, so requests are not cross-origin and need no CORS preflight.
    environmentOptions: { jsdom: { url: 'http://localhost:8080' } },
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/utils/**', 'src/services/**', 'src/hooks/**', 'src/context/**'],
      exclude: ['src/test/**'],
    },
    isolate: false
  },
})
