/** Ảnh thu nhỏ một tờ CV, dải đầu tô màu nhấn của mẫu. */
export function PaperThumb({ accent = "#4952ff" }: { accent?: string }) {
  return (
    <span className="grid h-[4.5rem] w-14 content-start gap-1 rounded-md border border-slate-200 bg-white p-1.5 shadow-sm">
      <span
        className="h-1.5 w-3/5 rounded-sm"
        style={{ backgroundColor: accent }}
      />
      {[100, 80, 100, 55, 90].map((width, index) => (
        <span
          key={index}
          className="h-[3px] rounded-sm bg-slate-200"
          style={{ width: `${width}%` }}
        />
      ))}
    </span>
  );
}
