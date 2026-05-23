import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://icjia.illinois.gov',
  base: '/adultredeploy',
  trailingSlash: 'never',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
