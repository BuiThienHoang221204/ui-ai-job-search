"use client";

import {
  useIsMutating,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { create } from "zustand";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiErrorMessage } from "@/lib/axios";
import { invalidateAfter, keys } from "@/lib/query-keys";
import {
  profileService,
  type ProfileRecord,
  type QuickStartInput,
} from "@/services";
import { useToast } from "@/components/ui/toast";
import type { ProfileTab, ProfileUpdate, RecordType } from "./profile-config";

export type Editing =
  | { kind: "basic" }
  | { kind: "record"; type: RecordType; index: number | null };

interface ProfileUi {
  tab: ProfileTab;
  editing: Editing | null;
  setTab: (tab: ProfileTab) => void;
  edit: (editing: Editing) => void;
  close: () => void;
}

/** Tab đang mở và mục đang sửa; để mọi khối trên trang mở được modal mà không truyền props. */
export const useProfileUi = create<ProfileUi>((set) => ({
  tab: "cv",
  editing: null,
  setTab: (tab) => set({ tab }),
  edit: (editing) => set({ editing }),
  close: () => set({ editing: null }),
}));

const SAVE_KEY = ["profile", "save"];

export function useProfile() {
  return useApiQuery(keys.profile(), () => profileService.get(), {
    errorMessage: "Không tải được hồ sơ",
  });
}

/** Lưu ngay một phần hồ sơ rồi báo "Đã lưu"; `quickStart` dành cho ngành và cấp bậc. */
export function useSaveProfile() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const onSuccess = (profile: ProfileRecord) => {
    queryClient.setQueryData(keys.profile(), profile);
    invalidateAfter(queryClient, "saveProfile");
    toast.success("Đã lưu");
  };
  const onError = (error: unknown) =>
    toast.danger(apiErrorMessage(error, "Không lưu được hồ sơ"));

  const update = useMutation({
    mutationKey: SAVE_KEY,
    mutationFn: (changes: ProfileUpdate) => profileService.update(changes),
    onSuccess,
    onError,
  });
  const quickStart = useMutation({
    mutationKey: SAVE_KEY,
    mutationFn: (input: QuickStartInput) => profileService.quickStart(input),
    onSuccess,
    onError,
  });
  const saving = useIsMutating({ mutationKey: SAVE_KEY }) > 0;

  return { save: update.mutateAsync, saveSearch: quickStart.mutate, saving };
}
