import { NextResponse } from "next/server";
import { isOpenAIConfigured, OPENAI_EMBEDDING_MODEL, OPENAI_RESPONSE_MODEL } from "@/lib/ai/openai";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    await requireUser();
    return NextResponse.json({
      configured: isOpenAIConfigured(),
      responseModel: OPENAI_RESPONSE_MODEL,
      embeddingModel: OPENAI_EMBEDDING_MODEL,
    });
  } catch {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }
}
