// Founding offer: reads the live count from Stripe. Shown only when the coupon is set up.
const TOTAL = 50;
const SHOW_COUNT_AT = 15;
let cache = { at: 0, value: null };

export async function getOffer() {
  const key = process.env.STRIPE_RESTRICTED_KEY;
  const coupon = process.env.FOUNDING_COUPON_ID;
  if (!key || !coupon) return { active: false };
  if (Date.now() - cache.at < 60_000 && cache.value) return cache.value;
  try {
    const r = await fetch(`https://api.stripe.com/v1/coupons/${encodeURIComponent(coupon)}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!r.ok) return { active: false };
    const c = await r.json();
    const max = c.max_redemptions || TOTAL;
    const used = c.times_redeemed || 0;
    const remaining = Math.max(0, max - used);
    const value = {
      active: !!c.valid && remaining > 0,
      total: max,
      remaining,
      showCount: remaining <= SHOW_COUNT_AT,
    };
    cache = { at: Date.now(), value };
    return value;
  } catch {
    return { active: false };
  }
}

export const OFFER_FACTS = `
FOUNDING OFFER (first 50 businesses only, while spots remain)
- Sepify Shift for $29 CAD per location per month instead of $39, or $290 per location per year instead of $390, plus tax.
- The founding price is locked in for as long as the subscription stays active, including locations added later.
- Future Sepify products and add-ons are charged at their regular price.
- If the customer cancels, the founding price ends and can't be restored.
- The 30-day money-back guarantee still applies.
`;
