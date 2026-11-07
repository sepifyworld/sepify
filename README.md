# sepify.com

The Sepify Shift marketing site, deployed on Vercel. Plain static files plus two small server functions.

## Files
- `index.html`: the homepage
- `contact.html`: the contact page (sepify.com/contact)
- `sepify-shift-tour.html`: the interactive tour embedded on the homepage (voiceover and music are inside the file)
- `favicon.svg`: the "s." icon
- `api/site.js`: tells the page whether to show the founding offer, the spots count and the chat
- `api/chat.js`: the AI assistant (Claude, or OpenAI if only that key is set)
- `api/_facts.js`: **what the assistant knows and its rules. Edit this to change its answers.**
- `api/contact.js`: sends contact form messages to support@sepify.com
- `api/_offer.js`: founding offer terms (Pro at $39 for the first 20 businesses) and the live spots count, read from the app at app.sepify.com/api/sepify-billing/founding (count shows at 5 or fewer left)

## Settings (Vercel → Project → Settings → Environment Variables)
| Name | What it is | Needed for |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API key (console.anthropic.com) | The chat. Without it, the chat button stays hidden. |
| `SEPIFY_APP_URL` | Optional. Defaults to https://app.sepify.com | Where the founding count is read from |
| `RESEND_API_KEY` | Resend API key (resend.com), with sepify.com verified as a sending domain | Contact form sends by email. Without it, the form opens the visitor's email app. |
| `CONTACT_EMAIL` | Optional. Defaults to support@sepify.com | Contact email |

Never put keys in the website files. Only in Vercel's settings.

## Pages and SEO (Nov 2026)
- `restaurant-time-clock.html`: landing page for restaurant time clock searches (sepify.com/restaurant-time-clock)
- `site.css`: shared styles for the homepage and the restaurant page
- `og.png` (share image), `logo.png` (used in Google's structured data), `apple-touch-icon.png`
- Structured data: Organization, WebSite and SoftwareApplication on the homepage; FAQPage on both pages (built from each page's FAQ, so keep them matching); BreadcrumbList on the restaurant page
- Add new pages to `sitemap.xml`

**Plans (Nov 2026):** Essential $35 / Pro $65 per location per month ($350 / $650 a year), founding Pro $39 / $390 for the first 20. Prices live in the app and Stripe; the site only displays them.

**Free trial (Nov 2026):** 14 days, card required, one per business; it replaced the 30-day money-back guarantee.

**When the offer changes**, update it in all of these places: the homepage hero line, pricing card and guarantee box, FAQ "How does billing work?", final call to action, the chat chip, the homepage SoftwareApplication offer; `restaurant-time-clock.html` hero line, pricing section and final call to action; and `api/_facts.js`.
