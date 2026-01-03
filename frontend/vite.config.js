import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'wagmi': 'wagmi',
    },
  },
  optimizeDeps: {
    include: ['wagmi', 'viem', '@walletconnect/ethereum-provider'],
  },
  build: {
    // ✅ Optimized build settings for better performance
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
    rollupOptions: {
      output: {
        // ✅ Code splitting: separate vendor chunks
        manualChunks: {
          'vendor-wagmi': ['wagmi', 'viem', '@walletconnect/ethereum-provider'],
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@heroicons/react', 'react-toastify', 'framer-motion'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-tree': ['react-d3-tree', 'react-organizational-chart'],
        },
      },
    },
    // ✅ Optimize chunk size
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable sourcemap in production for smaller bundle
  },
});