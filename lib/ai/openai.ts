import "server-only";

import OpenAI from "openai";

export const OPENAI_RESPONSE_MODEL = process.env.OPENAI_RESPONSE_MODEL?.trim() || "gpt-5.6";
export const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL?.trim() || "text-embedding-3-small";
export const OPENAI_EMBEDDING_DIMENSIONS = 1536;

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export