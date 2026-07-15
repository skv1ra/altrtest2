import { IMPORT_LIMITS, PARSER_VERSION } from "./limits";
import { htmlToPlainText, neutralizeCsvFormula, normalizePlainText, safeDisplayName } from "./sanitize";
import type { ImportPlatform, ParseInput, ParseResult, ParsedConversation, ParsedMessage } from "./types";
import { extractSafeZipEntries } from "./zip";

function decodeImportedText(bytes: Uint8Array, warnings: string[]) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    const fallback = new TextDecoder("windows-1252", { fatal: false }).decode(bytes);
    const replacementCount = (fallback.match(/\uFFFD/g) ?? []).length;
    if (replacementCount > Math.max(10, Math.floor(fallback.length * 0.01))) throw new Error("MALFORMED_ENCODING");
    warnings.push("SOURCE_ENCODING_FALLBACK_WINDOWS_1252");
    return fallback;
  }
}

function checkpoint(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Import cancelled", "AbortError");
}

function asDate(value: unknown, fallbackOffset = 0) {
  const date = new Date(typeof value === "string" || typeof value === "number" ? value : Date.now() + fallbackOffset);
  return Number.isNaN(date.valueOf()) ? new Date(Date.now() + fallbackOffset).toISOString() : date.toISOString();
}

function scanJsonDepth(text: string) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{" || char === "[") {
      depth += 1;
      if (depth > IMPORT_LIMITS.jsonDepth) throw new Error("JSON_TOO_DEEP");
    } else if (char === "}" || char === "]") depth -= 1;
    if (depth < 0) throw new Error("JSON_MALFORMED");
  }
  if (inString || depth !== 0) throw new Error("JSON_MALFORMED");
}

export function assertSafeObjectGraph(value: unknown) {
  const seen = new WeakSet<object>();
  const stack: Array<{ value: unknown; depth: number }> = [{ value, depth: 0 }];
  let nodes = 0;
  while (stack.length) {
    const current = stack.pop()!;
    if (current.depth > IMPORT_LIMITS.jsonDepth) throw new Error("JSON_TOO_DEEP");
    if (!current.value || typeof current.value !== "object") continue;
    if (seen.has(current.value)) throw new Error("OBJECT_CYCLE");
    seen.add(current.value);
    nodes += 1;
    if (nodes > IMPORT_LIMITS.jsonNodes) throw new Error("JSON_TOO_COMPLEX");
    for (const child of Array.isArray(current.value) ? current.value : Object.values(current.value)) {
      stack.push({ value: child, depth: current.depth + 1 });
    }
  }
}

function safeJsonParse(text: string) {
  scanJsonDepth(text);
  const value: unknown = JSON.parse(text);
  assertSafeObjectGraph(value);
  return value;
}

function messageFromRow(row: Record<string, unknown>, index: number): ParsedMessage | null {
  const rawContent = row.text ?? row.content ?? row.body ?? row.message ?? row.snippet ?? "";
  const content = typeof rawContent === "string" ? normalizePlainText(rawContent) : normalizePlainText(JSON.stringify(rawContent));
  if (!content) return null;
  const outgoing = row.from === "me" || row.sender === "me" || row.isOutgoing === true || row.is_outgoing === true;
  return {
    externalId: String(row.id ?? row.message_id ?? index).slice(0, 200),
    senderType: outgoing ? "user" : "contact",
    senderLabel: safeDisplayName(row.from_name ?? row.sender_name ?? row.sender ?? row.from ?? "Contact"),
    content,
    sentAt: asDate(row.date ?? row.timestamp ?? row.created_at, index),
    metadata: {},
  };
}

function finalizeConversation(conversation: ParsedConversation): ParsedConversation | null {
  const messages = conversation.messages.slice(0, IMPORT_LIMITS.messages);
  if (!messages.length) return null;
  return {
    ...conversation,
    title: normalizePlainText(conversation.title ?? "Imported conversation", IMPORT_LIMITS.titleLength),
    participantSummary: conversation.participantSummary.slice(0, 30).map((item) => safeDisplayName(item)),
    startedAt: conversation.startedAt ?? messages[0]?.sentAt,
    lastMessageAt: conversation.lastMessageAt ?? messages.at(-1)?.sentAt,
    messages,
  };
}

function parseTelegramJson(root: Record<string, unknown>) {
  const chats = (root.chats as Record<string, unknown> | undefined)?.list;
  const rawConversations = Array.isArray(chats) ? chats : Array.isArray(root.messages) ? [root] : [];
  return rawConversations.map((chat, conversationIndex) => {
    const row = chat as Record<string, unknown>;
    const rawMessages = Array.isArray(row.messages) ? row.messages : [];
    const messages = rawMessages.map((item, index) => messageFromRow(item as Record<string, unknown>, index)).filter(Boolean) as ParsedMessage[];
    return finalizeConversation({
      externalId: String(row.id ?? conversationIndex),
      title: String(row.name ?? row.title ?? "Telegram conversation"),
      participantSummary: [],
      messages,
    });
  }).filter(Boolean) as ParsedConversation[];
}

