import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAuthRateLimit, getRequestIdentity } from "@/lib/auth/rate-limit";
import { getUserEntitlement, requirePlan } from "@/lib/billing/entitlements";
import { IMPORT_LIMITS } from "@/lib/imports/limits";
import { requireUser, createSupabaseAdminClient } from "@/lib/supabase/server";

const idSchema = z.string().uuid();
const messageSchema = z.object({
  externalId: z.string().max(200).optional(),
  senderType: z.enum(["user", "contact", "assistant", "system"]),
  senderLabel: z.string().max(IMPORT_LIMITS.senderLabelLength).optional(),
  content: z.string().min(1).max(IMPORT_LIMITS.messageLength),
  sentAt: z.string().datetime(),
  metadata: z.record(z.unknown()).optional(),
}).strict();
const conversationSchema = z.object({
  externalId: z.string().max(200).optional(),
  title: z.string().max(IMPORT_LIMITS.titleLength).optional(),
  participantSummary: z.array(z.string().max(IMPORT_LIMITS.senderLabelLength)).max(30).default([]),
  startedAt: z.string().datetime().optional(),
  lastMessageAt: z.string().datetime().optional(),
  messages: z.array(messageSchema).min(1).max(500),
}).strict();
const chunkSchema = z.object({
  chunkIndex: z.number().int().min(0).max(9999),
  final: z.boolean().default(false),
  conversations: z.array(conversationSchema).min(1).max(20),
}).strict();

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    await requirePlan(user.id, "personal");
    await assertAuthRateLimit("import_chunk", getRequestIdentity(request, user.id));
    const importId = idSchema.parse(params.id);
    const input = chunkSchema.parse(await request.json());
    const admin = createSupabaseAdminClient();
    const { data: record } = await admin
      .from("altr_conversation_imports")
      .select("id,platform,status")
      .eq("id", importId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!record || record.status !== "processing") return NextResponse.json({ error: "IMPORT_NOT_PROCESSING" }, { status: 409 });

    const { data: priorChunkRows, error: priorChunkError } = await admin
      .from("altr_conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("import_id", importId)
      .contains("metadata", { parser_chunk: input.chunkIndex });
    if (priorChunkError) throw priorChunkError;
    if (priorChunkRows?.length) {
      const { error: deleteError } = await admin
        .from("altr_conversations")
        .delete()
        .in("id", priorChunkRows.map((row) => row.id))
        .eq("user_id", user.id);
      if (deleteError) throw deleteError;
    }

    const entitlement = await getUserEntitlement(user.id);
    const maxMessages = entitlement.planId === "work" ? IMPORT_LIMITS.messages : 20_000;
    const incomingMessages = input.conversations.reduce((sum, conversation) => sum + conversation.messages.length, 0);
    const existing = await admin
      .from("altr_messages")
      .select("id,altr_conversations!inner(import_id)", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("altr_conversations.import_id", importId);
    if ((existing.count ?? 0) + incomingMessages > maxMessages) {
      return NextResponse.json({ error: "MESSAGE_LIMIT_REACHED" }, { status: 403 });
    }

    const existingConversations = await admin
      .from("altr_conversations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("import_id", importId);
    if ((existingConversations.count ?? 0) + input.conversations.length > IMPORT_LIMITS.conversations) {
      return NextResponse.json({ error: "CONVERSATION_LIMIT_REACHED" }, { status: 403 });
    }

    for (const conversation of input.conversations) {
      const { data: conv, error: convError } = await admin.from("altr_conversations").insert({
        user_id: user.id,
        import_id: importId,
        external_conversation_id: conversation.externalId,
        platform: record.platform,
        title: conversation.title,
        participant_summary: conversation.participantSummary,
        started_at: conversation.startedAt,
        last_message_at: conversation.lastMessageAt,
        metadata: { parser_chunk: input.chunkIndex },
      }).select("id").single();
      if (convError) throw convError;
      const rows = conversation.messages.map((message) => ({
        user_id: user.id,
        conversation_id: conv.id,
        external_message_id: message.externalId,
        sender_type: message.senderType,
        sender_label: message.senderLabel,
        content: message.content,
        sent_at: message.sentAt,
        metadata: message.metadata ?? {},
      }));
      const { error: messageError } = await admin.from("altr_messages").insert(rows);
      if (messageError) throw messageError;
    }

    if (input.final) {
      const [convCount, messageCount] = await Promise.all([
        admin.from("altr_conversations").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("import_id", importId),
        admin.from("altr_messages").select("id,altr_conversations!inner(import_id)", { count: "exact", head: true }).eq("user_id", user.id).eq("altr_conversations.import_id", importId),
      ]);
      const { error: updateError } = await admin.from("altr_conversation_imports").update({
        status: "completed",
        conversations: convCount.count ?? 0,
        messages: messageCount.count ?? 0,
        normalized_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        error: null,
      }).eq("id", importId).eq("user_id", user.id);
      if (updateError) throw updateError;
    }
    return NextResponse.json({ ok: true, acceptedMessages: incomingMessages, final: input.final });
  } catch (error) {
    const status = error instanceof z.ZodError
      ? 400
      : error instanceof Error && error.message === "PLAN_REQUIRED"
        ? 403
        : error instanceof Error && error.message === "RATE_LIMITED"
          ? 429
          : 500;
    return NextResponse.json({
      error: error instanceof z.ZodError ? "INVALID_IMPORT_CHUNK" : error instanceof Error ? error.message : "IMPORT_CHUNK_FAILED",
    }, { status });
  }
}
