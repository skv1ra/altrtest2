import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { forgotPasswordSchema } from "@/lib/auth/validation";
import { assertAuthRateLimit, getRequestIdentity } from "@/lib/auth/rate-limit";

const MESSAGE = "Якщо акаунт існує, ми надіслали інструкції на email.";

export async function POST(request: NextRequest) {
  try {
    const input = forgotPasswordSchema.parse(await request.json());
    await assertAuthRateLimit("forgot", getRequestIdentity(request, input.email));
    const supabase = createSupabaseServerClient();
    await supabase.auth.resetPasswordForEmail(input.email, {
      redirectTo: `${new URL(request.url).origin}/auth/callback?next=/auth/reset-password`,
    });
    return NextResponse.json({ ok: true, message: MESSAGE });
  } catch (error) {
    const status = error instanceof Error && error.message === "RATE_LIMITED" ? 429 : 200;
    return NextResponse.json({ ok: status === 200, message: status === 429 ? "Забагато спроб. Спробуй пізніше." : MESSAGE }, { status });
  }
}