function parseMetaJson(value: unknown, platform: "instagram" | "messenger") {
  const roots = Array.isArray(value) ? value : [value];
  return roots.flatMap((item, conversationIndex) => {
    const row = item as Record<string, unknown>;
    const messagesRaw = Array.isArray(row.messages) ? row.messages : [];
    const participants = Array.isArray(row.participants)
      ? row.participants.map((participant) => safeDisplayName((participant as Record<string, unknown>).name))
      : [];
    const messages = messagesRaw.map((message, index) => {
      const source = message as Record<string, unknown>;
      return messageFromRow({
        ...source,
        text: source.content ?? source.text,
        sender: source.sender_name ?? source.sender,
        timestamp: source.timestamp_ms ?? source.timestamp,
      }, index);
    }).filter(Boolean) as ParsedMessage[];
    const conversation = finalizeConversation({
      externalId: String(row.id ?? conversationIndex),
      title: String(row.title ?? `${platform} conversation`),
      participantSummary: participants,
      messages,
    });
    return conversation ? [conversation] : [];
  });
}

function parseGenericJson(value: unknown, platform: ImportPlatform) {
  if (platform === "telegram" && value && typeof value === "object") return parseTelegramJson(value as Record<string, unknown>);
  if (platform === "instagram" || platform === "messenger") return parseMetaJson(value, platform);
  const root = value as Record<string, unknown>;
  const candidates = Array.isArray(value)
    ? value
    : Array.isArray(root?.conversations)
      ? root.conversations
      : Array.isArray(root?.messages)
        ? [root]
        : [];
  const conversations: ParsedConversation[] = [];
  for (let conversationIndex = 0; conversationIndex < candidates.length; conversationIndex += 1) {
    const candidate = candidates[conversationIndex] as Record<string, unknown>;
    const rawMessages = Array.isArray(candidate.messages) ? candidate.messages : Array.isArray(value) ? candidates : [];
    const messages = rawMessages.map((item, index) => messageFromRow(item as Record<string, unknown>, index)).filter(Boolean) as ParsedMessage[];
    const conversation = finalizeConversation({
      externalId: String(candidate.id ?? conversationIndex),
      title: String(candidate.name ?? candidate.title ?? "Imported conversation"),
      participantSummary: [],
      messages,
    });
    if (conversation) conversations.push(conversation);
    if (Array.isArray(value)) break;
  }
  return conversations;
}

function parseWhatsApp(text: string) {
  const pattern = /^\[?(\d{1,2}[/.]\d{1,2}[/.]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]?\s*[-–]\s*([^:]+):\s*(.*)$/i;
  const messages: ParsedMessage[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (line.length > IMPORT_LIMITS.lineLength) throw new Error("LINE_TOO_LONG");
    const match = line.match(pattern);
    if (match) {
      messages.push({ senderType: "contact", senderLabel: safeDisplayName(match[3]), content: normalizePlainText(match[4]), sentAt: asDate(`${match[1]} ${match[2]}`, messages.length) });
    } else if (messages.length && line.trim()) {
      messages[messages.length - 1].content = normalizePlainText(`${messages[messages.length - 1].content}\n${line}`);
    }
    if (messages.length > IMPORT_LIMITS.messages) throw new Error("MESSAGE_LIMIT_EXCEEDED");
  }
  const conversation = finalizeConversation({ title: "WhatsApp conversation", participantSummary: [], messages });
  return conversation ? [conversation] : [];
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { row.push(neutralizeCsvFormula(cell)); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(neutralizeCsvFormula(cell)); rows.push(row); row = []; cell = "";
      if (rows.length > IMPORT_LIMITS.messages + 1) throw new Error("MESSAGE_LIMIT_EXCEEDED");
    } else { cell += char; if (cell.length > IMPORT_LIMITS.lineLength) throw new Error("LINE_TOO_LONG"); }
  }
  if (cell || row.length) { row.push(neutralizeCsvFormula(cell)); rows.push(row); }
  const headers = rows.shift()?.map((header) => header.trim().toLowerCase()) ?? [];
  const contentIndex = headers.findIndex((header) => /content|message|text|body/.test(header));
  const senderIndex = headers.findIndex((header) => /sender|from|author/.test(header));
  const dateIndex = headers.findIndex((header) => /date|time|timestamp/.test(header));
  const messages = rows.map((values, index) => ({
    senderType: "contact" as const,
    senderLabel: safeDisplayName(values[senderIndex] ?? "Contact"),
    content: normalizePlainText(values[contentIndex] ?? values.join(" | ")),
    sentAt: asDate(values[dateIndex], index),
  })).filter((message) => message.content);
  const conversation = finalizeConversation({ title: "CSV import", participantSummary: [], messages });
  return conversation ? [conversation] : [];
}

