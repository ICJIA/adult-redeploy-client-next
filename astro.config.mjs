import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://icjia.illinois.gov',
  base: '/adultredeploy',
  trailingSlash: 'never',
  output: 'static',
  build: {
    // Inline the bundled CSS into each page's <head> instead of shipping a
    // ~119 KB render-blocking stylesheet (Astro's 'auto' leaves anything that
    // large external). On Lighthouse's desktop test that blocking request was
    // the top opportunity (~1.5 s) and, with the oversized CMS image above,
    // held Performance at 56. Tradeoff: the CSS repeats per page (no cross-page
    // cache) — an accepted trade for a static site tuned for first paint.
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      // Exclude the 404 page and any pagefind UI routes from the sitemap;
      // they aren't crawl targets.
      filter: (page) =>
        !/\/404\/?$/.test(page) && !/\/pagefind\//.test(page),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      // Bump the homepage's relative priority above the rest.
      serialize(item) {
        if (item.url === 'https://icjia.illinois.gov/adultredeploy') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
