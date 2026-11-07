// Builds sepify.com's pages: node site-src/build.mjs
// Each file in site-src/pages starts with a JSON comment of settings, then the page's <main> content.
// The header, footer, chat, SEO tags and structured data are added here so every page matches.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const SITE = 'https://www.sepify.com';
const SIGNUP = 'https://app.sepify.com/signup';
const SIGNIN = 'https://app.sepify.com/manager/login';
const LOGO = readFileSync(join(here, 'logo-path.txt'), 'utf8').trim();
const TODAY = new Date().toISOString().slice(0, 10);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&rsquo;|&#8217;/g, '’').replace(/\s+/g, ' ').trim();
const mark = (fill) => `<svg viewBox="170 210 680 600" aria-hidden="true"><path fill-rule="evenodd" fill="${fill}" d="${LOGO}"/><circle cx="735.17" cy="324.60" r="78" fill="#14B866"/></svg>`;

const ORG = {
  '@type': 'Organization', '@id': `${SITE}/#org`, name: 'Sepify', legalName: 'Sepify Inc.', url: `${SITE}/`,
  logo: `${SITE}/logo.png`, email: 'support@sepify.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Ottawa', addressRegion: 'ON', addressCountry: 'CA' },
};

function header(nav) {
  const cur = (k) => (nav === k ? ' aria-current="page"' : '');
  return `<a class="skip" href="#main">Skip to content</a>
<a class="offerbar" id="offerbar" href="/pricing#plans" hidden>Founding offer: <b>Pro for $39 a month</b>, locked in for the first 20 businesses.<span class="go-on">See pricing</span></a>
<header class="top">
  <div class="wrap">
    <a class="brand" href="/" aria-label="Sepify home">sepify<i></i></a>
    <nav class="nav" aria-label="Main">
      <a href="/time-clock"${cur('time-clock')}>Time clock</a>
      <a href="/employee-scheduling"${cur('scheduling')}>Scheduling</a>
      <a href="/pricing"${cur('pricing')}>Pricing</a>
      <div class="dd"><button type="button" aria-expanded="false" aria-controls="dd-ind">Industries</button>
        <div class="ddp" id="dd-ind">
          <a href="/restaurant-time-clock"><b>Restaurants and cafés</b><small>Kitchen, front and drivers on one clock</small></a>
          <a href="/retail-time-clock"><b>Retail stores</b><small>Every store live from your phone</small></a>
          <a href="/salon-time-clock"><b>Salons and spas</b><small>Stylists punch in at the front desk</small></a>
        </div>
      </div>
      <div class="dd"><button type="button" aria-expanded="false" aria-controls="dd-res">Free tools</button>
        <div class="ddp" id="dd-res">
          <a href="/time-card-calculator"><b>Time card calculator</b><small>Add up a week of hours, breaks and overtime</small></a>
          <a href="/sepify-shift-tour"><b>45-second tour</b><small>See a shift from punch-in to payroll</small></a>
        </div>
      </div>
    </nav>
    <div class="topr">
      <a class="signin" href="${SIGNIN}">Sign in</a>
      <a class="btn go small" href="${SIGNUP}">Start free</a>
      <button class="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="mnav"><span></span></button>
    </div>
  </div>
</header>
<nav class="mnav" id="mnav" aria-label="Mobile">
  <a href="/time-clock">Time clock<small>PIN and face check on any tablet</small></a>
  <a href="/employee-scheduling">Scheduling<small>Build the week in minutes</small></a>
  <a href="/pricing">Pricing<small>From $35 per location, 14 days free</small></a>
  <a class="sub" href="/restaurant-time-clock">Restaurants and cafés</a>
  <a class="sub" href="/retail-time-clock">Retail stores</a>
  <a class="sub" href="/salon-time-clock">Salons and spas</a>
  <a href="/time-card-calculator">Time card calculator<small>Free tool</small></a>
  <a href="/contact">Contact</a>
  <div class="btns"><a class="btn go" href="${SIGNUP}">Start free for 14 days</a><a class="btn line" href="${SIGNIN}">Sign in</a></div>
</nav>`;
}

