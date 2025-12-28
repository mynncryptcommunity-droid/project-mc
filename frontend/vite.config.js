import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Pastikan Vite dapat menemukan wagmi
      'wagmi': 'wagmi',
    },
  },
  optimizeDeps: {
    include: ['wagmi', 'viem', '@walletconnect/ethereum-provider'],
  },
});