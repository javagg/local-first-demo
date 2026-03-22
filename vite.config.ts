import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
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
