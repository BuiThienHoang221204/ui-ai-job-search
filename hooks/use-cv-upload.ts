"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { PartialProposal } from "@/lib/profile-partial";
import { ModelStreamError, streamModel } from "@/lib/model-stream";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { invalidateAfter } from "@/lib/query-keys";
import { useToast } from "@/components/ui/toast";
import {
  profileDraftService,
  profileService,
  type ProfileDraftRecord,
  type ProfileRecord,
} from "@/services";

const LOGIN_NEXT = "/login?next=/dashboard/profile/upload";
const POLL_MS = 2_000;
const MAX_POLLS = 105;

/** Trạng thái và tác vụ của màn đọc CV: nộp file, chờ đọc, chạy lại và lưu vào hồ sơ. */
export function useCvUpload() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const mounted = useRef(true);

  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [draft, setDraft] = useState<ProfileDraftRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [partial, setPartial] = useState<PartialProposal | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const fail = (err: unknown, fallback: string) => {
    if (!mounted.current) return;
    if (apiErrorStatus(err) === 401) router.replace(LOGIN_NEXT);
    else setError(apiErrorMessage(err, fallback));
  };

  useEffect(() => {
    mounted.current = true;
    void Promise.all([
      profileService.get().catch(() => null),
      profileDraftService.latest().catch((err: unknown) => {
        if (apiErrorStatus(err) === 404) return null;
        throw err;
      }),
    ])
      .then(([current, latest]) => {
        if (!mounted.current) return;
        setProfile(current);
        setDraft(latest);
      })
      .catch((err: unknown) => fail(err, "Không tải được dữ liệu hồ sơ"))
      .finally(() => mounted.current && setLoading(false));
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Hỏi lại trạng thái bản nháp tới khi đọc xong hoặc hỏng (dùng sau khi bấm Thử lại). */
  const waitForDraft = async (draftId: string) => {
    for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
      if (!mounted.current) return;
      const current = await profileDraftService.get(draftId).catch(() => null);
      if (!mounted.current || !current) continue;
      setDraft(current);
      if (current.status === "DONE" || current.status === "FAILED") return;
    }
    if (mounted.current)
      setError(
        "Chờ quá lâu mà chưa có kết quả. Lượt đọc vẫn chạy ở nền, mở lại trang sau ít phút.",
      );
  };

  /** Nộp file rồi đọc bằng stream để danh sách "đang đọc" hiện dần. */
  const upload = async (picked: File) => {
    setFile(picked);
    setBusy(true);
    setError(null);
    setDismissed(false);
    try {
      const receipt = await profileDraftService.uploadCv(picked, true);
      if (!mounted.current) return;
      setDraft(await profileDraftService.get(receipt.draftId));
      const done = await streamModel<ProfileDraftRecord, PartialProposal>({
        path: `/profile-drafts/${receipt.draftId}/synthesize-stream`,
        onPartial: (value) => mounted.current && setPartial(value),
      });
      if (mounted.current) setDraft(done);
    } catch (err) {
      if (err instanceof ModelStreamError) setError(err.message);
      else fail(err, "Không đọc được CV");
    } finally {
      if (mounted.current) {
        setBusy(false);
        setPartial(null);
      }
    }
  };

  const retry = async () => {
    if (!draft) return;
    setBusy(true);
    setError(null);
    try {
      const restarted = await profileDraftService.retry(draft.id);
      if (!mounted.current) return;
      setDraft(restarted);
      await waitForDraft(restarted.id);
    } catch (err) {
      fail(err, "Không chạy lại được lượt đọc");
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  /** Lưu giá trị đã duyệt rồi về trang Hồ sơ. */
  const apply = async (values: Record<string, unknown>) => {
    if (!draft) return;
    setSaving(true);
    try {
      await profileDraftService.apply(draft.id, values);
      invalidateAfter(queryClient, "saveProfile");
      toast.success("Đã cập nhật hồ sơ từ CV");
      router.push("/dashboard/profile");
    } catch (err) {
      toast.danger(apiErrorMessage(err, "Không lưu được vào hồ sơ"));
      if (mounted.current) setSaving(false);
    }
  };

  const reading =
    busy || draft?.status === "PENDING" || draft?.status === "RUNNING";
  const reviewing =
    !reading && !dismissed && draft?.status === "DONE" && !draft.appliedAt;

  return {
    profile,
    draft,
    loading,
    error,
    file,
    partial,
    reading,
    reviewing,
    saving,
    upload,
    retry,
    apply,
    dismiss: () => setDismissed(true),
  };
}
