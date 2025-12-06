import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ success: false, error: "Method not allowed - use POST" }), { status: 405, headers: { "Content-Type": "application/json" } });
    }

    const contentType = req.headers.get("content-type") || "";
    let body: any = {};
    if (contentType.includes("application/json")) body = await req.json();
    else {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
    }

    const { session_id } = body;
    if (!session_id) {
      return new Response(JSON.stringify({ success: false, error: "Missing session_id in request body" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || Deno.env.get("STRIPE_SECRET");
    if (!stripeKey) {
      return new Response(JSON.stringify({ success: false, error: "Stripe secret not configured (STRIPE_SECRET_KEY)" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const resp = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(session_id)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
      },
    });

    const data = await resp.json();
    if (!resp.ok) {
      return new Response(JSON.stringify({ success: false, error: data?.error?.message || "Stripe API error", details: data }), { status: resp.status, headers: { "Content-Type": "application/json" } });
    }

    // Simplify the response for the client
    const simplified = {
      id: data.id,
      amount_total: data.amount_total,
      currency: data.currency,
      payment_status: data.payment_status,
      customer_email: data.customer_email,
      metadata: data.metadata,
      raw: data,
    };

    return new Response(JSON.stringify({ success: true, session: simplified }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("verify-stripe-session error:", err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
import { serve } from "std/server";

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed, use POST with { sessionId } in body" }), { status: 405, headers: { "Content-Type": "application/json" } });
    }

    const contentType = req.headers.get("content-type") || "";
    let body: any = {};
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      // try to parse form data
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
    }

    const sessionId = body.sessionId || body.session_id;
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Missing sessionId in request body" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || Deno.env.get("STRIPE_SECRET");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Stripe secret not configured (STRIPE_SECRET_KEY)" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const url = `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=payment_intent`;
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${stripeKey}`,
      },
    });

    const data = await resp.json();
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || "Stripe API error", details: data }), { status: 502, headers: { "Content-Type": "application/json" } });
    }

    const customer_email = data.customer_details?.email || data.customer_email || null;
    const amount_total = data.amount_total ?? data.payment_intent?.amount ?? null;
    const currency = data.currency ?? data.payment_intent?.currency ?? null;
    const payment_status = data.payment_status ?? data.payment_intent?.status ?? null;

    return new Response(JSON.stringify({ customer_email, amount_total, currency, payment_status, raw: data }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("verify-stripe-session error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
