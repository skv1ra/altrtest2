import "server-only";

import OpenAI from "openai";

export const OPENAI_RESPONSE_MODEL = process.env.OPENAI_RESPONSE_MODEL?.trim() || "gpt-5.6";
export const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL?.trim() || "text-embedding-3-small";
export const OPENAI_EMBEDDING_DIMENSIONS = 1536;

export type OpenAIResponseResult = {
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  usage?: Record<string, unknown>;
};

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function requireOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    const error = new Error("AI_PROVIDER_NOT_CONFIGURED");
    Object.assign(error, { status: 503 });
    throw error;
  }
  return new OpenAI({ apiKey });
}

export async function createResponse(
  client: OpenAI,
  body: Record<string, unknown>,
): Promise<OpenAIResponseResult> {
  return client.post<OpenAIResponseResult>("/responses", { body });
}

export function responseOutputText(response: OpenAIResponseResult) {
  return (response.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text" || typeof content.text === "string")
    .map((content) => content.text ?? "")
    .join("")
    .trim();
}

export function assertEmbeddingConfiguration() {
  if (OPENAI_EMBEDDING_MODEL !== "text-embedding-3-small") {
    throw new Error("EMBEDDING_MODEL_REQUIRES_DOCUMENTED_MIGRATION");
  }
}
