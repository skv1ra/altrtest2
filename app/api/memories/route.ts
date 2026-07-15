import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAuthRateLimit, getRequestIdentity } from "@/lib/auth/rate-limit";
import { requireUser, createSupabaseAdminClient } from "@/lib/supabase/server";

const createSchema = z.object({ category: z.string().trim().min(1).max(80), title: z.string().trim().min(1).max(180), description: z.string().trim().min(1).max(4000), confidence: z.number().min(0).max(1).default(1), active: z.boolean().default(true) }).strict();

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(); const url = new URL(request.url); const q = (url.searchParams.get("q") ?? "").trim().slice(0, 120); const category = (url.searchParams.get("category") ?? "").trim().slice(0, 80); const page = Math.max(1, Number(url.searchParams.get("page") ?? 1)); const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 12))); const from = (page - 1) * pageSize;
    let query = createSupabaseAdminClient().from("altr_memories").select("id,category,title,description,confidence,source_type,source_reference,is_active,created_at,updated_at,extraction_model,extraction_version,altr_memory_sources(id,source_type,source_reference,excerpt,import_id,conversation_id,message_id,assistant_run_id,created_at)", { count: "exact" }).eq("user_id", user.id).order("updated_at", { ascending: false }).range(from, from + pageSize - 1);
    if (category) query = query.eq("category", category); if (q) query = query.or(`title.ilike.%${q.replace(/[%_,]/g, "")}%,description.ilike.%${q.replace(/[%_,]/g, "")}%`);
    const { data, error, count } = await query; if (error) throw error; return NextResponse.json({ memories: data ?? [], page, pageSize, total: count ?? 0, totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "MEMORY_LIST_FAILED" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try { const user = await requireUser(); await assertAuthRateLimit("memory_write", getRequestIdentity(request, user.id)); const input = createSchema.parse(await request.json()); const admin = createSupabaseAdminClient(); const { data, error } = await admin.from("altr_memories").insert({ user_id: user.id, category: input.category, title: input.title, description: input.description, confidence: input.confidence, source_type: "manual", source_reference: "manual:user", is_active: input.active, extraction_version: "manual-v1" }).select("id,category,title,description,confidence,source_type,source_reference,is_active,created_at,updated_at").single(); if (error) throw error; await admin.from("altr_memory_sources").insert({ user_id: user.id, memory_id: data.id, source_type: "manual", source_reference: "manual:user" }); return NextResponse.json({ memory: data }, { status: 201 }); } catch (error) { const status = error instanceof z.ZodError ? 400 : error instanceof Error && error.message === "RATE_LIMITED" ? 429 : 500; return NextResponse.json({ error: error instanceof z.ZodError ? "INVALID_MEMORY" : error instanceof Error ? error.message : "MEMORY_CREATE_FAILED" }, { status }); }
}

export async function DELETE() { try { const user = await requireUser(); const admin = createSupabaseAdminClient(); const { error } = await admin.from("altr_memories").delete().eq("user_id", user.id); if (error) throw error; await admin.from("altr_audit_events").insert({ user_id: user.id, actor_type: "user", event_type: "memory.cleared", entity_type: "memory", metadata: {} }); return NextResponse.json({ ok: true }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "MEMORY_CLEAR_FAILED" }, { status: 500 }); } }
