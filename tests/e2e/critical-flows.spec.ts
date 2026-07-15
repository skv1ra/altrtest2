import { expect, test } from "@playwright/test";

const profile = {
  id: "0f6b257b-114a-4c79-9df2-bb5fd1a25e03",
  name: "CI User",
  email: "ci@example.com",
  role: "Founder",
  altrName: "CI Altr",
  bio: "Server profile",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  plan: "free",
  trainingProgress: 12,
  tone: "balanced",
  stats: { conversations: 2, memories: 1, drafts: 3 },
  connections: { email: false, calendar: false, messages: false, workspace: false },
  preferences: { learning: true, autoDrafts: false, weeklyDigest: false, privacyMode: true },
  consents: {
    policyVersion: "2026-07-15",
    termsAcceptedAt: "2026-01-01T00:00:00.000Z",
    conversationProcessingAcceptedAt: "2026-01-01T00:00:00.000Z",
    aiMemoryAcceptedAt: "2026-01-01T00:00:00.000Z",
  },
  subscription: null,
  invoices: [],
};

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const api = (path: string) => new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\?.*)?$`);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "altr_cookie_consent_v1",
      JSON.stringify({ choice: "necessary", analytics: false, marketing: false }),
    ),
  );
});

test("registration form validation", async ({ page }) => {
  await page.route(api("/api/me"), (route) => route.fulfill(json({ profile: null })));
  await page.goto("/auth?mode=register");
  await expect(page.getByRole("heading", { name: "Створи свій Altr" })).toBeVisible();
  await page.getByRole("button", { name: "Створити другого себе" }).click();
  await expect(page.getByRole("alert")).toContainText("імʼя");
  await page.getByLabel("Імʼя").fill("CI");
  await page.getByLabel("Email").fill("bad-email");
  await page.locator('input[type="password"]').fill("short");
  await page.getByRole("button", { name: "Створити другого себе" }).click();
  await expect(page.getByRole("alert")).toContainText("email");
});

test("login form validation", async ({ page }) => {
  await page.route(api("/api/me"), (route) => route.fulfill(json({ profile: null })));
  await page.goto("/auth?mode=login");
  await expect(page.getByRole("heading", { name: "Повернись до свого Altr" })).toBeVisible();
  await page.getByLabel("Email").fill("wrong");
  await page.locator('input[type="password"]').fill("123");
  await page.getByRole("button", { name: "Увійти в акаунт" }).click();
  await expect(page.getByRole("alert")).toContainText("email");
});

test("protected route redirects anonymous users", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    extraHTTPHeaders: {
      "x-altr-e2e-user": "anonymous",
      "x-altr-e2e-email": "anonymous@example.com",
    },
  });
  const page = await context.newPage();
  await page.goto(`${baseURL}/dashboard`);
  await expect(page).toHaveURL(/\/auth\?mode=login&next=%2Fdashboard/);
  await context.close();
});

test("pricing without account redirects to registration", async ({ page }) => {
  await page.route(api("/api/billing/me"), (route) => route.fulfill(json({ error: "AUTH_REQUIRED" }, 401)));
  await page.route(api("/api/billing/plans"), (route) => route.fulfill(json({ plans: [] })));
  await page.route(api("/api/billing/checkout"), (route) => route.fulfill(json({ error: "AUTH_REQUIRED" }, 401)));
  await page.goto("/pricing");
  await page.getByRole("button", { name: "Continue to checkout" }).first().click();
  await expect(page).toHaveURL(/\/auth\?next=%2Fpricing/);
});

test("checkout creation is mocked and sends only plan ID", async ({ page }) => {
  await page.route(api("/api/billing/me"), (route) => route.fulfill(json({ effectivePlan: "free", invoices: [] })));
  await page.route(api("/api/billing/plans"), (route) => route.fulfill(json({ plans: [] })));
  await page.route(api("/api/billing/checkout"), async (route) => {
    expect(route.request().postDataJSON()).toEqual({ planId: "personal" });
    await route.fulfill(json({ checkoutUrl: "http://127.0.0.1:3000/payment/success?mock=1" }));
  });
  await page.goto("/pricing");
  await page.getByRole("button", { name: "Continue to checkout" }).first().click();
  await expect(page).toHaveURL(/\/payment\/success\?mock=1/);
});

test("payment success page never upgrades the plan", async ({ page }) => {
  await page.route(api("/api/billing/me"), (route) =>
    route.fulfill(json({ effectivePlan: "free", hasPremium: false, subscription: null })),
  );
  await page.goto("/payment/success");
  await expect(page.getByRole("heading", { name: "Payment is being confirmed" })).toBeVisible();
  await expect(page.getByText("This page cannot activate a plan")).toBeVisible();
});

test("authenticated dashboard loads server data", async ({ page }) => {
  await page.route(api("/api/me"), (route) => route.fulfill(json({ profile })));
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Привіт, CI." })).toBeVisible();
  await expect(page.getByText("Server profile")).toBeVisible();
});

test("memory CRUD uses mocked server state", async ({ page }) => {
  let title = "Original memory";
  let deleted = false;
  await page.route(api("/api/memories"), (route) =>
    route.fulfill(
      json({
        memories: deleted
          ? []
          : [
              {
                id: "11111111-1111-4111-8111-111111111111",
                category: "fact",
                title,
                description: "Owned by CI",
                confidence: 1,
                source_type: "manual",
                source_reference: "manual:user",
                is_active: true,
                created_at: "2026-01-01",
                updated_at: "2026-01-01",
                extraction_model: null,
                extraction_version: "manual-v1",
                altr_memory_sources: [],
              },
            ],
        totalPages: 1,
      }),
    ),
  );
  await page.route(api("/api/memories/11111111-1111-4111-8111-111111111111"), async (route) => {
    if (route.request().method() === "PATCH") {
      title = route.request().postDataJSON().title;
      return route.fulfill(json({ memory: { title } }));
    }
    deleted = true;
    return route.fulfill(json({ ok: true }));
  });
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/memory");
  await expect(page.getByText("Original memory")).toBeVisible();
  await page.getByRole("button", { name: /Edit/ }).click();
  await page.locator("form input").first().fill("Updated memory");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Updated memory")).toBeVisible();
  await page.locator("button.danger-button").nth(1).click();
  await expect(page.getByText("No memories match this view.")).toBeVisible();
});

test("imports a small local fixture with mocked persistence", async ({ page }) => {
  const limits = {
    importsPerMonth: 1,
    maxFileBytes: 5_242_880,
    maxMessagesPerImport: 2000,
    maxConversationsPerImport: 100,
    maxActiveMemories: 250,
    aiDraftsPerMonth: 10,
    concurrentImports: 1,
    concurrentMemoryJobs: 1,
  };
  await page.route(api("/api/imports"), async (route) =>
    route.request().method() === "GET"
      ? route.fulfill(json({ imports: [], planId: "free", limits }))
      : route.fulfill(json({ import: { id: "22222222-2222-4222-8222-222222222222" }, planId: "free" }, 201)),
  );
  await page.route(api("/api/imports/22222222-2222-4222-8222-222222222222/chunks"), (route) =>
    route.fulfill(json({ ok: true })),
  );
  await page.route(api("/api/imports/22222222-2222-4222-8222-222222222222/extract"), (route) =>
    route.fulfill(json({ done: true })),
  );
  await page.goto("/import-conversations");
  await expect(page.getByText(/free plan:/)).toBeVisible();
  await page.getByRole("checkbox").check();
  await page.locator('input[type="file"]').setInputFiles("tests/fixtures/imports/telegram.json");
  await expect(page.getByText("Import and memory extraction complete", { exact: false })).toBeVisible({ timeout: 20_000 });
});

test("draft generation uses mocked OpenAI boundary", async ({ page }) => {
  await page.route(api("/api/assistants"), (route) =>
    route.fulfill(
      json({
        assistants: [
          {
            id: "33333333-3333-4333-8333-333333333333",
            name: "CI Twin",
            assistant_type: "digital_twin",
            system_instructions: "",
            tone: "balanced",
            is_active: true,
            config: {},
          },
        ],
      }),
    ),
  );
  await page.route(api("/api/ai/provider-status"), (route) => route.fulfill(json({ configured: true })));
  await page.route(api("/api/ai/draft-reply"), async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      incomingMessage: "Please send the update",
      requestedLength: "medium",
      language: "auto",
    });
    await route.fulfill(
      json({
        draft: "Mocked safe draft",
        assistantRunId: "run-1",
        model: "mock-openai",
        quota: { used: 1, limit: 10 },
      }),
    );
  });
  await page.goto("/assistants");
  await expect(page.getByDisplayValue("CI Twin")).toBeVisible();
  await page.getByPlaceholder("Incoming message").fill("Please send the update");
  await page.getByRole("button", { name: "Generate" }).click();
  await expect(page.locator("textarea").last()).toHaveValue("Mocked safe draft");
});

test("sign out calls the server and returns home", async ({ page }) => {
  await page.route(api("/api/me"), (route) => route.fulfill(json({ profile })));
  await page.route(api("/api/auth/logout"), async (route) => {
    expect(route.request().method()).toBe("POST");
    await route.fulfill(json({ ok: true }));
  });
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Привіт, CI." })).toBeVisible();
  await page.getByRole("button", { name: "Вийти" }).first().click();
  await expect(page).toHaveURL(/\/$/);
});
