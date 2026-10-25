"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage } from "@/lib/axios";
import { keys } from "@/lib/query-keys";
import { pushService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import type { PushPreferences } from "@/types";

/** Loại thông báo người dùng muốn nhận (nhắc học, thông báo tìm việc), lưu trên máy chủ, tách khỏi việc thiết bị có nhận thông báo hay không. */
export function usePushPreferences() {
  const client = useQueryClient();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const preferences = useQuery({
    queryKey: keys.pushPreferences(),
    queryFn: pushService.preferences,
  });

  const set = async (patch: Partial<PushPreferences>) => {
    setSaving(true);
    try {
      client.setQueryData(
        keys.pushPreferences(),
        await pushService.setPreferences(patch),
      );
    } catch (cause) {
      toast.danger(apiErrorMessage(cause, "Không đổi được cài đặt thông báo"));
    } finally {
      setSaving(false);
    }
  };

  return {
    data: preferences.data ?? null,
    busy: saving || preferences.isLoading,
    set,
  };
}
