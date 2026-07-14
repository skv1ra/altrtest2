import { expect, test } from "@playwright/test";

const profile = {
  id: "0f6b257b-114a-4c79-9df2-bb5fd1a25e03",
  name: "CI User",
  email: "ci@example.com",
  role: "Founder",
  altrName: "CI Altr",
  bio: "CI profile",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  plan: "free",
  trainingProgress: 12,
  tone: "balanced",
  stats: { conversations: 0, memories: 0, drafts: 0 },
  connections: { email: false, calendar: false, messages: false, workspace: false },
  preferences: { learning: true, autoDrafts: false, weeklyDigest: false, privacyMode: true },
  consents: {
    policyVersion: "2026-07-13",
    termsAcceptedAt: "2026-01-01T00:00:00.000Z",
    conversationProcessingAcceptedAt: "2026-01-01T00:00:00.000Z",
    aiMemoryAcceptedAt: "2026-01-01T00:00:00.000Z",
  },
  subscription: null,
  invoices: [],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "altr_cookie_consent_v1",
      JSON.stringify({ choice: "necessary", analytics: false, marketing: false }),
    );
  });
});

test("public landing page renders", async ({ page }) => {
  await page.route("**/api/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ profile: null }) });
  });

  await page.goto("/");
  await expect(page).toHaveTitle(/Altr/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("public version endpoint exposes only minimal deployment metadata", async ({ request }) => {
  const response = await request.get("/api/version");
  expect(response.ok()).toBe(true);

  const payload = await response.json();
  expect(payload).toMatchObject({ appVersion: "1.0.0" });
  expect(Object.keys(payload).sort()).toEqual(["appVersion", "buildTime", "commitSha", "environment"].sort());
  expect(JSON.stringify(payload)).not.toMatch(/service_role|api_key|secret/i);
});

test("an existing session leaves the auth screen for the dashboard", async ({ page }) => {
  await page.route("**/api/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ profile }) });
  });

  await page.goto("/auth?mode=login");
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("pricing checkout uses the server endpoint without a real payment provider", async ({ page }) => {
  await page.route("**/api/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ profile }) });
  });
  await page.route("**/api/billing/checkout", async (route) => {
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toEqual({ planId: "personal" });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ checkoutUrl: "http://127.0.0.1:3000/billing/return?mock=1" }),
    });
  });

  await page.goto("/pricing");
  await expect(page.getByRole("button", { name: "Поточний план" })).toBeVisible();
  await page.getByRole("button", { name: "Оплатити $20" }).click();
  await expect(page).toHaveURL(/\/billing\/return\?mock=1$/);
});
