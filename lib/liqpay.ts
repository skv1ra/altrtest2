import crypto from "crypto";

export type LiqPayPayload = Record<string, string | number | boolean | undefined>;

export function encodeData(payload: LiqPayPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function decodeData<T = LiqPayPayload>(data: string): T {
  return JSON.parse(Buffer.from(data, "base64").toString("utf8")) as T;
}

export function createSignature(data: string, privateKey = process.env.LIQPAY_PRIVATE_KEY ?? "") {
  if (!privateKey) throw new Error("LIQPAY_PRIVATE_KEY is not configured");
  return crypto.createHash("sha3-256").update(privateKey + data + privateKey).digest("base64");
}

export function verifySignature(data: string, signature: string) {
  try {
    return crypto.timingSafeEqual(Buffer.from(createSignature(data)), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || "http://localhost:3000").replace(/\/$/, "");
}
