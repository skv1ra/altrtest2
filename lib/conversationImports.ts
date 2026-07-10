import JSZip from "jszip";

export type ImportPlatform = "manual" | "telegram" | "gmail" | "whatsapp" | "instagram" | "messenger";
export type ImportStatus = "queued" | "processing" | "completed" | "failed";

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

const STORAGE_KEY = "altr_conversation_imports_v1";
const SUPPORTED = [".json", ".txt", ".html", ".htm", ".csv", ".mbox"];

export function listConversationImports(userId: string): ConversationImport[] {
  if (typeof window === "undefined") return [];
  try {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ConversationImport[];
    return records.filter(record => record.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch { return []; }
}

export function saveConversationImport(record: ConversationImport) {
  const all = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ConversationImport[]; } catch { return []; } })();
  const index = all.findIndex(item => item.id === record.id);
  if (index >= 0) all[index] = record; else all.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteConversationImport(id: string) {
  const all = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ConversationImport[]; } catch { return []; } })();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all.filter(record => record.id !== id)));
}

export function deleteAllConversationImports(userId: string) {
  const all = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ConversationImport[]; } catch { return []; } })();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all.filter(record => record.userId !== userId)));
}

function textValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(item => typeof item === "string" ? item : textValue((item as { text?: unknown })?.text)).join("");
  return "";
}

function stripHtml(value: string) {
  return value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function collectGenericJson(value: unknown, preview: string[], seen = new Set<unknown>()): { conversations: number; messages: number } {
  if (!value || typeof value !== "object" || seen.has(value)) return { conversations: 0, messages: 0 };
  seen.add(value);
  let conversations = 0, messages = 0;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key.toLowerCase() === "messages" && Array.isArray(child)) {
      conversations += child.length ? 1 : 0;
      messages += child.length;
      for (const item of child.slice(0, 4)) {
        if (item && typeof item === "object") {
          const row = item as Record<string, unknown>;
          const text = textValue(row.text ?? row.content ?? row.body ?? row.message);
          if (text && preview.length < 8) preview.push(text.slice(0, 180));
        }
      }
    } else {
      const nested = collectGenericJson(child, preview, seen);
      conversations += nested.conversations;
      messages += nested.messages;
    }
  }
  return { conversations, messages };
}

function parseJson(content: string, platform: ImportPlatform): Omit<ParseResult, "extractedFiles"> {
  const data = JSON.parse(content) as Record<string, unknown>;
  const preview: string[] = [];

  if (platform === "telegram") {
    const chatsValue = data.chats as { list?: unknown[] } | unknown[] | undefined;
    const chats = Array.isArray(chatsValue) ? chatsValue : Array.isArray(chatsValue?.list) ? chatsValue.list : [data];
    let conversations = 0, messages = 0;
    for (const chat of chats) {
      const rows = (chat as { messages?: unknown[] })?.messages;
      if (!Array.isArray(rows) || !rows.length) continue;
      conversations += 1; messages += rows.length;
      for (const item of rows.slice(0, 4)) {
        const text = textValue((item as { text?: unknown })?.text);
        if (text && preview.length < 8) preview.push(text.slice(0, 180));
      }
    }
    return { conversations, messages, preview };
  }

  if (platform === "instagram" || platform === "messenger") {
    const rows = data.messages;
    if (Array.isArray(rows)) {
      for (const item of rows.slice(0, 8)) {
        const text = textValue((item as { content?: unknown })?.content);
        if (text) preview.push(text.slice(0, 180));
      }
      return { conversations: rows.length ? 1 : 0, messages: rows.length, preview };
    }
  }

  const result = collectGenericJson(data, preview);
  return { ...result, preview };
}

function parseText(content: string, platform: ImportPlatform, extension: string): Omit<ParseResult, "extractedFiles"> {
  const plain = extension === ".html" || extension === ".htm" ? stripHtml(content) : content;
  if (platform === "gmail" || extension === ".mbox") {
    const ids = new Set(Array.from(content.matchAll(/^X-GM-THRID:\s*(.+)$/gmi), match => match[1].trim()));
    const messages = Math.max((content.match(/^From .+$/gm) ?? []).length, (content.match(/^Message-ID:/gmi) ?? []).length);
    const subjects = Array.from(content.matchAll(/^Subject:\s*(.+)$/gmi), match => match[1].trim()).slice(0, 8);
    return { conversations: ids.size || messages, messages, preview: subjects };
  }
  if (platform === "whatsapp") {
    const rows = plain.split(/\r?\n/).filter(line => /^\[?\d{1,4}[/.\-]\d{1,2}[/.\-]\d{1,4}.*?(?:-|\])\s*/.test(line));
    return { conversations: rows.length ? 1 : 0, messages: rows.length, preview: rows.slice(0, 8).map(row => row.slice(0, 180)) };
  }
  if (platform === "telegram" && (extension === ".html" || extension === ".htm")) {
    const messages = (content.match(/class=["'][^"']*message[^"']*["']/gi) ?? []).length;
    return { conversations: messages ? 1 : 0, messages, preview: plain ? [plain.slice(0, 180)] : [] };
  }
  const rows = plain.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  return { conversations: rows.length ? 1 : 0, messages: rows.length, preview: rows.slice(0, 8).map(row => row.slice(0, 180)) };
}

async function extractEntries(file: File): Promise<{ name: string; content: string }[]> {
  if (!file.name.toLowerCase().endsWith(".zip")) return [{ name: file.name, content: await file.text() }];
  const zip = await JSZip.loadAsync(file);
  const entries = Object.values(zip.files).filter(entry => !entry.dir && SUPPORTED.some(ext => entry.name.toLowerCase().endsWith(ext))).slice(0, 150);
  const result: { name: string; content: string }[] = [];
  for (const entry of entries) result.push({ name: entry.name, content: await entry.async("string") });
  return result;
}

export async function parseConversationFile(file: File, platform: ImportPlatform): Promise<ParseResult> {
  const entries = await extractEntries(file);
  if (!entries.length) throw new Error("В архіві немає підтримуваних JSON, TXT, HTML, CSV або MBOX файлів.");
  let conversations = 0, messages = 0;
  const preview: string[] = [];
  for (const entry of entries) {
    const extension = `.${entry.name.split(".").pop()?.toLowerCase() ?? ""}`;
    try {
      const result = extension === ".json" ? parseJson(entry.content, platform) : parseText(entry.content, platform, extension);
      conversations += result.conversations; messages += result.messages;
      preview.push(...result.preview.slice(0, Math.max(0, 8 - preview.length)));
    } catch { /* Skip unrelated files in multi-file exports. */ }
  }
  if (!messages) throw new Error("Не вдалося знайти повідомлення. Перевірте платформу та формат експорту.");
  return { extractedFiles: entries.map(entry => entry.name), conversations, messages, preview };
}
