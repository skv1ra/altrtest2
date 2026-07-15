export type ImportPlatform =
  | "manual"
  | "telegram"
  | "gmail"
  | "whatsapp"
  | "instagram"
  | "messenger"
  | "slack"
  | "discord";

export type ParsedMessage = {
  externalId?: string;
  senderType: "user" | "contact" | "assistant" | "system";
  senderLabel?: string;
  content: string;
  sentAt: string;
  metadata?: Record<string, unknown>;
};

export type ParsedConversation = {
  externalId?: string;
  title?: string;
  participantSummary: string[];
  startedAt?: string;
  lastMessageAt?: string;
  messages: ParsedMessage[];
};

export type ParseResult = {
  conversations: ParsedConversation[];
  preview: Array<{ text: string }>;
  parserVersion: string;
  detectedFormat: string;
  warnings: string[];
};

export type ParseInput = {
  name: string;
  mimeType: string;
  bytes: Uint8Array;
  platform: ImportPlatform;
};
