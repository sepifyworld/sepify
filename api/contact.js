// Contact form (contact page and the in-chat form): emails the message to the Sepify inbox through Resend.
// Needs RESEND_API_KEY and a verified sending domain in Resend. Until then the page opens the visitor's email app instead.
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60 * 60_000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 5;
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'Please email us directly at support@sepify.com.' });
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ error: 'Too many messages. Please try again later or email support@sepify.com.' });

  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const name = String(b.name || '').trim().slice(0, 100);
  const business = String(b.business || '').trim().slice(0, 120);
  const email = String(b.email || '').trim().slice(0, 160);
  const message = String(b.message || '').trim().slice(0, 2000);
  const phone = String(b.phone || '').replace(/[^\d+()\-.\s]/g, '').trim().slice(0, 30);
  const fromChat = b.source === 'chat';
  const transcript = String(b.transcript || '').trim().slice(0, 4000);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please add your name, a valid email and a message.' });
  }

  const to = (process.env.CONTACT_EMAIL || 'support@sepify.com').trim();
  const from = process.env.CONTACT_FROM || 'Sepify website <website@sepify.com>';
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `${fromChat ? 'Website chat' : 'Website message'} from ${name}${business ? ` (${business})` : ''}`,
        text: `${message}\n\n${name}${business ? `\n${business}` : ''}\n${email}${phone ? `\n${phone}` : ''}${transcript ? `\n\n--- Chat before the message ---\n${transcript}` : ''}`,
        html: `<p>${esc(message).replace(/\n/g, '<br>')}</p><p>${esc(name)}${business ? `<br>${esc(business)}` : ''}<br>${esc(email)}${phone ? `<br>${esc(phone)}` : ''}</p>${transcript ? `<hr><p style="color:#555"><b>Chat before the message</b><br>${esc(transcript).replace(/\n/g, '<br>')}</p>` : ''}`,
      }),
    });
    if (!r.ok) throw new Error(await r.text());
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('contact error', e.message);
    res.status(502).json({ error: 'Your message could not be sent. Please email support@sepify.com.' });
  }
}
