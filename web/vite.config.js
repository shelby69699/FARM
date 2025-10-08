import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  optimizeDeps: {
    exclude: ['lucid-cardano'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: [],
      output: {
        format: 'es',
        manualChunks: undefined
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  resolve: {
    alias: {
      'node-fetch': 'isomorphic-fetch',
      util: 'util',
      stream: 'stream-browserify',
      buffer: 'buffer'
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  esbuild: {
    target: 'esnext',
    supported: {
      'top-level-await': true
    }
  }
});

