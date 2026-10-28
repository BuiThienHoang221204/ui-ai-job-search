import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { LegalTone } from "@/types";

const TONES: Record<LegalTone, string> = {
  primary: "bg-primary-50 text-primary-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  sky: "bg-sky-50 text-sky-600",
};

/** Ô vuông bo góc chứa icon theo tông màu, dùng ở thẻ tóm tắt, đầu mục và thẻ quyền trên trang pháp lý. */
export function IconBadge({
  icon: Icon,
  tone,
  className,
}: {
  icon: PhosphorIcon;
  tone: LegalTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-xl",
        TONES[tone],
        className,
      )}
    >
      <Icon className="size-[1.15rem]" />
    </span>
  );
}
