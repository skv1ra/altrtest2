# Import parser security and deletion policy

## Privacy boundary

Raw exports are parsed in a browser Web Worker. The application uploads only normalized conversations and messages after explicit user consent. Raw files are not stored by default and imported HTML is never rendered as HTML.

## Supported inputs

The parser supports generic JSON, TXT, HTML, CSV, MBOX and ZIP containers, with format-specific handling for Telegram JSON/HTML, Gmail Takeout MBOX, WhatsApp TXT, Instagram JSON and Messenger JSON. Unsupported archive entries are ignored; nested archives and unsupported binaries are rejected.

## Hard limits

The shared `IMPORT_LIMITS` contract enforces compressed and uncompressed byte limits, ZIP entry count and individual entry size, conversation/message limits, line and preview lengths, JSON depth/complexity and a browser processing timeout. ZIP metadata is inspected before extraction. ZIP64, encrypted or multi-disk archives, path traversal names, unsupported compression methods and suspicious compression ratios are rejected.

JSZip remains the decompressor, but it is not trusted to determine safety limits. Altr parses the ZIP central directory before calling JSZip, verifies sizes again after extraction and enables CRC checking.

## Cancellation and retry

The browser owns the hard timeout and terminates the Web Worker after 30 seconds. User cancellation also terminates the worker, so synchronous parsing cannot continue in the background.

The source SHA-256 is checked per user among active imports. Exact duplicates return `DUPLICATE_IMPORT`. Stale processing imports are marked failed. Chunk uploads are idempotent: retrying a chunk replaces rows previously written for that chunk. A failed browser upload can therefore be safely retried with the same local file.

## Deletion policy

Deleting an import performs these operations for the authenticated owner:

1. marks the import as deleted;
2. deletes import provenance rows;
3. disables and detaches memories derived from that import, preserving them only for explicit user review;
4. deletes normalized conversations, which cascade-delete their normalized messages;
5. leaves no raw file to delete because raw storage is disabled by default.

## Plain-text handling

No imported HTML is passed to React as HTML. Script, style, iframe, SVG, template and related blocks are removed, remaining tags are stripped, entities are decoded, and the result is handled as plain text. CSV cells beginning with spreadsheet formula prefixes are neutralized before they can be re-exported.
