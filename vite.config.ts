import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { MinifyOptions } from 'terser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const isStaging = mode === 'staging';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    build: {
      minify: isProduction ? 'terser' : 'esbuild',
      terserOptions: isProduction
        ? ({
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          } as MinifyOptions)
        : undefined,
      target: 'esnext',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: id => {
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
              return 'redux-vendor';
            }
            if (
              id.includes('@mui/material') ||
              id.includes('@mui/icons-material')
            ) {
              return 'mui-vendor';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('recharts')) {
              return 'charts-vendor';
            }
            if (id.includes('date-fns')) {
              return 'date-vendor';
            }
            if (id.includes('axios')) {
              return 'http-vendor';
            }
            if (id.includes('yup') || id.includes('@hookform/resolvers')) {
              return 'validation-vendor';
            }
            if (id.includes('jspdf') || id.includes('papaparse')) {
              return 'export-vendor';
            }
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          chunkFileNames: chunkInfo => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId
                  .split('/')
                  .pop()
                  ?.replace('.tsx', '')
                  .replace('.ts', '')
              : 'chunk';
            return `js/${facadeModuleId}-[hash].js`;
          },
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: assetInfo => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];
            if (/\.(css)$/.test(assetInfo.name || '')) {
              return `css/[name]-[hash].${ext}`;
            }
            if (/\.(png|jpe?g|gif|svg|ico|webp)$/.test(assetInfo.name || '')) {
              return `images/[name]-[hash].${ext}`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
              return `fonts/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          },
        },
      },
      cssMinify: isProduction,
    },
    optimizeDeps: {
      include: [
        '@reduxjs/toolkit',
        'react-redux',
        '@mui/material',
        '@mui/icons-material',
        'axios',
        'yup',
        'date-fns',
      ],
      exclude: ['@vitejs/plugin-react-swc'],
    },
    server: {
      port: 3000,
      host: true,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    },
    preview: {
      port: 4173,
      host: true,
      open: true,
    },
    define: {
      __DEV__: !isProduction,
      __STAGING__: isStaging,
      __PRODUCTION__: isProduction,
    },
  };
});
