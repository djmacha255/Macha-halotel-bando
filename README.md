# MACHA 255 DATA HUB

MACHA 255 DATA HUB ni mfumo wa kisasa wa kuuza vifurushi vya intaneti vya Halotel na dashboard ya muuzaji kwa Tanzania. UI imejengwa kwa React na Vite ili iwe nyepesi, ya haraka na rahisi kubadilisha.

## Run locally

This project requires Node.js 18+ (Node.js 20 LTS is recommended).

```bash
npm install
npm run host
```

Open `http://localhost:5173`. Use **Buy bundles** for the customer flow and **Seller portal** for the order dashboard.

To open the app from another phone or computer on the same Wi-Fi network:

```bash
npm run host
```

Open `http://YOUR-COMPUTER-IP:5173` on the other device. Windows Firewall may ask you to allow Node.js on private networks.

## Included

- Responsive dark-mode storefront with 1, 2, 3, 5, 6 and 10 GB bundles.
- Halotel number validation, HaloPesa payment instructions, transaction code capture and confirmation state.
- Safe LocalStorage persistence so submitted orders appear in the seller dashboard during development, including a fallback for non-secure local preview contexts.
- Seller dashboard with live-style metrics, order filters and one-tap completion.
- Customer history/status page with search by Halotel number or order ID and feedback submission.
- Admin order detail view showing customer name, full recipient number, payment code and feedback.
- Customer accounts with referral codes, reward points and account history in preview mode.
- Admin Direct Control settings for payment details, announcement copy and custom-bundle limits.
- Custom-size bundles with automatic pricing from 1 GB through the configured maximum.
- Local admin login protecting the seller dashboard during preview (`admin` / `Macha255!` by default).
- `supabase/schema.sql` with the production order table, status constraints, RLS starter policies and Realtime publication.

## Production database setup

Run `supabase/schema.sql` in the Supabase SQL editor, then replace the LocalStorage calls in `src/main.jsx` with Supabase client calls (or a server-side API / Edge Function). Keep seller dashboard reads and status updates behind authenticated Supabase policies. The local setup uses `VITE_HALOPESA_NUMBER=0612801118` and `VITE_HALOPESA_NAME=AMANI MACHA`.

The preview stores customer history, status and feedback in LocalStorage. This is real data from the browser checkout, but it is device-local. For shared customer/admin data across phones and computers, use the included Supabase schema and connect the order writes/reads to Supabase.

Customer accounts currently use LocalStorage for the preview, with 10 points per order and 100 points when a new customer registers with a valid referral code. For production, use Supabase Auth rather than storing passwords in browser storage, and keep points/referral updates in a server-side function.

Admin settings currently persist in LocalStorage for the preview. The `business_settings` table in `supabase/schema.sql` is ready for production synchronization.

The site never asks for or stores a HaloPesa PIN. A customer must enter their PIN only inside the official HaloPesa App or USSD flow, then return here with the transaction code. An automatic payment prompt requires an official HaloPesa merchant/API integration; do not emulate that flow in the browser.

## Seller dashboard access

Open the site, choose **Eneo la muuzaji**, and sign in with the credentials in `.env.local`. The current local preview defaults are:

```text
Username: admin
Password: Macha255!
```

Change `VITE_ADMIN_PASSWORD` before sharing a hosted preview. This browser-only login is suitable for local preview only; production access should use Supabase Auth or a server-side session.

## Build and deploy

```bash
npm run build
npm run preview
```

The generated `dist` folder can be deployed to Vercel, Netlify, Cloudflare Pages, or any static host. Set the build command to `npm run build` and the output directory to `dist`.

For a production-like local preview after building:

```bash
npm run host:preview
```

Open `http://localhost:4173`.
