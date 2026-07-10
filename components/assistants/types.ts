export type AssistantType = "personal_twin" | "custom";
export type AutonomyLevel = "suggest_only" | "draft_replies" | "approval_required" | "trusted_auto";
export type AssistantStatus = "active" | "draft";

export interface AssistantConfig {
  id: string;
  name: string;
  type: AssistantType;
  role: string;
  description: string;
  status: AssistantStatus;
  tone: string;
  personality: string;
  responseLength: string;
  autonomyLevel: AutonomyLevel;
  memoryAccess: string[];
  learningEnabled: boolean;
  tasks: string[];
  boundaries: string[];
  dataSources: string[];
  createdAt: string;
  updatedAt: string;
}

export type AssistantsLang = "EN" | "UA";
