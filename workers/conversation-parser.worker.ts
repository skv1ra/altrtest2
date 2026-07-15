/// <reference lib="webworker" />

import { parseImport } from "@/lib/imports/parsers";
import type { ImportPlatform } from "@/lib/imports/types";

type ParseMessage = { type: "parse"; requestId: string; file: File; platform: ImportPlatform };
type CancelMessage = { type: "cancel"; requestId: string };

const controllers = new Map<string, AbortController>();

self.onmessage = async (event: MessageEvent<ParseMessage | CancelMessage>) => {
  const message = event.data;
  if (message.type === "cancel") {
    controllers.get(message.requestId)?.abort("IMPORT_CANCELLED");
    return;
  }

  const controller = new AbortController();
  controllers.set(message.requestId, controller);

  try {
    const bytes = new Uint8Array(await message.file.arrayBuffer());
    const result = await parseImport(
      { name: message.file.name, mimeType: message.file.type, bytes, platform: message.platform },
      controller.signal,
    );
    self.postMessage({ type: "result", requestId: message.requestId, ok: true, ...result });
  } catch (error) {
    self.postMessage({
      type: "result",
      requestId: message.requestId,
      ok: false,
      error: controller.signal.aborted
        ? "IMPORT_CANCELLED"
        : error instanceof Error
          ? error.message
          : "PARSE_FAILED",
    });
  } finally {
    controllers.delete(message.requestId);
  }
};
