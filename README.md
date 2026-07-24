# Aussie Citizenship Prep

A flashcards + practice test app to prepare for the Australian citizenship test, based on the
official resource book *Australian Citizenship: Our Common Bond*.

- **Flashcards** — flip through key facts by topic (Australia & its people, democratic beliefs
  & rights, government & law, Australian values), mark cards as known/still learning, filter and
  shuffle. Progress is saved in the browser (`localStorage`).
- **Practice Test** — 20 randomly selected questions, including exactly 5 Australian values
  questions, scored against the real test's pass rule (75%+ overall **and** all 5 values questions
  correct). Some questions include images (flags, Coat of Arms, national flower/gemstone).
- **Installable PWA** — has a web manifest, icons, and a service worker for offline use after the
  first visit, so it can be added to a phone's home screen like a native app.

The whole app is a static, client-side site (no backend/database), so it fits comfortably on
Vercel's free tier.

## Content

Questions and flashcards live in `src/content/` (`part1.ts`, `part2.ts`, `part3.ts`, `values.ts`),
typed via `src/content/types.ts`. Images referenced by questions/flashcards live in `public/images/`
and `public/icons/`.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> Note: the service worker (`public/sw.js`) only registers in production builds — it's
> intentionally skipped in `next dev` because it would otherwise intercept and break Next's
> hot-reload requests.

## Build

```bash
npm run build
```

This produces a fully static export in `out/` (see `output: "export"` in `next.config.ts`).
You can preview the production build locally with any static file server, e.g.:

```bash
npx serve out
```

## Deploy to Vercel (free tier)

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel auto-detects the Next.js framework and the static export — no extra configuration
   needed. Click **Deploy**.
4. Once deployed, open the site on your phone and use the browser's "Add to Home Screen" /
   "Install app" option to install it as a PWA.

Alternatively, from the CLI:

```bash
npm i -g vercel
vercel
```
