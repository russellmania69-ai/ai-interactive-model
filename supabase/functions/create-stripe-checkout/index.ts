export default async function handler(request: Request) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, error: 'POST required' }), {
        status: 405,
        headers: { 'content-type': 'application/json' },
      });
    }

    const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY') || Deno.env.get('STRIPE_SECRET');
    if (!STRIPE_SECRET) {
      return new Response(JSON.stringify({ ok: false, error: 'Stripe secret not configured' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    const body = await request.json().catch(() => ({}));
    const { priceId, success_url, cancel_url, quantity = 1 } = body as Record<string, any>;

    if (!priceId || !success_url || !cancel_url) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing priceId, success_url or cancel_url' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', String(success_url));
    params.append('cancel_url', String(cancel_url));
    params.append('line_items[0][price]', String(priceId));
    params.append('line_items[0][quantity]', String(quantity));

    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await resp.json().catch(() => ({ error: 'invalid-json' }));
    if (!resp.ok) {
      return new Response(JSON.stringify({ ok: false, error: data }), {
        status: resp.status || 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, session: data }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
