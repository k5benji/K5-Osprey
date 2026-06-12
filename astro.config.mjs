// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://osprey-k5systems.com',
  integrations: [sitemap()],
  adapter: cloudflare(),
  output: 'static',
});
