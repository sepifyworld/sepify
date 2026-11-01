// The old Sepify air freshener store (Shopify) pages no longer exist.
// "410 Gone" tells Google they were removed on purpose, so it drops them from
// search faster than a plain 404. People still get a link to the new site.
export default function handler(req, res) {
  res.setHeader('X-Robots-Tag', 'noindex');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(410).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page removed · Sepify</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#111111;color:#fff;font:16px/1.5 system-ui,sans-serif;padding:16px;text-align:center}a{color:#12B76A;font-weight:600}</style></head><body><main><h1 style="font-size:24px">This page has been removed</h1><p>Sepify now makes simple software for businesses.</p><p><a href="https://sepify.com/">Go to sepify.com</a></p></main></body></html>`);
}