function footer() {
  return `<footer>
  <div class="wrap">
    <div class="cols">
      <div><a class="brand" href="/">sepify<i></i></a><p class="about">Simple software for businesses with shift teams. Built in Ottawa by a restaurant owner, and used every shift at a three-location restaurant group.</p></div>
      <div><h4>Product</h4><ul><li><a href="/time-clock">Time clock</a></li><li><a href="/employee-scheduling">Scheduling</a></li><li><a href="/time-clock#face-check">Face check</a></li><li><a href="/pricing">Pricing</a></li><li><a href="/sepify-shift-tour">45-second tour</a></li></ul></div>
      <div><h4>Industries</h4><ul><li><a href="/restaurant-time-clock">Restaurants and cafés</a></li><li><a href="/retail-time-clock">Retail stores</a></li><li><a href="/salon-time-clock">Salons and spas</a></li></ul></div>
      <div><h4>Free tools</h4><ul><li><a href="/time-card-calculator">Time card calculator</a></li></ul></div>
      <div><h4>Company</h4><ul><li><a href="/contact">Contact</a></li><li><a href="${SIGNIN}">Sign in</a></li><li><a href="https://app.sepify.com/terms">Terms</a></li><li><a href="https://app.sepify.com/privacy">Privacy</a></li></ul></div>
    </div>
    <div class="legal"><span>© ${new Date().getFullYear()} Sepify Inc. Ottawa, Ontario.</span><span>Prices in CAD. Available across Canada, outside Quebec for now.</span></div>
  </div>
</footer>
<button type="button" class="cbtn" id="cbtn" aria-controls="cpanel" aria-expanded="false" hidden>${mark('#ffffff')}<span>Ask about Sepify Shift</span></button>
<div class="cpanel" id="cpanel" role="dialog" aria-label="Sepify assistant" hidden>
  <div class="chead">${mark('#ffffff')}<b>Sepify assistant<small>AI. Answers about Sepify Shift.</small></b><button type="button" class="cx" id="cx" aria-label="Close chat">×</button></div>
  <div class="clog" id="clog" aria-live="polite"></div>
  <div class="chips" id="chips">
    <button type="button" class="chip" data-q="How much does it cost?">Pricing</button>
    <button type="button" class="chip" data-q="How does punch-in work for my staff?">How it works</button>
    <button type="button" class="chip" data-q="I have more than one location. Does it work for that?">Several locations</button>
    <button type="button" class="chip" data-q="Is there a free trial?">Free trial</button>
    <button type="button" class="chip go" data-go="1">Start free</button>
  </div>
  <form class="cform" id="cform" autocomplete="off"><input id="cin" aria-label="Your question" placeholder="Ask a question" maxlength="500"><button id="csend" type="submit">Send</button></form>
</div>
<script src="/assets/sepify.js" defer></script>`;
}

function faqSchema(main) {
  const items = [...main.matchAll(/<details[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*<div>([\s\S]*?)<\/div>\s*<\/details>/g)];
  if (!items.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(([, q, a]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(a) } })),
  };
}

const pages = readdirSync(join(here, 'pages')).filter((f) => f.endsWith('.html')).sort();
const sitemap = [];

for (const file of pages) {
  const src = readFileSync(join(here, 'pages', file), 'utf8');
  const m = src.match(/^<!--(\{[\s\S]*?\})-->\s*/);
  if (!m) throw new Error(`${file}: missing settings comment`);
  const p = JSON.parse(m[1]);
  const main = src.slice(m[0].length);
  const url = SITE + p.path;
  if (p.title.length > 62) console.warn(`! ${file}: title is ${p.title.length} chars`);
  if (p.description.length > 160) console.warn(`! ${file}: description is ${p.description.length} chars`);

  const graph = [ORG];
  if (p.path === '/') graph.push({ '@type': 'WebSite', '@id': `${SITE}/#site`, url: `${SITE}/`, name: 'Sepify', publisher: { '@id': `${SITE}/#org` } });
  if (p.app) {
    graph.push({
      '@type': 'SoftwareApplication', name: 'Sepify Shift', applicationCategory: 'BusinessApplication', operatingSystem: 'Web, iPad, Android',
      description: 'Time clock and employee scheduling for shift teams: PIN and face check punch-in on any tablet, breaks, live view, timesheets and payroll export.',
      url: `${SITE}/`, publisher: { '@id': `${SITE}/#org` },
      offers: [
        { '@type': 'Offer', name: 'Essential', price: '35', priceCurrency: 'CAD', url: `${SITE}/pricing`, description: 'Per location per month, plus tax. 14-day free trial.' },
        { '@type': 'Offer', name: 'Pro', price: '65', priceCurrency: 'CAD', url: `${SITE}/pricing`, description: 'Per location per month, plus tax. Includes scheduling. 14-day free trial.' },
      ],
    });
  }
  if (p.crumbs) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [['Home', '/'], ...p.crumbs].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + path })),
    });
  }
  if (p.webapp) graph.push({ '@type': 'WebApplication', name: p.webapp, url, applicationCategory: 'BusinessApplication', operatingSystem: 'Any', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' } });
  const faq = faqSchema(main);
  if (faq) graph.push(faq);

  const crumbs = p.crumbs
    ? `<p class="crumbs"><a href="/">Home</a> / ${p.crumbs.map(([n, h], i) => (i === p.crumbs.length - 1 ? esc(n) : `<a href="${h}">${esc(n)}</a>`)).join(' / ')}</p>`
    : '';

  const html = `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#102019">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Sepify">
<meta property="og:locale" content="en_CA">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(p.ogTitle || p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:image" content="${SITE}/${p.ogImage || 'og.png'}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,600..800&family=Geist:wght@400;500;600&family=Caveat:wght@500&display=swap">
<link rel="stylesheet" href="/assets/sepify.css">
${p.preload ? `<link rel="preload" as="image" href="${p.preload}">\n` : ''}<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>
</head>
<body>
${header(p.nav)}
<main id="main">
${crumbs ? main.replace('<!--crumbs-->', crumbs) : main}
</main>
${footer()}
</body>
</html>
`;
  writeFileSync(join(root, p.out), html);
  sitemap.push(`  <url><loc>${url}</loc><lastmod>${TODAY}</lastmod></url>`);
  console.log(`built ${p.out}  (${p.title.length}/${p.description.length})${faq ? `  faq:${faq.mainEntity.length}` : ''}`);
}

sitemap.push(`  <url><loc>${SITE}/sepify-shift-tour</loc><lastmod>${TODAY}</lastmod></url>`);
writeFileSync(join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.join('\n')}\n</urlset>\n`);
console.log('built sitemap.xml');
