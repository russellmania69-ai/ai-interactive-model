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

    const { modelName, modelId, price, userId, email } = body;
    if (!modelName || !modelId || !price) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields: modelName, modelId, price" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || Deno.env.get("STRIPE_SECRET");
    if (!stripeKey) {
      return new Response(JSON.stringify({ success: false, error: "Stripe secret not configured (STRIPE_SECRET_KEY)" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // Build Stripe Checkout Session creation body
    const lineItem = {
      price_data: {
        currency: "usd",
        product_data: { name: modelName },
        unit_amount: Math.round(Number(price) * 100),
      },
      quantity: 1,
    };

    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("payment_method_types[]", "card");
    params.append("line_items[0][price_data][currency]", "usd");
    params.append("line_items[0][price_data][product_data][name]", String(modelName));
    params.append("line_items[0][price_data][unit_amount]", String(Math.round(Number(price) * 100)));
    params.append("line_items[0][quantity]", "1");

    // success/cancel URLs should be set to your site; build a valid absolute URL.
    // Prefer the request origin, otherwise fall back to environment. Handle
    // env values that may already contain a protocol (avoid duplicating https://).
    const rawOrigin = req.headers.get("origin") || (Deno.env.get("SITE_URL") || Deno.env.get("VITE_SITE_URL") || Deno.env.get("VITE_SUPABASE_URL") || "");
    let origin = String(rawOrigin || "").trim();
    if (!origin) {
      // If we have no origin, use a safe placeholder (Stripe requires absolute URLs).
      origin = "https://example.com";
    }
    // If origin doesn't include protocol, prepend https://
    if (!/^https?:\/\//i.test(origin)) {
      origin = `https://${origin.replace(/\/$/, "")}`;
    }
    origin = origin.replace(/\/$/, "");
    const successUrl = `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/`;
    params.append("success_url", successUrl);
    params.append("cancel_url", cancelUrl);

    // attach metadata
    params.append("metadata[model_id]", String(modelId));
    if (userId) params.append("metadata[user_id]", String(userId));
    if (email) params.append("customer_email", String(email));

    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return new Response(JSON.stringify({ success: false, error: data?.error?.message || "Stripe API error", details: data }), { status: resp.status, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, url: data.url, sessionId: data.id, raw: data }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("create-stripe-checkout error:", err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
