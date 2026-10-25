"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage } from "@/lib/axios";
import { keys } from "@/lib/query-keys";
import { companiesService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import type { CompanyFollow } from "@/types";

/** Công ty người dùng đang theo dõi; tin mới của các công ty này vào thông báo 07:30. */
export function useCompanyFollows() {
  const client = useQueryClient();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const follows = useQuery({
    queryKey: keys.companyFollows(),
    queryFn: companiesService.follows,
  });

  const run = async (action: () => Promise<void>, failure: string) => {
    setBusy(true);
    try {
      await action();
    } catch (cause) {
      toast.danger(apiErrorMessage(cause, failure));
    } finally {
      setBusy(false);
    }
  };

  const follow = (jobId: string) =>
    run(async () => {
      const created = await companiesService.follow(jobId);
      client.setQueryData<CompanyFollow[]>(keys.companyFollows(), (current) => [
        created,
        ...(current ?? []).filter((item) => item.id !== created.id),
      ]);
      toast.success(
        `Đã theo dõi ${created.name}. Tin mới của công ty này có trong thông báo tìm việc lúc 07:30.`,
      );
    }, "Không theo dõi được công ty này");

  const unfollow = (id: string) =>
    run(async () => {
      await companiesService.unfollow(id);
      client.setQueryData<CompanyFollow[]>(keys.companyFollows(), (current) =>
        (current ?? []).filter((item) => item.id !== id),
      );
    }, "Không bỏ theo dõi được công ty này");

  return { list: follows.data ?? [], busy, follow, unfollow };
}
