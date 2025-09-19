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

// scripts:
// "dev": "vite",
// "build": "vite build",
// "preview": "vite preview",
// "docker:build": "docker build -t sportmap-frontend .",
// "docker:run": "docker run -p 8080:80 sportmap-frontend",
// "docker:dev": "docker build -t sportmap-frontend . && docker run -p 8080:80 sportmap-frontend"
