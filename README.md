# Peter Argany Personal Website

This is the source for `peterargany.com`.

The site is a Next.js app intended to deploy on Vercel. The homepage lives at
`app/page.jsx`, and future small apps can be added as normal route folders under
`app/`.

Examples:

- `app/world-cup-bracket/page.jsx` serves `peterargany.com/world-cup-bracket`
- `app/baby-name-picker/page.jsx` would serve `peterargany.com/baby-name-picker`

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

## Domain

The target production setup is:

- `peterargany.com` as the primary Vercel domain
- `www.peterargany.com` redirecting to `peterargany.com`

DNS can stay managed at Network Solutions. The Vercel domain screen will provide
the exact A/CNAME/TXT records to set there.
