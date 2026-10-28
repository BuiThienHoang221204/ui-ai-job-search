/** Tiêu đề một phần của báo cáo, kèm số mục và dòng mô tả. */
export function ReportHeading({
  title,
  count,
  sub,
}: {
  title: string;
  count?: number;
  sub?: string;
}) {
  return (
    <div>
      <h2 className="font-display text-xl text-slate-900">
        {title}
        {count !== undefined && (
          <span className="ml-1.5 font-sans text-sm text-slate-500">
            {count}
          </span>
        )}
      </h2>
      {sub && <p className="mt-0.5 text-sm text-slate-500">{sub}</p>}
    </div>
  );
}
