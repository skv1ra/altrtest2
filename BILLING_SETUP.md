# Altr billing setup

This build adds the LiqPay payment foundation for Altr subscriptions.

## Environment variables for Vercel

Add these in Vercel > Project > Settings > Environment Variables:

```env
LIQPAY_PUBLIC_KEY=your_public_key
LIQPAY_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

Optional email after payment:

```env
RESEND_API_KEY=your_resend_key
BILLING_EMAIL_FROM=Altr <billing@your-domain.com>
```

If `RESEND_API_KEY` is not configured, the app will not fail. It will log the billing email payload as a stub.

## What is included

- `/pricing` card payment flow through LiqPay checkout
- automatic renewal payload foundation
- `/api/payments/liqpay/create`
- `/api/payments/liqpay/callback`
- `/payment/success`
- `/payment/cancel`
- `/payment/receipt/[orderId]`
- local invoice/receipt storage for MVP
- local subscription activation after success redirect
- paid feature gates already use the active plan system

## Production TODO

This MVP does not include a real database. Before real launch, add:

- users table
- subscriptions table
- payments/invoices table
- callback-based server activation
- access control by authenticated user on the server
- real recurring renewal state from LiqPay callbacks

Do not rely on client-side activation for production billing.

## Supabase database persistence

This build includes Supabase persistence for billing.

Run `supabase/schema.sql` in Supabase SQL Editor, then add these Vercel env variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The LiqPay callback now writes to:

- `altr_payments`
- `altr_subscriptions`
- `altr_invoices`

See `SUPABASE_SETUP.md` for the full setup.
