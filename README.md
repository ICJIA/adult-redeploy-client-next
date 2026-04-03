<!-- [![Netlify Status](https://api.netlify.com/api/v1/badges/c7e823e6-a057-4b1c-b711-2ec38f960118/deploy-status)](https://app.netlify.com/sites/adultredeploy/deploys) -->

[![Netlify Status](https://api.netlify.com/api/v1/badges/c5bb4929-d406-4cf0-a82c-e803c3eaeb34/deploy-status)](https://app.netlify.com/sites/adultredeploy-dev/deploys)

# Adult Redeploy Client

Adult Redeploy Illinois was established by the Crime Reduction Act (Public Act 96-0761) to provide financial incentives to local jurisdictions for programs that allow diversion of individuals from state prisons by providing community-based services. Grants are provided to counties, groups of counties, and judicial circuits to increase programming in their areas, in exchange for reducing the number of people they send to the Illinois Department of Corrections.

The Crime Reduction Act is based on the premise that crime can be reduced and the costs of the criminal justice system can be controlled by understanding and addressing the reasons why people commit crimes. It also acknowledges that local jurisdictions know best what resources are necessary to reduce crime in their communities. Rigorous evaluation processes with standardized performance measurements are required to confirm the effectiveness of services in reducing crime.

The Adult Redeploy Illinois program is an example of a national best practice called "performance incentive funding." Adult Redeploy Illinois is based on the successful juvenile model which has been operating since 2004 with positive results.

Results expected with Adult Redeploy Illinois include reduced prison overcrowding (based on other states' experiences, with no increase in crime); lowered cost to taxpayers ($28,000 a year for prison vs. $3,500 on average for drug treatment); an end to the expensive vicious cycle of crime and incarceration.

https://icjia.illinois.gov/adultredeploy

## Stack

- **Vue 2.6** / Vue Router 3 / Vuex 3
- **Vuetify 2** (Material Design component library)
- **GraphQL** (Strapi CMS backend at `ari.icjia-api.cloud`)
- **Netlify** (hosting, serverless functions, CI/CD)
- **Node 16** (see `.nvmrc`)

## Setup

```
npm install
```

Rename `env.sample` to `.env` and fill in missing variables.

## Development

```
npm run serve
```

## Build for production

```
npm run build
```

Deploy `/dist` folder.

## Testing

The project uses **Jest** with **@vue/test-utils** for unit and component tests.

```
npm run test:unit
```

## Accessibility

An automated axe-core audit script is included. To run it (requires Node 18+):

```bash
nvm use 22   # or any Node >= 18
cd /tmp && mkdir -p axe-audit && cd axe-audit
npm init -y && npm install puppeteer @axe-core/puppeteer
cp /path/to/project/axe-audit.mjs .
node axe-audit.mjs
```

The dev server must be running on `localhost:8080` before running the audit.

### Remediation log (2026-04-03)

Full axe-core audit across 39 pages. All WCAG 2.1 AA violations resolved:

| Rule | Severity | Pages | Elements | Status |
|------|----------|-------|----------|--------|
| `button-name` | Critical | 39 | 181 | Fixed |
| `color-contrast` | Serious | 2 | 8 | Fixed |
| `avoid-inline-spacing` | Serious | 17 | 30 | Fixed |
| `page-has-heading-one` | Moderate | 25 | 25 | Fixed |

See [CHANGELOG.md](CHANGELOG.md) for details.

## Security

Security headers are configured in `netlify.toml` (CSP, X-Frame-Options, etc.). See the security hardening section in CHANGELOG.md for the full list of mitigations applied.
