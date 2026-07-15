// @vitest-environment node

import { describe, expect, it } from "vitest";
import { getPublicVersionInfo } from "@/lib/version";

describe("public version metadata", () => {
  it("returns only the approved non-sensitive fields", () => {
    const result = getPublicVersionInfo({
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_SHA: "abc123",
      APP_BUILD_TIME: "2026-07-13T18:00:00Z",
      SUPABASE_SERVICE_ROLE_KEY: "must-never-be-returned",
      LEMONSQUEEZY_API_KEY: "must-never-be-returned",
    });

    expect(result).toEqual({
      appVersion: "1.0.0",
      commitSha: "abc123",
      buildTime: "2026-07-13T18:00:00Z",
      environment: "preview",
    });
    expect(JSON.stringify(result)).not.toContain("must-never-be-returned");
  });

  it("uses safe fallbacks when deployment metadata is absent", () => {
    expect(getPublicVersionInfo({ NODE_ENV: "test" })).toEqual({
      appVersion: "1.0.0",
      commitSha: null,
      buildTime: null,
      environment: "test",
    });
  });
});
