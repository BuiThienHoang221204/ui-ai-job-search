"use client";

import { useQuery } from "@tanstack/react-query";
import { keys } from "@/lib/query-keys";
import { referralsService } from "@/services";

/** Mã mời, số bạn đã tham gia và phút giọng nói được thưởng còn lại. */
export function useReferrals(enabled = true) {
  return useQuery({
    queryKey: keys.referrals(),
    queryFn: referralsService.summary,
    enabled,
  });
}
