# Agent Outsource

Marketing site for **AgentOutsource.com**. Full-time offshore talent, fully managed.

Static site (plain HTML/CSS/JS, no build step). Neobrutalist design, built to be pushed to GitHub and edited in Cursor + Claude.

## Structure

```
agent-outsource/
├── index.html              # Homepage
├── css/
│   └── styles.css          # Full design system + all page styles
├── js/
│   └── main.js             # Mobile nav, FAQ, form handling
├── assets/                 # Logos + favicon
│   ├── logo-purple.png
│   ├── logo-black.png
│   ├── logo-square.png
│   └── favicon.png
├── pages/
│   ├── how-it-works.html
│   ├── roles.html
│   ├── about.html
│   └── contact.html        # Form + calendar embed
└── README.md
```

## Run locally

No build needed. Either open `index.html` directly, or serve it:

```bash
# Python
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Design tokens

All colors, type, borders, and shadows live as CSS variables at the top of `css/styles.css` under `:root`. Change the brand look in one place.

- `--purple` `#5B2A86` — brand (from logo)
- `--acid` `#D4F53D` — primary accent / CTA
- `--coral` `#FF5C39` — secondary accent
- `--ink` `#0A0A0A` / `--paper` `#F5F2EC` — neobrutalist base
- Display font: **Archivo** · Body font: **Space Grotesk** (loaded from Google Fonts)

## Contact form: notifications + database + admin view

The contact form (`pages/contact.html`) submits via JS (`js/main.js`) to `/api/submit-form`,
a Vercel serverless function (`api/submit-form.js`) that:

1. Stores every submission in Postgres (table auto-created on first request).
2. Emails a notification to `NOTIFY_EMAIL` (defaults to agentoutsourceofficial@gmail.com) via Gmail SMTP.
3. Captures the maximum attributes available per request: form fields, IP, Vercel's
   edge geolocation (country/region/city/postal code/lat-long/timezone/continent),
   user agent (parsed into browser/OS/device type), referrer, UTM params, page URL,
   accept-language, screen/viewport size, and client timezone.

Entries are viewable at `/pages/admin.html`, a password-gated dashboard (searchable table)
backed by `/api/admin/entries.js`.

### One-time setup on Vercel

1. **Database** — In the Vercel dashboard, open this project → **Storage** → **Create Database** →
   **Postgres** (Neon), and connect it to the project. This auto-injects the `POSTGRES_URL*`
   env vars that `@vercel/postgres` needs — no manual config.
2. **Email** — On the Gmail account that should send notifications: enable 2-Step Verification,
   then create an [App Password](https://myaccount.google.com/apppasswords). In Vercel →
   Settings → Environment Variables, set:
   - `GMAIL_USER` — the sending Gmail address
   - `GMAIL_APP_PASSWORD` — the 16-character app password
   - `NOTIFY_EMAIL` — where notifications should land (agentoutsourceofficial@gmail.com)
3. **Admin password** — set `ADMIN_PASSWORD` in the same Environment Variables screen, then
   redeploy. Visit `/pages/admin.html` and log in with it.

See `.env.example` for the full list. For local testing, copy it to `.env.local` and run
`vercel dev` (requires the Vercel CLI: `npm i -g vercel`, then `vercel link` once).

> Note: admin auth here is a single shared password sent as a request header over HTTPS —
> adequate for an internal lead-review tool, not a substitute for real user accounts if the
> data becomes sensitive.

## Connect the calendar

Open `pages/contact.html`, find the "Calendar Embed Goes Here" panel, and paste your inline embed:

- **Calendly** — inline widget `<div class="calendly-inline-widget" data-url="...">` + their `widget.js`
- **Cal.com** — inline embed snippet from your event type

Setup notes are in HTML comments right above the placeholder.

## Deploy

The static pages still work on any host, but **the contact form's notifications/database/admin
features require Vercel** (they use Vercel Serverless Functions in `/api` and Vercel Postgres,
plus Vercel's edge geolocation headers). Deploy this repo to a Vercel project (no build command
needed — it auto-detects the `/api` functions) and complete the one-time setup above.

## Editing with Cursor + Claude

Each page is standalone HTML that shares `css/styles.css` and `js/main.js`. To restyle globally, edit the `:root` tokens. To change copy, edit the relevant HTML file. The header and footer are duplicated per page (static site), so update all pages when changing nav or footer.
