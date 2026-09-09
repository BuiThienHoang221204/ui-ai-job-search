"use client";

import { CircleNotch, MagnifyingGlass } from "@phosphor-icons/react/ssr";
import type { AgentReview } from "@/services";
import { Alert } from "@/components/ui/alert";
import { Markdown } from "@/components/ui/markdown";
import { SectionCard } from "@/components/ui/section-card";

export function AgentReviewCard({ review }: { review: AgentReview | null }) {
  if (!review) return null;

  return (
    <SectionCard
      compact
      icon={MagnifyingGlass}
      iconClassName="size-4 text-amber-600"
      title="Chuyên gia tuyển dụng phản biện"
      description={
        review.status === "PENDING"
          ? "Đang đọc lại hồ sơ — bạn không cần đợi, cứ dùng bản đã soạn"
          : "Góc nhìn của người sẽ loại hồ sơ bạn"
      }
      className="border-slate-200/90"
    >
      {review.status === "PENDING" && (
        <p className="flex items-center gap-2.5 rounded-xl border border-dashed border-slate-200 px-4 py-5 text-xs text-slate-500">
          <CircleNotch className="text-primary-600 size-4 shrink-0 animate-spin" />
          Một chuyên gia độc lập đang đọc lại CV và thư. Góp ý sẽ hiện ngay đây.
        </p>
      )}

      {review.status === "FAILED" && (
        <Alert tone="warning" title="Không phản biện được">
          {review.error} — hồ sơ vẫn dùng được bình thường, chỉ là thiếu vòng
          đọc lại.
        </Alert>
      )}

      {review.status === "DONE" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <Markdown text={review.critique} />
        </div>
      )}
    </SectionCard>
  );
}
