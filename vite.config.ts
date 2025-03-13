import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svgr({
    svgrOptions: { exportType: 'named', ref: true, svgo: false, titleProp: true },
    include: '**/*.svg',
  })],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    alias: {
      '@assets': '/src/assets',
      '@components': '/src/components',
      '@contexts': '/src/contexts',
      '@data': '/src/data',
      '@logs': '/electron/logs',
      '@pages': '/src/pages',
      '@plugins': '/src/plugins',
      '@queries': '/src/queries',
      '@storage': '/electron/api/storage',
      '@theme': '/src/theme',
      '@types': '/electron/types',
      '@utils': '/src/utils',
    },
  },
  build: {
    rollupOptions: {
      /**
       * Ignore "use client" waning since we are not using SSR
       * @see {@link https://github.com/TanStack/query/pull/5161#issuecomment-1477389761 Preserve 'use client' directives TanStack/query#5161}
       */
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes(`"use client"`)) {
          return;
        }
        warn(warning);
      },
    },
  },
});
