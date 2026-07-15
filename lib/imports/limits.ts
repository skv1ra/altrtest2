export const IMPORT_LIMITS = Object.freeze({
  compressedFileBytes: 25_000_000,
  uncompressedTotalBytes: 100_000_000,
  zipEntries: 1_000,
  zipEntryBytes: 25_000_000,
  messages: 100_000,
  conversations: 5_000,
  lineLength: 32_000,
  previewLength: 260,
  messageLength: 12_000,
  titleLength: 240,
  senderLabelLength: 120,
  jsonDepth: 64,
  jsonNodes: 1_000_000,
  processingTimeoutMs: 30_000,
});

export const PARSER_VERSION = "altr-browser-parser-2";
