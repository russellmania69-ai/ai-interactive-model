export default async function handler(request: Request) {
  try {
    console.log('create-stripe-checkout: incoming request', { method: request.method, url: request.url });
    if (request.method !== 'POST') {
      // provide a simple health/debug response for GET requests
      if (request.method === 'GET') {
        const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY') || Deno.env.get('STRIPE_SECRET');
        return new Response(JSON.stringify({ ok: true, service: 'create-stripe-checkout', stripe_configured: !!STRIPE_SECRET }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }

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
    console.log('create-stripe-checkout: body', body);
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
    // Read raw text and try to parse JSON so we can safely return string errors
    const raw = await resp.text().catch(() => '');
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch (e) {
      data = null;
    }
    console.log('create-stripe-checkout: stripe response', { status: resp.status, data, raw: raw && raw.slice(0, 200) });
    if (!resp.ok) {
      const errText = data && (data.error || data.message) ? (data.error || data.message) : raw || 'stripe error';
      return new Response(JSON.stringify({ ok: false, error: String(errText) }), {
        status: resp.status || 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, session: data || raw }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('create-stripe-checkout: runtime error', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
