// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseImport } from "@/lib/imports/parsers";
import { inspectZip } from "@/lib/imports/zip";
import type { ImportPlatform } from "@/lib/imports/types";
const fixture = (name: string) => new Uint8Array(readFileSync(resolve(process.cwd(), "tests/fixtures/imports", name)));

describe("all supported import platforms", () => {
  it.each([
    ["generic.json", "manual"], ["telegram.json", "telegram"], ["gmail.mbox", "gmail"], ["whatsapp.txt", "whatsapp"],
    ["instagram.json", "instagram"], ["messenger.json", "messenger"], ["slack.json", "slack"], ["discord.json", "discord"],
  ] as const)("parses %s as %s", async (name, platform) => {
    const result = await parseImport({ name, platform: platform as ImportPlatform, mimeType: "application/octet-stream", bytes: fixture(name) });
    expect(result.conversations.length).toBeGreaterThan(0);
    expect(result.conversations[0]?.messages.length).toBeGreaterThan(0);
  });
  it("rejects a malformed archive without an end-of-central-directory record", () => {
    expect(() => inspectZip(new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3]))).toThrow("ZIP_EOCD_NOT_FOUND");
  });
  it("rejects a ZIP-shaped but truncated central directory", () => {
    const bytes = new Uint8Array(22); const view = new DataView(bytes.buffer); view.setUint32(0, 0x06054b50, true); view.setUint16(10, 1, true);
    expect(() => inspectZip(bytes)).toThrow(/ZIP_CENTRAL_DIRECTORY_INVALID|ZIP_ENTRY_COUNT_MISMATCH/);
  });
});
