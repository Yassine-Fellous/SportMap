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
          // Séparer les gros packages
          vendor: ['react', 'react-dom'],
          mapbox: ['mapbox-gl', 'react-map-gl'],
          ui: ['framer-motion', 'lucide-react'],
          router: ['react-router-dom']
        },
        // Optimiser les noms de fichiers
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Compression
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // Optimisations dev
  server: {
    fs: {
      strict: false
    }
  }
})