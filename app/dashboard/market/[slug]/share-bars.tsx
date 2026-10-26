/** Danh sách thanh ngang "tên — %" cho một mục của báo cáo thị trường. */
export function ShareBars({
  rows,
}: {
  rows: { name: string; percent: number }[];
}) {
  return (
    <div className="space-y-1">
      {rows.map((row) => (
        <div
          key={row.name}
          className="grid grid-cols-[minmax(0,9rem)_1fr_2.5rem] items-center gap-2 text-sm"
        >
          <span className="truncate text-slate-700">{row.name}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <span
              className="bg-primary-600 block h-full rounded-full"
              style={{ width: `${row.percent}%` }}
            />
          </span>
          <span className="text-right text-slate-600 tabular-nums">
            {row.percent}%
          </span>
        </div>
      ))}
    </div>
  );
}
