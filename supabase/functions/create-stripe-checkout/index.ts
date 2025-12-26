export default async function handler(request: Request) {
  try {
    return new Response(JSON.stringify({ ok: true, msg: 'create-stripe-checkout stub' }), {
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
