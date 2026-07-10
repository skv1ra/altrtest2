export type ParagraphBlock = { type: "paragraph"; text: string };
export type ListBlock = { type: "list"; items: string[]; ordered?: boolean };
export type NoteBlock = { type: "note"; text: string };
export type TableBlock = { type: "table"; headers: string[]; rows: string[][] };
export type LegalBlock = ParagraphBlock | ListBlock | NoteBlock | TableBlock;

export type LegalSection = { id: string; heading: string; blocks: LegalBlock[] };
export type LegalDocument = {
  title: string;
  eyebrow: string;
  version: string;
  effectiveDate?: string;
  lastUpdated: string;
  intro: LegalBlock[];
  sections: LegalSection[];
};

export const paragraph = (text: string): ParagraphBlock => ({ type: "paragraph", text });
export const list = (items: string[], ordered = false): ListBlock => ({ type: "list", items, ordered });
export const note = (text: string): NoteBlock => ({ type: "note", text });
export const table = (headers: string[], rows: string[][]): TableBlock => ({ type: "table", headers, rows });
