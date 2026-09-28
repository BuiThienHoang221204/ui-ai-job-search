import { cn } from "@/utils";
import type { MockInterviewStatus } from "@/services";

const STYLES: Record<MockInterviewStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Đang xếp hàng",
    className: "bg-slate-100 text-slate-600",
  },
  RUNNING: {
    label: "Đang chạy",
    className: "bg-primary-50 text-primary-700",
  },
  WAITING_USER: {
    label: "Chờ bạn trả lời",
    className: "bg-amber-100 text-amber-900 ring-1 ring-amber-300",
  },
  DONE: { label: "Hoàn tất", className: "bg-emerald-50 text-emerald-700" },
  FAILED: { label: "Thất bại", className: "bg-rose-50 text-rose-700" },
};

/** Huy hiệu trạng thái của một buổi phỏng vấn thử. */
export function InterviewStatusBadge({ status }: { status: MockInterviewStatus }) {
  const style = STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        style.className,
      )}
    >
      {style.label}
    </span>
  );
}
