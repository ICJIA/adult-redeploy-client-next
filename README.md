# Adult Redeploy Illinois — site

Astro 5 + Tailwind 4 + Alpine.js static build. Production:
<https://icjia.illinois.gov/adultredeploy>.

## Local dev

    nvm use            # Node 22
    cp .env.sample .env
    npm install
    npm run dev        # fetches Strapi, then astro dev (port 4321)

## Build

    npm run build      # fetches Strapi, builds, indexes with Pagefind

Output: `dist/`.

## Deployment

Netlify deploys `master` to the `adultredeploy` site (mounted under
`/adultredeploy` via `base` in `astro.config.mjs`).
