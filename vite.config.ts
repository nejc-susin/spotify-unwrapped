import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/spotify-unwrapped/',
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 5173
  }
}) 