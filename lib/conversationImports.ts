export type ImportPlatform = "manual" | "telegram" | "gmail" | "whatsapp" | "instagram" | "messenger";
export type ImportStatus = "queued" | "processing" | "completed" | "failed" | "deleted";

export type ConversationImport = {
  id: string;
  userId: string;
  platform: ImportPlatform;
  sourceName: string;
  extractedFiles: string[];
  bytes: number;
  status: ImportStatus;
  conversations: number;
  messages: number;
  preview: string[];
  createdAt: string;
  completedAt?: string;
  error?: string;
};

export type ParseResult = Pick<ConversationImport, "extractedFiles" | "conversations" | "messages" | "preview">;

export function listConversationImports(): ConversationImport[] {
  return [];
}

export function saveConversationImport(): never {
  throw new Error("Legacy browser import storage is disabled. Use the authenticated /api/imports endpoint.");
}

export function deleteConversationImport(): never {
  throw new Error("Legacy browser import deletion is disabled. Use the authenticated /api/imports/[id] endpoint.");
}

export function deleteAllConversationImports(): never {
  throw new Error("Legacy browser import deletion is disabled. Use the authenticated /api/imports endpoint.");
}

export async function parseConversationFile(): Promise<ParseResult> {
  throw new Error("Client-side parsing is disabled. Upload files through the authenticated server import endpoint.");
}
