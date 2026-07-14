import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedPages = [
  "/dashboard",
  "/memory",
  "/assistants",
  "/import-conversations",
  "/billing",
  "/payment/success",
  "/legacy-migration",
];

const publicApiPrefixes = ["/api/auth/", "/api/webhooks/", "/api/version", "/api/health"];

function isProtected(pathname: string) {
  if (protectedPages.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return true;
  return pathname.startsWith("/api/") && !publicApiPrefixes.some((path) => pathname.startsWith(path));
}

export function safeRedirectPath(value: string | null, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (!data.user && isProtected(pathname)) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth";
    loginUrl.search = "";
    loginUrl.searchParams.set("mode", "login");
    loginUrl.searchParams.set("next", safeRedirectPath(`${pathname}${request.nextUrl.search}`));
    return NextResponse.redirect(loginUrl);
  }

  const migrationPending = request.cookies.get("altr_legacy_review")?.value === "pending";
  if (data.user && migrationPending && isProtected(pathname) && pathname !== "/legacy-migration") {
    return NextResponse.redirect(new URL("/legacy-migration", request.url));
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
