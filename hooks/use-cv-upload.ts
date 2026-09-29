"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PartialProposal } from "@/lib/profile-partial";
import { ModelStreamError, streamModel } from "@/lib/model-stream";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import {
  defaultSelection,
  proposalRows,
  type ApplicableField,
} from "@/lib/profile-draft-content";
import {
  profileDraftService,
  profileService,
  type ProfileDraftRecord,
  type ProfileRecord,
} from "@/services";

const LOGIN_NEXT = "/login?next=/dashboard/profile/upload";

const POLL_MS = 2_000;
const MAX_POLLS = 105;

/** Toàn bộ trạng thái và tác vụ của màn đọc CV: nộp, chờ, chạy lại và áp dụng đề xuất. */
export function useCvUpload() {
  const router = useRouter();
  const mounted = useRef(true);

  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [draft, setDraft] = useState<ProfileDraftRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [partial, setPartial] = useState<PartialProposal | null>(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const [waiting, setWaiting] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const [selected, setSelected] = useState<ApplicableField[]>([]);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [current, latest] = await Promise.all([
          profileService.get().catch(() => null),
          profileDraftService.latest().catch((err: unknown) => {
            if (apiErrorStatus(err) === 404) return null;
            throw err;
          }),
        ]);
        if (cancelled) return;
        setProfile(current);
        setDraft(latest);
        if (latest?.proposal) {
          setSelected(defaultSelection(proposalRows(latest.proposal, current)));
        }
      } catch (err) {
        if (cancelled) return;
        if (apiErrorStatus(err) === 401) {
          router.replace(LOGIN_NEXT);
          return;
        }
        setError(apiErrorMessage(err, "Không tải được dữ liệu hồ sơ"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  /** Hỏi lại trạng thái bản nháp theo chuỗi cho tới khi xong hoặc hỏng. */
  const waitForDraft = async (draftId: string) => {
    setWaiting(true);
    for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
      if (!mounted.current) return;

      try {
        const current = await profileDraftService.get(draftId);
        if (!mounted.current) return;
        setDraft(current);

        if (current.status === "DONE" || current.status === "FAILED") {
          setWaiting(false);
          if (current.proposal) {
            setSelected(
              defaultSelection(proposalRows(current.proposal, profile)),
            );
          }
          return;
        }
      } catch (err) {
        if (!mounted.current) return;
        if (apiErrorStatus(err) === 401) {
          router.replace(LOGIN_NEXT);
          return;
        }
      }
    }

    if (!mounted.current) return;
    setWaiting(false);
    setError(
      "Chờ quá lâu mà chưa có kết quả. Lượt đọc vẫn đang chạy ở nền — mở lại trang sau ít phút.",
    );
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const receipt = await profileDraftService.uploadCv(file, true);
      if (!mounted.current) return;
      setDraft(await profileDraftService.get(receipt.draftId));
      setFile(null);

      try {
        const done = await streamModel<ProfileDraftRecord, PartialProposal>({
          path: `/profile-drafts/${receipt.draftId}/synthesize-stream`,
          onPartial: (value) => {
            if (mounted.current) setPartial(value);
          },
        });
        if (mounted.current) setDraft(done);
      } catch (streamError) {
        if (!mounted.current) return;
        setError(
          streamError instanceof ModelStreamError
            ? streamError.message
            : "Không đọc được CV",
        );
      } finally {
        if (mounted.current) setPartial(null);
      }
    } catch (err) {
      if (!mounted.current) return;
      if (apiErrorStatus(err) === 401) {
        router.replace(LOGIN_NEXT);
        return;
      }
      setError(apiErrorMessage(err, "Không nộp được CV"));
    } finally {
      if (mounted.current) setUploading(false);
    }
  };

  /** Chạy lại lượt đọc CV trên bản nháp hiện có mà không cần nộp lại file. */
  const retry = async () => {
    if (!draft) return;
    setRetrying(true);
    setError(null);

    try {
      const restarted = await profileDraftService.retry(draft.id);
      if (!mounted.current) return;
      setDraft(restarted);
      void waitForDraft(restarted.id);
    } catch (err) {
      if (!mounted.current) return;
      if (apiErrorStatus(err) === 401) {
        router.replace(LOGIN_NEXT);
        return;
      }
      setError(apiErrorMessage(err, "Không chạy lại được lượt đọc"));
    } finally {
      if (mounted.current) setRetrying(false);
    }
  };

  const apply = async () => {
    if (!draft || selected.length === 0) return;
    setApplying(true);
    setError(null);

    try {
      const updated = await profileDraftService.apply(draft.id, selected);
      if (!mounted.current) return;
      setDraft(updated);
      setProfile(await profileService.get().catch(() => profile));
      toast.success("Đã ghi những trường bạn chọn vào hồ sơ.");
    } catch (err) {
      if (!mounted.current) return;
      if (apiErrorStatus(err) === 401) {
        router.replace(LOGIN_NEXT);
        return;
      }
      toast.danger(apiErrorMessage(err, "Không áp dụng được vào hồ sơ"));
    } finally {
      if (mounted.current) setApplying(false);
    }
  };

  const toggle = (field: ApplicableField) =>
    setSelected((current) =>
      current.includes(field)
        ? current.filter((item) => item !== field)
        : [...current, field],
    );

  const rows = draft?.proposal ? proposalRows(draft.proposal, profile) : [];
  const running =
    waiting || draft?.status === "PENDING" || draft?.status === "RUNNING";

  return {
    draft,
    loading,
    error,
    file,
    setFile,
    uploading,
    retrying,
    selected,
    applying,
    rows,
    partial,
    running,
    upload,
    retry,
    apply,
    toggle,
  };
}
