import { FACTS, RULES } from './_facts.js';
import { getOffer, OFFER_FACTS } from './_offer.js';

// Best-effort limit per visitor (per server instance): 20 messages per 10 minutes.
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 20;
}

function clean(messages) {
  if (!Array.isArray(messages)) return null;
  const out = messages
    .slice(-12)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));
  while (out.length && out[0].role !== 'user') out.shift();
  if (!out.length || out[out.length - 1].role !== 'user') return null;
  return out;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ error: "You've sent a lot of messages. Please try again in a few minutes." });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const messages = clean(body.messages);
  if (!messages) return res.status(400).json({ error: 'No message to answer.' });

  const offer = await getOffer();
  const email = (process.env.CONTACT_EMAIL || 'support@sepify.com').trim();
  const system = [
    RULES,
    'FACT SHEET:',
    FACTS,
    offer.active ? OFFER_FACTS : 'There is no founding offer or discount available right now.',
    email ? `CONTACT: the Sepify team can be reached at ${email} or through the contact page at sepify.com/contact.` : 'CONTACT: visitors can reach the Sepify team through the contact section on sepify.com.',
  ].join('\n');

  try {
    let reply = '';
    if (process.env.ANTHROPIC_API_KEY) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY.trim(),
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5',
          max_tokens: 300,
          system,
          messages,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(`${r.status} ${j?.error?.type || ''} ${j?.error?.message || 'AI error'}`);
      reply = (j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
    } else if (process.env.OPENAI_API_KEY) {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          max_tokens: 300,
          temperature: 0.3,
          messages: [{ role: 'system', content: system }, ...messages],
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error?.message || 'AI error');
      reply = (j.choices?.[0]?.message?.content || '').trim();
    } else {
      return res.status(503).json({ error: 'Chat is not set up yet.' });
    }
    res.status(200).json({ reply: reply || "Sorry, I didn't catch that. Could you ask another way?" });
  } catch (e) {
    console.error('chat error', e.message);
    const debug = req.headers['x-sepify-debug'] === '1' ? { detail: String(e.message).slice(0, 200) } : {};
    res.status(502).json({ error: 'The assistant is unavailable right now. Please try again shortly.', ...debug });
  }
}
