import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/utils";

/** Một phần trong tấm nền của trang Tổng quan: tiêu đề kèm icon, hành động bên phải, rồi nội dung. */
export function DashSection({
  title,
  icon: TitleIcon,
  action,
  children,
  className,
}: {
  title: string;
  icon?: Icon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0 p-5", className)}>
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
          {TitleIcon && <TitleIcon className="size-4.5 text-primary-600" />}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
