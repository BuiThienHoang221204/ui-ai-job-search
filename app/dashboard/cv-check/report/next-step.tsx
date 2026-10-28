import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

/** Một việc nên làm tiếp: số thứ tự, tên việc, mô tả và nút hành động. */
export function NextStep({
  index,
  title,
  note,
  action,
}: {
  index: number;
  title: string;
  note: string;
  action: ReactNode;
}) {
  return (
    <Card className="grid items-center gap-3 px-5 py-4 sm:grid-cols-[1.75rem_minmax(0,1fr)_auto]">
      <span className="grid size-5.5 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
        {index}
      </span>
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{note}</p>
      </div>
      {action}
    </Card>
  );
}
