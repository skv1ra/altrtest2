export type DeletionRequestStatus = "pending" | "verified" | "processing" | "completed" | "rejected" | "cancelled";
export type DeletionRequest = {
  id: string;
  createdAt: string;
  status: DeletionRequestStatus;
  userId?: string;
  email: string;
  fullName?: string;
  requestType: "account_and_all_data" | "imported_conversations" | "ai_memory" | "other";
  explanation?: string;
  source: "authenticated-prototype" | "external-prototype";
};

export const DELETION_REQUESTS_KEY = "altr_deletion_requests_v1";

function createId() { return `ALT-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`; }

function readRequests(): DeletionRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DELETION_REQUESTS_KEY) ?? "[]") as DeletionRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function createDeletionRequest(input: Omit<DeletionRequest, "id" | "createdAt" | "status">) {
  const request: DeletionRequest = { ...input, id: createId(), createdAt: new Date().toISOString(), status: "pending" };
  if (typeof window !== "undefined") window.localStorage.setItem(DELETION_REQUESTS_KEY, JSON.stringify([...readRequests(), request]));
  return request;
}

export function deleteAllLocalAltrData() {
  if (typeof window === "undefined") return;
  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith("altr_")) window.localStorage.removeItem(key);
  }
  for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = window.sessionStorage.key(index);
    if (key?.startsWith("altr_")) window.sessionStorage.removeItem(key);
  }
  window.dispatchEvent(new Event("altr-auth-change"));
}

export function exportLocalAltrData() {
  if (typeof window === "undefined") return {};
  const data: Record<string, unknown> = {};
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith("altr_")) continue;
    const raw = window.localStorage.getItem(key);
    try { data[key] = raw ? JSON.parse(raw) : null; } catch { data[key] = raw; }
  }
  return { exportedAt: new Date().toISOString(), scope: "Altr browser-only prototype", storage: data };
}
