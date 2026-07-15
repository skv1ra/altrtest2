import { z } from "zod";

export const deletionRequestSchema = z.object({
  email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
  scope: z.enum(["all", "account", "conversations", "memory"]),
  reason: z.string().trim().max(2000).optional().default(""),
  confirmed: z.literal(true),
}).strict();

export type DeletionRequestInput = z.infer<typeof deletionRequestSchema>;
