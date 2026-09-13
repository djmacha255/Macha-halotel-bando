# HaloBundle

A mobile-first Halotel data bundle storefront and seller dashboard for Tanzania. The UI is built with React and Vite, with no UI framework dependency so it stays fast and easy to customize.

## Run locally

This project requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Use **Buy bundles** for the customer flow and **Seller portal** for the order dashboard.

## Included

- Responsive dark-mode storefront with 1, 2, 3, 5, 6 and 10 GB bundles.
- Halotel number validation, HaloPesa payment instructions, transaction code capture and confirmation state.
- LocalStorage persistence so submitted orders appear in the seller dashboard during development.
- Seller dashboard with live-style metrics, order filters and one-tap completion.
- `supabase/schema.sql` with the production order table, status constraints, RLS starter policies and Realtime publication.

## Production database setup

Run `supabase/schema.sql` in the Supabase SQL editor, then replace the LocalStorage calls in `src/main.jsx` with Supabase client calls (or a server-side API / Edge Function). Keep seller dashboard reads and status updates behind authenticated Supabase policies. Configure the HaloPesa number through an environment variable rather than committing it to source.

## Build and deploy

```bash
npm run build
npm run preview
```

The generated `dist` folder can be deployed to Vercel, Netlify, Cloudflare Pages, or any static host. Set the build command to `npm run build` and the output directory to `dist`.
