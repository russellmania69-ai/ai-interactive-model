Quick deploy & usage

1. Ensure you have the Supabase CLI installed and you're authenticated:

   supabase login

2. Set the Stripe secret for this function (replace with your secret):

   supabase secrets set STRIPE_SECRET_KEY="sk_test_..."

3. Deploy the function:

   supabase functions deploy verify-stripe-session --project-ref <your-project-ref>

4. Example request (from the client / or `curl`):

   curl -X POST "https://<your-supabase-project>.functions.supabase.co/verify-stripe-session" \
     -H "Content-Type: application/json" \
     -d '{"sessionId":"cs_test_..."}'

The function returns JSON with fields: `customer_email`, `amount_total` (in cents), `currency`, `payment_status`, and `raw` (original Stripe response).
