import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
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
})
