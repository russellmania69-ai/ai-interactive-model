export default async function handler(request: Request) {
  try {
    console.log('verify-stripe-session: incoming request', { method: request.method, url: request.url });
    if (request.method === 'GET') {
      const url = new URL(request.url);
      // expose a minimal health/debug endpoint for quick checks
      if (url.searchParams.get('health') === '1' || url.pathname.endsWith('/health')) {
        const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY') || Deno.env.get('STRIPE_SECRET');
        return new Response(JSON.stringify({ ok: true, service: 'verify-stripe-session', stripe_configured: !!STRIPE_SECRET }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
    }
    const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY') || Deno.env.get('STRIPE_SECRET');
    if (!STRIPE_SECRET) {
      return new Response(JSON.stringify({ ok: false, error: 'Stripe secret not configured' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id') || (await request.json().catch(() => ({}))).session_id;
    console.log('verify-stripe-session: sessionId', sessionId);
    if (!sessionId) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing session_id' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const resp = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET}`,
      },
    });

    // Read raw text and try to parse JSON so we can safely return string errors
    const raw = await resp.text().catch(() => '');
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch (e) {
      data = null;
    }
    console.log('verify-stripe-session: stripe response', { status: resp.status, data, raw: raw && raw.slice(0, 200) });
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
    console.error('verify-stripe-session: runtime error', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
