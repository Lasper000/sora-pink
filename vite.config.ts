import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('qrcode') || id.includes('canvas-confetti')) return 'vendor-utils';
            return 'vendor-react';
          }
          if (id.includes('src/lib/mockData')) return 'data-catalog';
        },
      },
    },
  },
})
