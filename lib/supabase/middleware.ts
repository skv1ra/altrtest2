import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getE2EIdentity } from "@/lib/testing/e2e-auth";

const protectedPages = ["/dashboard", "/memory", "/assistants", "/import-conversations", "/billing", "/payment/success", "/legacy-migration"];
const publicApiPrefixes = ["/api/auth/", "/api/webhooks/", "/api/version