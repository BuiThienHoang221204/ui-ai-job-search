import { Check, ExclamationMark, X } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";
import type { CvCheckStatus } from "@/types";

const TONE: Record<CvCheckStatus, string> = {
  pass: "bg-emerald-50 text-emerald-600",
  warn: "bg-amber-50 text-amber-600",
  fail: "bg-rose-50 text-rose-600",
};

/** Chấm tròn nhỏ ✓ / ! / ✕ cho một điểm kiểm. */
export function StatusIcon({ status }: { status: CvCheckStatus }) {
  return (
    <span
      className={cn(
        "mt-0.5 grid size-4.5 place-items-center rounded-full",
        TONE[status],
      )}
    >
      {status === "pass" && <Check weight="bold" className="size-3" />}
      {status === "warn" && (
        <ExclamationMark weight="bold" className="size-3" />
      )}
      {status === "fail" && <X weight="bold" className="size-3" />}
    </span>
  );
}
