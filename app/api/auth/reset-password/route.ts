import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resetPasswordSchema } from "@/lib/auth/validation";
import { assertAuthRateLimit, getRequestIdentity } from "@/lib/auth/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const input = resetPasswordSchema.parse(await request.json());
    await assertAuthRateLimit("reset", getRequestIdentity(request));
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return NextResponse.json({ error: "RESET_SESSION_REQUIRED" }, { status: 401 });
    const { error } = await supabase.auth.updateUser({ password: input.password });
    if (error) return NextResponse.json({ error: "Не вдалося оновити пароль." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "RATE_LIMITED" ? 429 : 400;
    return NextResponse.json({ error: status === 429 ? "Забагато спроб. Спробуй пізніше." : "Не вдалося оновити пароль." }, { status });
  }
}