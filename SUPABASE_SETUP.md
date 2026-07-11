# Altr Supabase Billing Setup

This version adds Supabase persistence for LiqPay payments, subscriptions and receipts.

## 1. Create Supabase project

Create a project at Supabase and copy:

- Project URL
- anon public key
- service role key

The service role key must be stored only on the server/Vercel. Never expose it in client code.

## 2. Run SQL schema

Open Supabase → SQL Editor → New query.

Paste and run:

```sql
-- contents of supabase/schema.sql
```

The schema creates:

- `altr_profiles`
- `altr_subscriptions`
- `altr_payments`
- `altr_invoices`

RLS is enabled. Server routes write with the service role key.

## 3. Add Vercel environment variables

In Vercel → Project → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
LIQPAY_PUBLIC_KEY=your-liqpay-public-key
LIQPAY_PRIVATE_KEY=your-liqpay-private-key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

Optional email after payment:

```env
RESEND_API_KEY=your-resend-api-key
BILLING_EMAIL_FROM=Altr <billing@your-domain.com>
```

## 4. How it works

### Payment creation

`POST /api/payments/liqpay/create`

- validates selected plan
- creates a LiqPay checkout payload
- creates a pending payment in Supabase if Supabase is configured
- returns LiqPay `data` and `signature`

### LiqPay callback

`POST /api/payments/liqpay/callback`

- verifies LiqPay signature
- saves payment callback into Supabase
- creates/updates active subscription
- creates invoice/receipt
- sends optional email receipt

### Billing status

`GET /api/billing/status?email=user@email.com`

or

`GET /api/billing/status?orderId=altr_personal_xxx`

Returns the active subscription from Supabase.

### Receipt

`GET /api/billing/receipt/:orderId`

Returns invoice data from Supabase.

## 5. Important MVP limitation

The current site still uses localStorage for demo authentication. Supabase stores billing records by email/order ID, but it is not yet full Supabase Auth.

For production, next steps are:

1. Add Supabase Auth.
2. Link `altr_profiles` to `auth.users.id`.
3. Move app profile, memory, assistants and imports to Supabase.
4. Enforce paid feature access from server-side subscription state.
5. Add customer portal/cancel subscription flow.
