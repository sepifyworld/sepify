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
- `api/_offer.js`: founding offer terms and the Stripe spots count (count shows at 15 or fewer left)

## Settings (Vercel → Project → Settings → Environment Variables)
| Name | What it is | Needed for |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API key (console.anthropic.com) | The chat. Without it, the chat button stays hidden. |
| `STRIPE_RESTRICTED_KEY` | Stripe restricted key with **Coupons: Read** only | The founding offer and spots count |
| `FOUNDING_COUPON_ID` | The ID of the founding coupon in Stripe | The founding offer. Without it, the offer stays hidden. |
| `RESEND_API_KEY` | Resend API key (resend.com), with sepify.com verified as a sending domain | Contact form sends by email. Without it, the form opens the visitor's email app. |
| `CONTACT_EMAIL` | Optional. Defaults to support@sepify.com | Contact email |

Never put keys in the website files. Only in Vercel's settings.
