import type { PartialLetter } from "@/types";

/** Thư xin việc trình bày như một trang giấy; dùng cả khi AI đang viết (nhận bản nháp dở dang). */
export function LetterPaper({ letter }: { letter: PartialLetter }) {
  const paragraphs = [
    letter.opening,
    ...(letter.bodyParagraphs ?? []),
    letter.motivation,
    letter.closing,
  ].filter((part): part is string => Boolean(part));

  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-700">
      {letter.salutation && (
        <p className="font-semibold text-slate-900">{letter.salutation}</p>
      )}
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph}`}>{paragraph}</p>
      ))}
    </div>
  );
}
