import "server-only";
import { randomUUID } from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const sensitiveKeyPattern = /(authorization|cookie|password|secret|token|api[_-]?key|source[_-]?text|incoming[_-]?message|content|conversation|memory|raw[_-]?payload)/i;
function redact(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[TRUNCATED]";
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => redact(item, depth + 1));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, sensitiveKeyPattern.test(key) ? "[REDACTED]" : redact(item, depth + 1)]));
  if (typeof value === "string" && value.length > 500) return `${value.slice(0, 500)}...[TRUNCATED]`;
  return value;
}
export function getRequestId(request: NextRequest) { const existing = request.headers.get("x-request-id")?.trim(); return existing && existing.length <= 128 ? existing : randomUUID(); }
export function structuredLog(level: "info" | "warn" | "error", event: string, context: Record<string, unknown> = {}) {
  const safeContext = redact(context);
  const payload = JSON.stringify({ timestamp: new Date().toISOString(), level, event, ...(safeContext && typeof safeContext === "object" && !Array.isArray(safeContext) ? safeContext : {}) });
  if (level === "error") console.error(payload); else if (level === "warn") console.warn(payload); else console.info(payload);
}
export function safeErrorResponse(request: NextRequest, error: unknown, options: { code: string; status?: number; publicMessage?: string }) {
  const requestId = getRequestId(request);
  structuredLog("error", "api.request_failed", { requestId, method: request.method, path: request.nextUrl.pathname, errorName: error instanceof Error ? error.name : "UnknownError", errorCode: error instanceof Error ? error.message : "UNKNOWN_ERROR" });
  return NextResponse.json({ error: options.publicMessage ?? options.code, code: options.code, requestId }, { status: options.status ?? 500, headers: { "x-request-id": requestId } });
}
export function requestLogContext(request: NextRequest, extra: Record<string, unknown> = {}) { return { requestId: getRequestId(request), method: request.method, path: request.nextUrl.pathname, userAgent: request.headers.get("user-agent"), ...extra }; }
