import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

/**
 * Plugin to add modulepreload hints for critical chunks
 * This improves loading performance by preloading heavy chunks in parallel
 */
function modulePreloadPlugin(): Plugin {
  return {
    name: 'modulepreload-plugin',
    transformIndexHtml(html) {
      // Add modulepreload hints in the head section
      const preloadLinks = `
    <!-- Preload critical chunks for faster viewer loading -->
    <link rel="modulepreload" href="/src/pages/ViewerPage.tsx" />
    <link rel="prefetch" href="/src/lib/cornerstoneInit.ts" />`;
      
      return html.replace('</head>', `${preloadLinks}\n  </head>`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/mri-viewer/',
  plugins: [wasm(), topLevelAwait(), react(), modulePreloadPlugin()],
  assetsInclude: ['**/*.wasm'],
  // Required for Cornerstone3D to work with SharedArrayBuffer
  optimizeDeps: {
    include: [
      '@cornerstonejs/core',
      '@cornerstonejs/tools',
      '@cornerstonejs/dicom-image-loader',
      'dicom-parser',
    ],
  },
  worker: {
    format: 'es',
  },
  server: {
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  preview: {
    port: 4173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      exclude: ['**/*.wasm'],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-router': ['react-router-dom'],
          'cornerstone-core': ['@cornerstonejs/core'],
          'cornerstone-tools': ['@cornerstonejs/tools'],
          'cornerstone-loader': ['@cornerstonejs/dicom-image-loader', 'dicom-parser'],
          'vendor': ['react', 'react-dom', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
