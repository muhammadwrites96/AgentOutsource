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

## Connect the contact form

Open `pages/contact.html` and replace `action="#"` on the `<form>` with a real endpoint:

- **Formspree** — `action="https://formspree.io/f/XXXX" method="POST"`
- **Basin** — `action="https://usebasin.com/f/XXXX" method="POST"`
- **Netlify Forms** — add the `netlify` attribute to the `<form>` (auto-detected when hosted on Netlify)

Until an endpoint is set, the form shows a "not connected yet" note instead of submitting (`js/main.js`).

## Connect the calendar

Open `pages/contact.html`, find the "Calendar Embed Goes Here" panel, and paste your inline embed:

- **Calendly** — inline widget `<div class="calendly-inline-widget" data-url="...">` + their `widget.js`
- **Cal.com** — inline embed snippet from your event type

Setup notes are in HTML comments right above the placeholder.

## Deploy

Any static host works: Netlify, Vercel, Cloudflare Pages, or GitHub Pages. Point it at the repo root; no build command required.

## Editing with Cursor + Claude

Each page is standalone HTML that shares `css/styles.css` and `js/main.js`. To restyle globally, edit the `:root` tokens. To change copy, edit the relevant HTML file. The header and footer are duplicated per page (static site), so update all pages when changing nav or footer.
