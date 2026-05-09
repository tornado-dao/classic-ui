# classic-ui E2E tests (Playwright)

Smoke tests that verify the app loads and key elements render without console
errors. These run against the locally running Nuxt dev server.

## Node version

Playwright requires Node 18+, while the app itself wants Node 16. The
`.nvmrc` here pins this folder to Node 22, so `nvm use` will pick up the
right version when you `cd` in.

## One-time setup

```bash
cd testing/e2e-playwright
nvm use
yarn install
yarn install-browsers
```

## Run

The Playwright config auto-starts `yarn dev` from the repo root if no server is
already running on `http://localhost:3000`. First run will be slow because the
Nuxt build is heavy — the config allows up to 5 minutes.

```bash
yarn test           # headless
yarn test:headed    # see the browser
yarn test:ui        # interactive Playwright UI
```

If you already have `yarn dev` running, the tests reuse it.

To skip the auto-start entirely (useful when running against a built `yarn start`
or another deployment):

```bash
E2E_NO_WEBSERVER=1 E2E_BASE_URL=http://localhost:3000 yarn test
```

## What's covered

- **Deposit tab**: page loads, "Anonymity set" displays a number (not skeleton),
  "Latest deposits" list has entries.
- **Withdraw tab**: switches without console errors.

Both tests fail if any `console.error` or uncaught page error fires during their
window. This is intentionally strict — if the app starts surfacing new errors,
the tests will catch it.
