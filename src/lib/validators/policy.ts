import { z } from "zod/v4";

export const updatePolicySchema = z.object({
  appWhitelist: z.array(z.string()).default([]),
  appBlacklist: z.array(z.string()).default([]),
  categoryFilters: z.array(z.string()).default([]),
  screenTimeLimitMin: z.number().int().positive().nullable().default(null),
  dnsSafeBrowsing: z.boolean().default(false),
  installRestriction: z.boolean().default(false),
});

export type UpdatePolicyInput = z.infer<typeof updatePolicySchema>;
