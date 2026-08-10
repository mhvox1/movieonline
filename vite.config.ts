import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative paths for Electron compatibility
  base: './',
  build: {
    // Output files to the 'dist' directory
    outDir: 'dist',
    // Clean the output directory before each build
    emptyOutDir: true,
  },
});