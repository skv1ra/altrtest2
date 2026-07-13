import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("LiqPay routes are removed", () => {
  assert.equal(existsSync(new URL("../app/api/payments/liqpay/create/route.ts", import.meta.url)), false);
  assert.equal(existsSync(new URL("../app/api/payments/liqpay/callback/route.ts", import.meta.url)), false);
});

test("success and return pages do not activate paid plans", () => {
  const success = read("app/payment/success/page.tsx");
  const returns = read("app/billing/return/page.tsx");
  assert.equal(success.includes("activatePaidSubscription"), false);
  assert.equal(returns.includes("activatePaidSubscription"), false);
  assert.match(success, /webhook/i);
});

test("auth helper forbids client-side paid activation", () => {
  const auth = read("lib/auth.ts");
  assert.match(auth, /PAID_PLANS_CAN_ONLY_BE_ACTIVATED_BY_VERIFIED_LEMON_SQUEEZY_WEBHOOKS/);
  assert.equal(auth.includes("localStorage.setItem"), false);
  assert.equal(auth.includes("altr_session_v1"), false);
});

test("Lemon webhook verifies signature before mutating subscriptions", () => {
  const route = read("app/api/billing/webhook/lemon-squeezy/route.ts");
  const verifyIndex = route.indexOf("verifyWebhookSignature");
  const upsertIndex = route.indexOf("altr_subscriptions");
  assert.ok(verifyIndex >= 0);
  assert.ok(upsertIndex > verifyIndex);
});

test("draft route treats imported content as untrusted and draft-only", () => {
  const route = read("app/api/ai/draft-reply/route.ts");
  assert.match(route, /untrusted data/);
  assert.match(route, /draft replies/i);
  assert.equal(route.includes("sendEmail"), false);
});
