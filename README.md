# sepify.com

The Sepify Shift marketing site, deployed on Vercel. Plain static files plus two small server functions.

## How the site is built
Plain static pages plus a few small server functions, on Vercel.

- **Edit pages in `site-src/pages/`.** Each file starts with a settings comment (address, title, description) followed by the page content.
- **Then run `node site-src/build.mjs`.** It writes the finished `.html` files at the top level and `sitemap.xml`, adding the shared header, footer, AI chat, SEO tags and structured data to every page. FAQ structured data is built from each page's own FAQ, so they always match.
- `assets/sepify.css`: the one stylesheet. The colours are Sepify Shift's status colours (green on the clock, amber on break, grey off).
- `assets/sepify.js`: menus, the live punch board on the homepage, pricing toggle and founding price, contact form, time card calculator and the AI chat.
- `assets/img/`: industry photos.
- `sepify-shift-tour.html`: the interactive tour (voiceover and music are inside the file). Not built from `site-src`.
- `api/site.js`: tells pages whether to show the founding offer, the spots count and the chat
- `api/chat.js`: the AI assistant (Claude, or OpenAI if only that key is set)
- `api/_facts.js`: **what the assistant knows and its rules. Edit this to change its answers.**
- `api/contact.js`: sends contact form messages to support@sepify.com
- `api/_offer.js`: founding offer terms and the live spots count, read from the app at app.sepify.com/api/sepify-billing/founding (count shows at 5 or fewer left)

## Pages (Nov 2026)
| Address | Targets searches like |
|---|---|
| `/` | time clock and scheduling app |
| `/time-clock` | employee time clock app, face check, buddy punching |
| `/employee-scheduling` | employee scheduling app |
| `/pricing` | Sepify pricing |
| `/restaurant-time-clock` | restaurant time clock |
| `/retail-time-clock` | retail time clock |
| `/salon-time-clock` | salon / spa time clock |
| `/time-card-calculator` | time card calculator (free tool) |
| `/contact` | contact |

## Settings (Vercel → Project → Settings → Environment Variables)
| Name | What it is | Needed for |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API key (console.anthropic.com) | The chat. Without it, the chat button stays hidden. |
| `SEPIFY_APP_URL` | Optional. Defaults to https://app.sepify.com | Where the founding count is read from |
| `RESEND_API_KEY` | Resend API key (resend.com), with sepify.com verified as a sending domain | Contact form sends by email. Without it, the form opens the visitor's email app. |
| `CONTACT_EMAIL` | Optional. Defaults to support@sepify.com | Contact email |

Never put keys in the website files. Only in Vercel's settings.

**Plans (Nov 2026):** Essential $35 / Pro $65 per location per month ($350 / $650 a year), founding Pro $39 / $390 for the first 20. Prices live in the app and Stripe; the site only displays them.

**Free trial (Nov 2026):** 14 days, card required, one per business; it replaced the 30-day money-back guarantee.

**When prices or the offer change**, update `PRICES`/`FOUNDING` in `assets/sepify.js`, the plan cards and FAQs in `site-src/pages/` (search for the old price), the offers in `site-src/build.mjs`, and `api/_facts.js` / `api/_offer.js`. Then rebuild.
