import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Precarga el subset latin de las dos tipografías propias. El nombre lleva hash, así que se toma del
// bundle en build (en dev no hace falta). crossorigin es obligatorio en los preload de fuentes, aunque
// sean del mismo origen.
function fontPreload() {
  return {
    name: 'font-preload',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return undefined;
        return Object.keys(ctx.bundle)
          .filter((name) => /(quicksand|mulish)-latin-wght-normal-.*.woff2$/.test(name))
          .map((name) => ({
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${name}`, crossorigin: '' },
            injectTo: 'head-prepend',
          }));
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), fontPreload()],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // Vendors estables en chunks propios: el navegador los cachea entre deploys (el código de la
        // app cambia en cada release, React o axios casi nunca) y se descargan en paralelo. Solo se
        // nombran las librerías del arranque; el resto (Recharts, QR, etc.) sigue partido por ruta
        // y no entra en el bundle inicial.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/node_modules[\/](react-dom|scheduler)[\/]/.test(id)) return 'vendor-react-dom';
          if (/node_modules[\/]react[\/]/.test(id)) return 'vendor-react';
          if (/node_modules[\/](react-router|react-router-dom|@remix-run)[\/]/.test(id)) return 'vendor-router';
          if (/node_modules[\/]axios[\/]/.test(id)) return 'vendor-http';
          if (/node_modules[\/]react-toastify[\/]/.test(id)) return 'vendor-toast';
          if (/node_modules[\/]react-icons[\/]/.test(id)) return 'vendor-icons';
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/test/**', 'src/main.jsx', 'src/**/*.test.{js,jsx}'],
    },
  },
});
