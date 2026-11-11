import { matchRange } from "@/lib/text";

/** Tô đậm phần chữ khớp từ khoá (so không dấu) trong một gợi ý. */
export function MatchHighlight({ text, needle }: { text: string; needle: string }) {
  const range = matchRange(text, needle);
  if (!range) return <>{text}</>;
  return (
    <>
      {text.slice(0, range[0])}
      <b className="font-semibold text-slate-900">
        {text.slice(range[0], range[1])}
      </b>
      {text.slice(range[1])}
    </>
  );
}
