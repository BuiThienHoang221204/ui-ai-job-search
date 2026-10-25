import { api } from "@/lib/axios";
import type { ReferralSummary } from "@/types";

export const referralsService = {
  summary: () => api.get<ReferralSummary>("/referrals").then((r) => r.data),
};
