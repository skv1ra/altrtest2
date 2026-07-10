import { AssistantConfig } from "@/components/assistants/types";

export const twinToneOptions = ["exact_match", "slightly_polished", "more_professional", "more_concise", "warmer"];
export const customToneOptions = ["professional", "friendly", "direct", "calm", "persuasive", "neutral"];
export const twinPersonalityOptions = ["same_as_me", "calm_me", "professional_me", "direct_me"];
export const customPersonalityOptions = ["analyst", "operator", "negotiator", "assistant", "manager", "researcher"];
export const responseOptions = ["short", "balanced", "detailed", "ask_first"];
export const autonomyOptions = ["suggest_only", "draft_replies", "approval_required", "trusted_auto"] as const;
export const twinMemoryOptions = ["communication_style", "frequent_phrases", "relationships", "typical_decisions", "work_context", "calendar_context", "email_context"];
export const customDataSources = ["email", "calendar", "imported_conversations", "work_context", "client_context"];
export const customTaskOptions = ["write_replies", "summarize_conversations", "prepare_followups", "extract_tasks", "draft_emails", "compare_options", "prepare_decisions", "track_deadlines", "create_reports"];
export const twinBoundaryOptions = ["never_send_without_approval", "never_sensitive_topics", "ask_before_promises", "ask_before_prices", "limit_emotion_imitation"];
export const customBoundaryOptions = ["ask_before_sending", "ask_before_decisions", "ask_before_money", "no_personal_messages", "no_sensitive_memory", "no_auto_contact"];

export const initialAssistants: AssistantConfig[] = [
  {
    id: "assistant_twin", name: "Altr Twin", type: "personal_twin", role: "Responds and works as your digital self.",
    description: "Learns your tone, memory, decisions and relationships to respond as your digital self.", status: "active",
    tone: "exact_match", personality: "same_as_me", responseLength: "balanced", autonomyLevel: "approval_required",
    memoryAccess: [...twinMemoryOptions], learningEnabled: true,
    tasks: ["write_replies", "draft_emails", "prepare_decisions"], boundaries: [...twinBoundaryOptions],
    dataSources: ["imported_conversations", "email", "calendar"], createdAt: "2026-07-10", updatedAt: "2026-07-10",
  },
  {
    id: "assistant_operator", name: "Operator", type: "custom", role: "Operations and structured follow-through.",
    description: "Handles repetitive operational tasks, follow-ups, summaries and structured work.", status: "draft",
    tone: "professional", personality: "operator", responseLength: "balanced", autonomyLevel: "draft_replies",
    memoryAccess: ["work_context"], learningEnabled: false,
    tasks: ["summarize_conversations", "prepare_followups", "extract_tasks", "track_deadlines", "create_reports"],
    boundaries: ["ask_before_sending", "ask_before_decisions", "no_personal_messages", "no_auto_contact"],
    dataSources: ["email", "calendar", "work_context"], createdAt: "2026-07-10", updatedAt: "2026-07-10",
  },
  {
    id: "assistant_negotiator", name: "Negotiator", type: "custom", role: "Client, supplier and pricing communication.",
    description: "Helps with client replies, supplier messages, pricing discussions and decision preparation.", status: "draft",
    tone: "persuasive", personality: "negotiator", responseLength: "detailed", autonomyLevel: "approval_required",
    memoryAccess: ["client_context", "work_context"], learningEnabled: false,
    tasks: ["write_replies", "draft_emails", "compare_options", "prepare_decisions"],
    boundaries: ["ask_before_sending", "ask_before_decisions", "ask_before_money", "no_auto_contact"],
    dataSources: ["email", "client_context", "imported_conversations"], createdAt: "2026-07-10", updatedAt: "2026-07-10",
  },
];
