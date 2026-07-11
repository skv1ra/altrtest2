type PaymentEmailInput = {
  to?: string;
  planName: string;
  amount: number;
  currency: string;
  orderId: string;
};

export async function sendPaymentEmail(input: PaymentEmailInput) {
  if (!input.to) return { skipped: true, reason: "No recipient email" };

  if (!process.env.RESEND_API_KEY) {
    console.log("[Altr billing email stub]", input);
    return { skipped: true, reason: "RESEND_API_KEY is not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.BILLING_EMAIL_FROM ?? "Altr <billing@altr.ai>",
      to: input.to,
      subject: `Altr payment received — ${input.planName}`,
      html: `<div style="font-family:Arial,sans-serif;color:#0b1220"><h1>Payment received</h1><p>Your Altr subscription is being activated.</p><p><b>Plan:</b> ${input.planName}</p><p><b>Amount:</b> ${input.amount} ${input.currency}</p><p><b>Order:</b> ${input.orderId}</p></div>`,
    }),
  });

  if (!response.ok) return { skipped: false, ok: false, status: response.status };
  return { skipped: false, ok: true };
}
