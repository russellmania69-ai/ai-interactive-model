export default async function handler(request: Request) {
  try {
    const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY') || Deno.env.get('STRIPE_SECRET');
    if (!STRIPE_SECRET) {
      return new Response(JSON.stringify({ ok: false, error: 'Stripe secret not configured' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id') || (await request.json().catch(() => ({}))).session_id;
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
