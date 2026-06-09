// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://osprey-thread-kastle5.com',
  integrations: [sitemap()],
});
