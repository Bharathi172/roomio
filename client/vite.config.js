import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ['path', 'buffer', 'express']
  },
  build: {
    commonjsOptions: {
      ignore: ['path', 'buffer', 'express']
    }
  },
  server: {
    hmr: true, // HMR enabled
  },
  plugins: [react()],
})
