// @vitest-environment node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { IMPORT_LIMITS } from "@/lib/imports/limits";
import { assertSafeObjectGraph, parseImport } from "@/lib/imports/parsers";
import { htmlToPlainText, neutralizeCsvFormula } from "@/lib/imports/sanitize";
import { inspectZip } from "@/lib/imports/zip";
import type { ImportPlatform } from "@/lib/imports/types";

const fixture = (name: string) => new Uint8Array(readFileSync(resolve(process.cwd(), "tests/fixtures/imports", name)));

async function parseFixture(name: string, platform: ImportPlatform, mimeType = "application/octet-stream") {
  return parseImport({ name, platform, mimeType, bytes: fixture(name) });
}

describe("hardened import parsers", () => {
  it.each([
    ["generic.json", "manual", "Generic"],
    ["telegram.json", "telegram", "Telegram Chat"],
    ["whatsapp.txt", "whatsapp", "WhatsApp conversation"],
    ["gmail.mbox", "gmail", "Gmail Takeout"],
    ["instagram.json", "instagram", "Instagram chat"],
    ["messenger.json", "messenger", "Messenger chat"],
    ["sample.html", "manual", "HTML import"],
    ["sample.csv", "manual", "CSV import"],
  ] as const)("parses %s", async (name, platform, expectedTitle) => {
    const result = await parseFixture(name, platform);
    expect(result.conversations[0]?.title).toBe(expectedTitle);
    expect(result.conversations[0]?.messages.length).toBeGreaterThan(0);
    expect(result.preview[0]?.text.length).toBeLessThanOrEqual(IMPORT_LIMITS.previewLength);
  });

  it("strips scripts, styles and all HTML tags", () => {
    const text = htmlToPlainText(new TextDecoder().decode(fixture("sample.html")));
    expect(text).toContain("Visible message");
    expect(text).not.toMatch(/alert|display:none|iframe|<p>/i);
  });

  it("neutralizes spreadsheet formulas", () => {
    expect(neutralizeCsvFormula("=2+2")).toBe("'=2+2");
    expect(neutralizeCsvFormula(" @SUM(A1:A2)")).toBe("' @SUM(A1:A2)");
    expect(neutralizeCsvFormula("plain")).toBe("plain");
  });

  it("rejects deeply nested JSON before JSON.parse", async () => {
    const text = "[".repeat(IMPORT_LIMITS.jsonDepth + 1) + "0" + "]".repeat(IMPORT_LIMITS.jsonDepth + 1);
    await expect(parseImport({ name: "deep.json", mimeType: "application/json", platform: "manual", bytes: new TextEncoder().encode(text) })).rejects.toThrow("JSON_TOO_DEEP");
  });

  it("rejects recursive object cycles", () => {
    const value: Record<string, unknown> = {};
    value.self = value;
    expect(() => assertSafeObjectGraph(value)).toThrow("OBJECT_CYCLE");
  });

  it("supports cancellation through AbortController", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(parseImport({ name: "generic.json", mimeType: "application/json", platform: "manual", bytes: fixture("generic.json") }, controller.signal)).rejects.toMatchObject({ name: "AbortError" });
  });

  it("parses supported files inside a checked ZIP", async () => {
    const zip = new JSZip();
    zip.file("exports/telegram.json", fixture("telegram.json"));
    const bytes = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
    const result = await parseImport({ name: "takeout.zip", mimeType: "application/zip", platform: "telegram", bytes });
    expect(result.detectedFormat).toContain("zip:telegram-json");
    expect(result.conversations[0]?.messages[0]?.content).toBe("Telegram hello");
  });

  it("rejects path traversal names inside ZIP archives", async () => {
    const zip = new JSZip();
    zip.file("../escape.txt", "bad");
    const bytes = await zip.generateAsync({ type: "uint8array" });
    expect(() => inspectZip(bytes)).toThrow("ZIP_PATH_TRAVERSAL");
  });

  it("rejects archives with too many entries", async () => {
    const zip = new JSZip();
    for (let index = 0; index <= IMPORT_LIMITS.zipEntries; index += 1) zip.file(`entry-${index}.txt`, "x");
    const bytes = await zip.generateAsync({ type: "uint8array" });
    expect(() => inspectZip(bytes)).toThrow("ZIP_TOO_MANY_ENTRIES");
  });

  it("rejects suspicious compression ratios", async () => {
    const zip = new JSZip();
    zip.file("huge.txt", "A".repeat(2_000_000));
    const bytes = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 9 } });
    expect(() => inspectZip(bytes)).toThrow("ZIP_SUSPICIOUS_RATIO");
  });

  it("rejects overlong lines", async () => {
    const bytes = new TextEncoder().encode("A".repeat(IMPORT_LIMITS.lineLength + 1));
    await expect(parseImport({ name: "long.txt", mimeType: "text/plain", platform: "manual", bytes })).rejects.toThrow("LINE_TOO_LONG");
  });

  it("rejects unsupported binary files", async () => {
    await expect(parseImport({ name: "binary.txt", mimeType: "text/plain", platform: "manual", bytes: new Uint8Array([0, 1, 2, 3]) })).rejects.toThrow("UNSUPPORTED_BINARY_FILE");
  });
});
