import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // In dev: serve at /
  // In build (GitHub Pages): serve at /My-Personal-Portfolio/
  base: command === 'build' ? '/My-Personal-Portfolio/' : '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
}))
