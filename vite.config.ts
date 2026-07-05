import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Custom plugin to serve Vercel API functions locally during development
const vercelApiPlugin = () => ({
  name: 'vercel-api-plugin',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url.startsWith('/api/')) {
        try {
          if (req.method === 'POST') {
            const buffers: Buffer[] = [];
            for await (const chunk of req) buffers.push(chunk);
            const body = Buffer.concat(buffers).toString();
            if (body) {
              try { req.body = JSON.parse(body); } catch { req.body = body; }
            }
          }
          res.status = (code: number) => { res.statusCode = code; return res; };
          res.json = (data: any) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };
          res.send = (data: any) => { res.end(JSON.stringify(data)); };

          let handler;
          if (req.url === '/api/audit') {
            handler = (await server.ssrLoadModule('./api/audit.ts')).default;
          } else if (req.url === '/api/work/register') {
            handler = (await server.ssrLoadModule('./api/work/register.ts')).default;
          }
          if (handler) { await handler(req, res); return; }
        } catch (error) {
          console.error('API Error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
          return;
        }
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [
    react(),
    vercelApiPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Forest – Community Forest Management',
        short_name: 'Forest',
        description: 'A bilingual community forest management system for Malawi villages.',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#f3e9d2',
        theme_color: '#2f6b35',
        lang: 'en',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Cache Firebase, app assets and fonts for offline use
        globPatterns: ['**/*.{js,css,html,ico,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'firebase-storage', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 } },
          },
        ],
      },
    }),
  ],
  server: {
    port: 4173,
  },
});
