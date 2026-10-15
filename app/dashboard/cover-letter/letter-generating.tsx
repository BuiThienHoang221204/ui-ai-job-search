"use client";

import {
  DraftPlaceholder,
  GenerationProgress,
} from "@/components/documents/generation-progress";
import type { LetterKind, PartialLetter } from "@/types";
import { LetterPaper } from "./workspace/letter-paper";

const LETTER_STEPS = [
  { label: "Lời chào", of: (p: PartialLetter) => p.salutation },
  { label: "Đoạn mở", of: (p: PartialLetter) => p.opening },
  { label: "Thân bài", of: (p: PartialLetter) => p.bodyParagraphs?.length },
  { label: "Vì sao công ty này", of: (p: PartialLetter) => p.motivation },
  { label: "Đoạn kết", of: (p: PartialLetter) => p.closing },
] as const;

const EMAIL_STEPS = [
  { label: "Đọc tin và hồ sơ của bạn", done: false },
  { label: "Viết tiêu đề và thân mail", done: false },
];

/** Màn chờ trong lúc AI viết thư (hiện dần từng đoạn) hoặc mail (chạy nền, xong mới hiện). */
export function LetterGenerating({
  kind,
  partial,
}: {
  kind: LetterKind | null;
  partial: PartialLetter | null;
}) {
  if (kind === "APPLICATION_EMAIL") {
    return (
      <GenerationProgress
        title="Đang viết mail ứng tuyển"
        hint="Mail hiện ra khi viết xong. Bạn có thể rời trang — mail vẫn được viết tiếp và nằm trong “Thư của bạn”."
        expectedSeconds={45}
        steps={EMAIL_STEPS}
      >
        <DraftPlaceholder />
      </GenerationProgress>
    );
  }

  return (
    <GenerationProgress
      title="Đang viết thư xin việc"
      hint="Đoạn nào xong sẽ hiện ngay bên phải. Bạn có thể rời trang — thư vẫn được viết tiếp và nằm trong “Thư của bạn”."
      expectedSeconds={58}
      steps={LETTER_STEPS.map(({ label, of }) => {
        const value = partial ? of(partial) : undefined;
        return {
          label,
          done: typeof value === "number" ? value > 0 : Boolean(value),
        };
      })}
    >
      {partial ? <LetterPaper letter={partial} /> : <DraftPlaceholder />}
    </GenerationProgress>
  );
}
