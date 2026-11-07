// Founding offer: Pro at the founding price for the first 20 businesses.
// The live count comes from the Sepify app (same count checkout uses), so the
// homepage and checkout always agree. Shown while spots remain.
const APP_URL = (process.env.SEPIFY_APP_URL || 'https://app.sepify.com').replace(/\/$/, '');
const SHOW_COUNT_AT = 5;
let cache = { at: 0, value: null };

export async function getOffer() {
  if (Date.now() - cache.at < 60_000 && cache.value) return cache.value;
  try {
    const r = await fetch(`${APP_URL}/api/sepify-billing/founding`, { headers: { Accept: 'application/json' } });
    if (!r.ok) return { active: false };
    const j = await r.json();
    const total = Number(j.total) || 20;
    const remaining = Math.max(0, Number(j.remaining) || 0);
    const value = { active: remaining > 0, total, remaining, showCount: remaining <= SHOW_COUNT_AT };
    cache = { at: Date.now(), value };
    return value;
  } catch {
    return { active: false };
  }
}

export const OFFER_FACTS = `
FOUNDING OFFER (first 20 businesses only, while spots remain)
- Sepify Shift Pro for $39 CAD per location per month instead of $65, or $390 per location per year instead of $650, plus tax.
- It's applied automatically at checkout when they choose Pro, while spots remain. No code needed.
- The founding price is locked in for as long as the subscription stays active, including locations added later.
- If the customer cancels, the founding price ends and can't be restored.
- The 14-day free trial still applies.
`;
