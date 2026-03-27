// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://voxquartzsystems.pl',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/_'),
      serialize: (item) => {
        if (item.url === 'https://voxquartzsystems.pl/') {
          return { ...item, priority: 1.0, changefreq: 'weekly' };
        }
        if (
          item.url.endsWith('/integracje/') ||
          item.url.endsWith('/alternatywa-dla/') ||
          item.url.endsWith('/ai-dla/') ||
          item.url.endsWith('/narzedzia/')
        ) {
          return { ...item, priority: 0.9, changefreq: 'monthly' };
        }
        return { ...item, priority: 0.8, changefreq: 'monthly' };
      },
    }),
  ],
  build: {
    format: 'directory',
  },
  vite: {
    plugins: [tailwindcss()],
    build: { assetsInlineLimit: 0 },
  },
});
