import type { PlanId } from "@/lib/billing/types";

export type PlanLimits = {
  importsPerMonth: number;
  maxFileBytes: number;
  maxMessagesPerImport: number;
  maxConversationsPerImport: number;
  maxActiveMemories: number;
  aiDraftsPerMonth: number;
  concurrentImports: number;
  concurrentMemoryJobs: number;
};

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    importsPerMonth: 1,
    maxFileBytes: 5 * 1024 * 1024,
    maxMessagesPerImport: 2_000,
    maxConversationsPerImport: 100,
    maxActiveMemories: 250,
    aiDraftsPerMonth: 10,
    concurrentImports: 1,
    concurrentMemoryJobs: 1,
  },
  personal: {
    importsPerMonth: 10,
    maxFileBytes: 25 * 1024 * 1024,
    maxMessagesPerImport: 20_000,
    maxConversationsPerImport: 1_000,
    maxActiveMemories: 5_000,
    aiDraftsPerMonth: 500,
    concurrentImports: 1,
    concurrentMemoryJobs: 1,
  },
  work: {
    importsPerMonth: 50,
    maxFileBytes: 50 * 1024 * 1024,
    maxMessagesPerImport: 100_000,
    maxConversationsPerImport: 5_000,
    maxActiveMemories: 25_000,
    aiDraftsPerMonth: 2_000,
    concurrentImports: 2,
    concurrentMemoryJobs: 2,
  },
};

export function getPlanLimits(planId: PlanId) {
  return PLAN_LIMITS[planId];
}
