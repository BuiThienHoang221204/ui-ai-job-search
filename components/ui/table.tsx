import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Bảng dữ liệu. Mặc định cuộn ngang khi tràn; đặt `scrollable={false}` cho bảng đã vừa khung (table-fixed) để menu con không bị khung cuộn cắt. */
export function Table({
  className,
  scrollable = true,
  ...props
}: HTMLAttributes<HTMLTableElement> & { scrollable?: boolean }) {
  return (
    <div className={scrollable ? "w-full overflow-x-auto" : "w-full"}>
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

/** Phần đầu bảng. */
export function TableHeader({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-slate-50/80", className)} {...props} />;
}

/** Phần thân bảng. */
export function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("divide-y divide-slate-100", className)} {...props} />
  );
}

/** Một hàng của bảng. */
export function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("transition-colors hover:bg-slate-50/60", className)}
      {...props}
    />
  );
}

/** Ô tiêu đề cột. */
export function TableHead({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-10 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-slate-500",
        className,
      )}
      {...props}
    />
  );
}

/** Ô dữ liệu của bảng. */
export function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-4 py-3 align-middle text-slate-700", className)}
      {...props}
    />
  );
}
