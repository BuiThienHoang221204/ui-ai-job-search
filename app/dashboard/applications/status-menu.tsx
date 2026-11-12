import type { Application, ApplicationStatus } from "@/types";
import { APPLICATION_STATUS_LABELS, NEXT_STATUSES } from "@/lib/application-status";
import { SelectMenu } from "@/components/ui/select-menu";

/** Nút đổi trạng thái đơn sang các bước kế tiếp được phép. */
export function StatusMenu({
  application,
  variant,
  side,
  saving,
  onChange,
}: {
  application: Application;
  variant: "field" | "text";
  side: "top" | "bottom";
  saving: boolean;
  onChange: (next: ApplicationStatus) => void;
}) {
  return (
    <SelectMenu<"" | ApplicationStatus>
      variant={variant}
      side={side}
      align="right"
      label={saving ? "Đang lưu…" : "Đổi trạng thái…"}
      value=""
      disabled={saving}
      options={NEXT_STATUSES[application.status].map((next) => ({
        value: next,
        label: APPLICATION_STATUS_LABELS[next],
      }))}
      onChange={(next) => {
        if (next) onChange(next);
      }}
    />
  );
}
