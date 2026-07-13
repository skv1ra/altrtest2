import type { User } from "@supabase/supabase-js";
import type { AltrProfile, PlanId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const defaultStats = { conversations: 0, memories: 0, drafts: 0 };
const defaultConnections = { email: false, calendar: false, messages: false, workspace: false };