function parseMbox(text: string) {
  const chunks = text.split(/\n(?=From [^\n]+\n)/g);
  const messages: ParsedMessage[] = [];
  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];
    const separator = chunk.search(/\r?\n\r?\n/);
    const headerText = separator >= 0 ? chunk.slice(0, separator) : "";
    const bodyText = separator >= 0 ? chunk.slice(separator).trim() : chunk;
    const unfolded = headerText.replace(/\r?\n[ \t]+/g, " ");
    const header = (name: string) => unfolded.match(new RegExp(`^${name}:\\s*(.+)$`, "im"))?.[1] ?? "";
    const isHtml = /text\/html/i.test(header("Content-Type"));
    const content = isHtml ? htmlToPlainText(bodyText) : normalizePlainText(bodyText);
    if (!content) continue;
    messages.push({
      externalId: header("Message-ID").slice(0, 200) || String(index),
      senderType: "contact",
      senderLabel: safeDisplayName(header("From")),
      content: normalizePlainText(`${header("Subject") ? `Subject: ${header("Subject")}\n` : ""}${content}`),
      sentAt: asDate(header("Date"), index),
    });
    if (messages.length > IMPORT_LIMITS.messages) throw new Error("MESSAGE_LIMIT_EXCEEDED");
  }
  const conversation = finalizeConversation({ title: "Gmail Takeout", participantSummary: [], messages });
  return conversation ? [conversation] : [];
}

function parsePlainText(text: string, title = "Imported text") {
  const lines = text.split(/\r?\n/);
  if (lines.some((line) => line.length > IMPORT_LIMITS.lineLength)) throw new Error("LINE_TOO_LONG");
  const messages = lines.filter(Boolean).slice(0, IMPORT_LIMITS.messages).map((line, index) => ({ senderType: "contact" as const, content: normalizePlainText(line), sentAt: asDate(undefined, index) }));
  const conversation = finalizeConversation({ title, participantSummary: [], messages });
  return conversation ? [conversation] : [];
}

function extensionOf(name: string) { return name.toLowerCase().split(".").pop() ?? ""; }

function parseTextFile(name: string, text: string, platform: ImportPlatform) {
  const extension = extensionOf(name);
  if (extension === "json") return { conversations: parseGenericJson(safeJsonParse(text), platform), format: `${platform}-json` };
  if (extension === "html" || extension === "htm") return { conversations: platform === "telegram" ? parsePlainText(htmlToPlainText(text), "Telegram HTML") : parsePlainText(htmlToPlainText(text), "HTML import"), format: `${platform}-html` };
  if (extension === "csv") return { conversations: parseCsv(text), format: "csv" };
  if (extension === "mbox") return { conversations: parseMbox(text), format: "mbox" };
  if (platform === "whatsapp") return { conversations: parseWhatsApp(text), format: "whatsapp-txt" };
  return { conversations: parsePlainText(text), format: "txt" };
}

function validateResult(conversations: ParsedConversation[]) {
  if (conversations.length > IMPORT_LIMITS.conversations) throw new Error("CONVERSATION_LIMIT_EXCEEDED");
  const totalMessages = conversations.reduce((sum, conversation) => sum + conversation.messages.length, 0);
  if (totalMessages > IMPORT_LIMITS.messages) throw new Error("MESSAGE_LIMIT_EXCEEDED");
  if (!totalMessages) throw new Error("NO_MESSAGES_FOUND");
}

export async function parseImport(input: ParseInput, signal?: AbortSignal): Promise<ParseResult> {
  checkpoint(signal);
  if (input.bytes.byteLength > IMPORT_LIMITS.compressedFileBytes) throw new Error("COMPRESSED_FILE_TOO_LARGE");
  const extension = extensionOf(input.name);
  const warnings: string[] = [];
  let conversations: ParsedConversation[] = [];
  let detectedFormat = extension || "unknown";
  if (extension === "zip") {
    const entries = await extractSafeZipEntries(input.bytes, signal);
    for (const entry of entries) {
      checkpoint(signal);
      const text = decodeImportedText(entry.bytes, warnings);
      const parsed = parseTextFile(entry.name, text, input.platform);
      conversations.push(...parsed.conversations);
      detectedFormat = `zip:${parsed.format}`;
      if (conversations.length > IMPORT_LIMITS.conversations) throw new Error("CONVERSATION_LIMIT_EXCEEDED");
    }
  } else {
    const sample = input.bytes.subarray(0, Math.min(input.bytes.length, 4096));
    if (/\u0000/.test(new TextDecoder("windows-1252").decode(sample))) throw new Error("UNSUPPORTED_BINARY_FILE");
    const text = decodeImportedText(input.bytes, warnings);
    const parsed = parseTextFile(input.name, text, input.platform);
    conversations = parsed.conversations;
    detectedFormat = parsed.format;
  }
  checkpoint(signal);
  validateResult(conversations);
  const preview = conversations.flatMap((conversation) => conversation.messages).slice(0, 5).map((message) => ({ text: message.content.slice(0, IMPORT_LIMITS.previewLength) }));
  return { conversations, preview, parserVersion: PARSER_VERSION, detectedFormat, warnings };
}
