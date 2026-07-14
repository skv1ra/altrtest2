import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { loginSchema } from "@/lib/auth/validation";
import { assertAuthRateLimit, getRequestIdentity } from "@/lib/auth/rate-limit";

const GENERIC_ERROR = "Не вдалося увійти. Перевір дані й спробуй ще раз.";

export async function POST(request: NextRequest) {
  try {
    const input = loginSchema.parse(await request.json());
    const identity = getRequestIdentity(request, input.email);
    await assertAuthRateLimit("login", identity);

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password });
    if (error || !data.user) return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });

    await createSupabaseAdminClient().from("altr_audit_logs").insert({
      user_id: data.user.id,
      event_type: "auth.login",
      metadata: { provider: "password" },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "RATE_LIMITED" ? 429 : 400;
    return NextResponse.json({ error: status === 429 ? "Забагато спроб. Спробуй пізніше." : GENERIC_ERROR }, { status });
  }
}