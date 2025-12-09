import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

const isVercel = process.env.VERCEL === '1';

export default defineConfig({
  output: 'server',
  adapter: isVercel ? (await import('@astrojs/vercel')).default() : undefined,
  integrations: [
    react(),
    tailwind()
  ]
});
