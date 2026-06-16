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
