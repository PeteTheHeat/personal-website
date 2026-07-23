# Peter Argany Personal Website

This is the source for my personal website.

The site is a Next.js app intended to deploy on Vercel. The homepage lives at
`app/page.jsx`, and future small apps can be added as normal route folders under
`app/`.

Examples:

- `app/world-cup-bracket/page.jsx` serves `/world-cup-bracket`
- `app/baby-name-picker/page.jsx` would serve `/baby-name-picker`

## Local development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Production check

```bash
npm run build
```

Vercel should use the default Next.js settings:

- Framework preset: Next.js
- Build command: `next build`
- Install command: `npm install`
- Output directory: handled by Vercel

## Project apps

Standalone project apps live in their own source folders and are published as
static build snapshots through this repo.

Current project routes:

- `/when-was-it`
- `/gender-reveal`
- `/character-select`

To refresh the deployed snapshots:

```bash
npm run sync:projects
npm run build
git add .
git commit -m "Sync project apps"
git push origin main
npx --yes vercel deploy --prod --yes
```

`npm run sync:projects` builds each app with `--base=/projects/<slug>/` and
copies its `dist` folder into `public/projects/<slug>`. Source project paths are
configured in `scripts/sync-projects.mjs`. The route pages in
`app/<slug>/page.jsx` load those builds with `app/project-frame.jsx`. The shared
frame is intentionally chrome-free; do not add a floating Home button on top of
embedded project apps.

To add another project:

1. Add it to the homepage `projects` array in `app/page.jsx`.
2. Add its local source path to `scripts/sync-projects.mjs`.
3. Add a route page under `app/<slug>/page.jsx` using `ProjectFrame`.
4. Run `npm run sync:projects` and `npm run build`.

## When Was It?

The historical date game lives at `/when-was-it`. It draws five moments from a
50-event collection and keeps the three lowest total errors on a shared
leaderboard.

Production uses the same Upstash Redis REST connection as Sacko Tracker, with a
separate environment-scoped key. `WHEN_WAS_IT_REDIS_KEY` can override that key
when needed. Local development falls back to
`.data/when-was-it-leaderboard.json`.

## Sacko Tracker

The public tracker is available at `/sacko-tracker`. Score changes are made at
`/sacko-tracker-admin`; the admin route is intentionally omitted from the site
navigation and marked `noindex`. The admin form can also store a verified
before- or after-deadline result when the exact completion timestamp was not
captured.

For local development, tracker state is persisted in the ignored `.data/`
directory. Production uses an Upstash Redis REST database so data survives
Vercel function restarts. Configure the variables shown in `.env.example`:

- `SACKO_ADMIN_PASSWORD`: a unique password of at least 12 characters used to
  enter the admin page
- `SACKO_SESSION_SECRET`: a separate, random secret of at least 32 characters used
  to sign the secure admin session cookie
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: injected when an
  Upstash Redis resource is connected through the Vercel Marketplace

Legacy `KV_REST_API_URL` and `KV_REST_API_TOKEN` variable names are also
accepted. Tracker keys are isolated by Vercel environment by default so preview
updates cannot overwrite production state; `SACKO_REDIS_KEY` can override the
key when needed. Production deliberately fails closed when credentials or
durable storage are not configured.

To create and connect the intended free, non-auto-upgrading Redis resource:

```bash
npx vercel integration add upstash/upstash-kv \
  --name sacko-tracker \
  --environment production \
  --environment preview \
  --environment development \
  --metadata primaryRegion=sfo1 \
  --metadata eviction=false \
  --metadata prodPack=false \
  --metadata autoUpgrade=false
```

The Vercel account owner must accept the provider marketplace terms before the
CLI can finish provisioning. Add the two admin secrets with `vercel env add` or
in Project Settings, redeploy, then smoke-test both tracker routes.
