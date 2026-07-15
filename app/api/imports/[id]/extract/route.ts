import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { processMemoryExtractionBatch } from "@/lib/ai/memory-extraction";
import { isOpenAIConfigured } from "@/lib/ai/openai";
import { requireUser } from "@/lib/supabase/server";

const idSchema = z.string().uuid();

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    if (!isOpenAIConfigured()) {
      return NextResponse.json({ error: "AI_PROVIDER_NOT_CONFIGURED" }, { status: 503 });
    }
    const importId = idSchema.parse(params.id);
    const result = await processMemoryExtractionBatch(user.id, importId);
    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof z.ZodError
      ? 400
      : error instanceof Error && error.message === "AUTH_REQUIRED"
        ? 401
        : error instanceof Error && ["MEMORY_LIMIT_REACHED", "MEMORY_PROCESSING_CONCURRENCY_LIMIT"].includes(error.message)
          ? 429
          : 500;
    return NextResponse.json({
      error: error instanceof z.ZodError ? "INVALID_IMPORT_ID" : error instanceof Error ? error.message : "MEMORY_EXTRACTION_FAILED",
    }, { status });
  }
}
