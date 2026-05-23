# Adult Redeploy Illinois — site

Astro + Tailwind + Alpine.js static rebuild of the ARI site. Replaces the
prior Vue 2 + Vuetify 2 build.

- Branch: `astro-rewrite` (work in progress; not yet merged to `master`)
- Design spec: `docs/superpowers/specs/2026-05-23-astro-tailwind-rewrite-design.md`
- Implementation plan: `docs/superpowers/plans/2026-05-23-astro-tailwind-rewrite.md`

## Local dev

    nvm use            # Node 22
    cp .env.sample .env
    npm install
    npm run dev        # fetches Strapi, then astro dev

## Build

    npm run build      # fetches Strapi, builds, indexes with Pagefind

Output: `dist/`

## Deployment

Netlify deploys this branch as a preview. Production stays on `master`
(current Vue build) until the cutover described in the spec.
