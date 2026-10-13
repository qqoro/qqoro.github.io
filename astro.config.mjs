// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://qqoro.github.io',
  trailingSlash: 'never',
  build: { format: 'file' },
});
