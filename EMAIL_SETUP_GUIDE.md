# Email Notification System Setup Guide

## Overview
The email notification system sends automated emails for:
- Subscription confirmations
- Payment receipts
- Renewal reminders (3 days before expiration)
- Cancellation confirmations

## Email Service Provider: Resend

### Why Resend?
- Simple API
- Generous free tier (100 emails/day)
- Excellent deliverability
- Easy integration with Supabase

## Setup Instructions

### 1. Create Resend Account
1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email address

### 2. Get API Key
1. Log in to Resend dashboard
2. Go to "API Keys" section
3. Click "Create API Key"
4. Copy the API key (starts with `re_`)

### 3. Add Domain (Optional but Recommended)
1. In Resend dashboard, go to "Domains"
2. Add your domain (e.g., yourdomain.com)
3. Add DNS records as instructed
4. Wait for verification (usually a few minutes)

### 4. Configure Supabase Secret
```bash
# Add RESEND_API_KEY to Supabase
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### 5. Update Email "From" Address
### 5. Configure Email "From" Address (Optional)
The system now uses `onboarding@resend.dev` by default for testing.

To use your own domain:
1. Add and verify your domain in Resend
2. Set the EMAIL_FROM environment variable in Supabase:
```bash
supabase secrets set EMAIL_FROM=noreply@yourdomain.com
```

## Common Issues & Solutions

### "Edge Function returned a non-2xx status code"
This error can occur when:
1. **RESEND_API_KEY not configured**: The function will still return success but log emails instead of sending
2. **Invalid "from" email**: Make sure you're using `onboarding@resend.dev` or a verified domain
3. **Invalid recipient email**: Check that the email address is valid
4. **Resend API error**: Check the edge function logs in Supabase dashboard

### How to Check Logs
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on the function name (send-email, coinbase-webhook, etc.)
4. View the logs to see detailed error messages


## Testing

### Test via Admin Dashboard
1. Log in as admin
2. Go to Admin Dashboard > Emails tab
3. Enter test email address
4. Select email type
5. Click "Send Test Email"

### Test Renewal Reminders
1. In Admin Dashboard > Emails tab
2. Click "Send Renewal Reminders"
3. This will send reminders to all subscriptions expiring in 3 days

## Automated Emails

### When Emails Are Sent
- **Subscription Confirmation**: When payment is confirmed via Coinbase webhook
- **Payment Receipt**: Immediately after subscription confirmation
- **Renewal Reminder**: Run manually or set up cron job (see below)
- **Cancellation**: When admin cancels a subscription

### Setting Up Cron Job for Renewal Reminders
You can set up a cron job to run daily:

1. Use a service like cron-job.org or EasyCron
2. Set up daily job to call:
   ```
   POST https://your-project.supabase.co/functions/v1/send-renewal-reminders
   ```
3. Add authorization header with your Supabase anon key

## Email Templates

All email templates are in the `send-email` edge function. You can customize:
- Subject lines
- HTML content
- Styling
- Logo/branding

## Troubleshooting

### Emails Not Sending
1. Check RESEND_API_KEY is set correctly
2. Verify "from" email domain is verified in Resend
3. Check Supabase edge function logs
4. Ensure recipient email is valid

### Testing Without Resend
If RESEND_API_KEY is not set, the function will log email details without sending.

## Cost
- Free tier: 100 emails/day, 3,000/month
- Paid plans start at $20/month for 50,000 emails

## Support
- Resend docs: https://resend.com/docs
- Supabase edge functions: https://supabase.com/docs/guides/functions
