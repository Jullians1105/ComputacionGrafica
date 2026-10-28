import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// El backend (Render) solo acepta por CORS los orígenes de su lista blanca. En desarrollo,
// las llamadas a /api pasan por este proxy (servidor a servidor, sin CORS).
const apiProxy = {
  '/api': { target: 'https://lapticon-backend.onrender.com', changeOrigin: true, secure: true },
};

export default defineConfig({
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Lapticon',
        short_name: 'Lapticon',
        description: 'Tu paquete viaja con quien ya va a su destino',
        lang: 'es',
        theme_color: '#0B1240',
        background_color: '#F8F9FF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        // Nunca cachear la API: siempre debe ir a la red.
        navigateFallbackDenylist: [/^\/api/],
        // Íconos de Google Fonts en caché para que la app abra sin conexión.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
});
