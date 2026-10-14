"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import {
  interviewService,
  type AnswerKind,
  type InterviewPrepRecord,
  type SavedAnswer,
} from "@/services";

const POLL_MS = 2500;

/** Bộ câu hỏi còn đang chờ hoặc đang soạn. */
export const isPrepBusy = (status: string) =>
  status === "PENDING" || status === "RUNNING";

/** Vị trí đang mở nằm trên URL (`?job=`) để danh sách, hộp thêm vị trí và trang phỏng vấn thử cùng trỏ về được. */
export function useSelectedJob(): [string | null, (jobId: string) => void] {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const select = useCallback(
    (jobId: string) => {
      const next = new URLSearchParams(params.toString());
      next.set("job", jobId);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  return [params.get("job"), select];
}

/** Nội dung đầy đủ của một bộ câu hỏi; tự hỏi lại khi bộ đề còn đang soạn. */
export function useInterviewPrep(jobId: string | null) {
  return useApiQuery(
    keys.interviewPrep(jobId ?? ""),
    () => interviewService.get(jobId!),
    {
      errorMessage: "Không tải được bộ câu hỏi",
      enabled: jobId !== null,
      refetchInterval: (data) =>
        data && isPrepBusy(data.status) ? POLL_MS : false,
    },
  );
}

/** Ghi câu trả lời vừa lưu vào cache của bộ đề, rồi cho danh sách đọc lại mức sẵn sàng. */
export function usePrepCache(jobId: string) {
  const client = useQueryClient();

  const putAnswer = useCallback(
    (kind: AnswerKind, index: number, answer: SavedAnswer | null) => {
      client.setQueryData<InterviewPrepRecord>(
        keys.interviewPrep(jobId),
        (prep) => {
          if (!prep) return prep;
          const others = prep.answers.filter(
            (item) => item.kind !== kind || item.index !== index,
          );
          const answers = answer
            ? [...others, { ...answer, kind, index }]
            : others;
          return { ...prep, answers, practiced: answers.length };
        },
      );
      void client.invalidateQueries({ queryKey: keys.interviewLists() });
    },
    [client, jobId],
  );

  return { putAnswer };
}

/** Đọc lại mọi truy vấn của trang phỏng vấn sau một thao tác ghi. */
export function useInterviewRefresh() {
  const client = useQueryClient();
  return useCallback(() => {
    void client.invalidateQueries({ queryKey: keys.interview() });
  }, [client]);
}
