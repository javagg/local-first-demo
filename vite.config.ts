import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'import.meta.env.BUILD_MODE': JSON.stringify(
      process.env.BUILD_MODE || 'local-first'
    ),
  },
  server: {
    fs: {
      strict: false,
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  optimizeDeps: {
    exclude: ['localdemo-backend'],
  },
  worker: {
    format: 'es',
  },
});
