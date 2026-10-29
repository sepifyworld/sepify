import { getOffer } from './_offer.js';

export default async function handler(req, res) {
  const offer = await getOffer();
  const email = (process.env.CONTACT_EMAIL || 'support@sepify.com').trim();
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.status(200).json({
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
    offer: offer.active
      ? { remaining: offer.showCount ? offer.remaining : null, total: offer.total }
      : null,
    chat: !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY),
    contact: !!process.env.RESEND_API_KEY,
  });
}
