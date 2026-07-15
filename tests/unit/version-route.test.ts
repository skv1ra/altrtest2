// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/version/route";

describe("GET /api/version", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns minimal metadata and disables caching", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "abcdef1234567890");
    vi.stubEnv("APP_BUILD_TIME", "2026-07-13T18:00:00.000Z");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "server-secret");

    const response = GET();
    const body = await response.json();

    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(body).toEqual({
      appVersion: "1.0.0",
      commitSha: "abcdef1234567890",
      buildTime: "2026-07-13T18:00:00.000Z",
      environment: "preview",
    });
    expect(JSON.stringify(body)).not.toContain("server-secret");
  });
});
