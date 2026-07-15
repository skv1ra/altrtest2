import { IMPORT_LIMITS } from "./limits";

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function decodeHtmlEntities(value: string) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const hex = entity[1]?.toLowerCase() === "x";
      const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    }
    return ENTITY_MAP[entity.toLowerCase()] ?? match;
  });
}

export function htmlToPlainText(html: string) {
  const withoutDangerousBlocks = html
    .replace(/<(script|style|noscript|template|svg|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ");
  const withBreaks = withoutDangerousBlocks.replace(/<\s*(br|\/p|\/div|\/li|\/tr|\/h[1-6])\s*\/?>/gi, "\n");
  return normalizePlainText(decodeHtmlEntities(withBreaks.replace(/<[^>]*>/g, " ")));
}

export function normalizePlainText(value: string, maxLength = IMPORT_LIMITS.messageLength) {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.slice(0, IMPORT_LIMITS.lineLength))
    .join("\n")
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

export function neutralizeCsvFormula(value: string) {
  const trimmed = value.replace(/^\s+/, "");
  return /^[=+\-@]/.test(trimmed) ? `'${value}` : value;
}

export function safeDisplayName(value: unknown, fallback = "Contact") {
  return normalizePlainText(String(value ?? fallback), IMPORT_LIMITS.senderLabelLength) || fallback;
}
