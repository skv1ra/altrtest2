import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient, requireUser } from "@/lib/supabase/server";

const idSchema = z.string().uuid();
const schema = z.object({
  outcome: z.enum(["accepted", "rejected", "edited", "copied", "rated"]),
  finalDraft: z.string().max(12_000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  feedback: z.string().trim().max(2_000).optional(),
  consentToPersonalization: z.boolean().default(false),
}).strict();

function editDistance(a: string, b: string) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const old = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = old;
    }
  }
  return previous[b.length];
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const runId = idSchema.parse(params.id);
    const input = schema.parse(await request.json());
    const admin = createSupabaseAdminClient();

    const { data: run, error: runError } = await admin
      .from("altr_assistant_runs")
      .select("id,output_text")
      .eq("id", runId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (runError) throw runError;
    if (!run?.output_text) return NextResponse.json({ error: "DRAFT_NOT_FOUND" }, { status: 404 });

    const finalDraft = input.consentToPersonalization ? input.finalDraft?.trim() || null : null;
    const distance = finalDraft ? editDistance(run.output_text, finalDraft) : null;
    const { data, error } = await admin.from("altr_draft_feedback").upsert({
      user_id: user.id,
      assistant_run_id: run.id,
      outcome: input.outcome,
      original_draft: run.output_text,
      final_draft: finalDraft,
      rating: input.rating ?? null,
      feedback: input.feedback ?? null,
      edit_distance: distance,
      consent_to_personalization: input.consentToPersonalization,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,assistant_run_id,outcome" }).select("id,outcome,rating,edit_distance,created_at").single();
    if (error) throw error;

    return NextResponse.json({ feedback: data });
  } catch (error) {
    const status = error instanceof z.ZodError ? 400 : error instanceof Error && error.message === "AUTH_REQUIRED" ? 401 : 500;
    return NextResponse.json({
      error: error instanceof z.ZodError ? "INVALID_DRAFT_FEEDBACK" : error instanceof Error ? error.message : "DRAFT_FEEDBACK_FAILED",
    }, { status });
  }
}
