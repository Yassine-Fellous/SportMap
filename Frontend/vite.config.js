import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Configuration pour Docker
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild', // Forcer esbuild au lieu de terser
    sourcemap: false,
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mapbox: ['mapbox-gl'],
          router: ['react-router-dom']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 5173
  }
})