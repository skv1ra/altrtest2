import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function createNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

function buildContentSecurityPolicy(nonce: string) {
  const isProduction = process.env.NODE_ENV === "production";
  // Keep self-hosted Next.js chunks executable on statically rendered pages.
  // `strict-dynamic` would make browsers ignore `self` when those chunks do not carry a runtime nonce.
  const scriptSrc = ["'self'", `'nonce-${nonce}'`, ...(!isProduction ? ["'unsafe-eval'"] : [])];
  const connectSrc = [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://api.lemonsqueezy.com",
    "https://www.gstatic.com",
    ...(!isProduction ? ["http://localhost:*", "ws://localhost:*"] : []),
  ];

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-src https://*.lemonsqueezy.com",
    "form-action 'self' https://*.lemonsqueezy.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  const nonce = createNonce();
  const requestId = request.headers.get("x-request-id")?.slice(0, 128) || crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-request-id", requestId);

  const response = await updateSession(request, requestHeaders);
  response.headers.set("Content-Security-Policy", buildContentSecurityPolicy(nonce));
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("x-request-id", requestId);
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
