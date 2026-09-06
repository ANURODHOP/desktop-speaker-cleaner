import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
});