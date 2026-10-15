"use client";

import { parseCvContent } from "@/lib/document-content";
import {
  DraftPlaceholder,
  GenerationProgress,
} from "@/components/documents/generation-progress";
import { CvContentView } from "./cv-content";
import type { PartialCv } from "@/types";

const STEPS = [
  { label: "Giới thiệu bản thân", of: (p: PartialCv) => p.profileStatement },
  {
    label: "Năng lực cốt lõi",
    of: (p: PartialCv) => p.coreCompetencies?.length,
  },
  {
    label: "Kinh nghiệm làm việc",
    of: (p: PartialCv) => p.experiences?.length,
  },
  { label: "Dự án", of: (p: PartialCv) => p.projects?.length },
  { label: "Học vấn", of: (p: PartialCv) => p.educations?.length },
  { label: "Nhóm kỹ năng", of: (p: PartialCv) => p.skillGroups?.length },
] as const;

/** Màn chờ trong lúc AI viết CV. */
export function CvGenerating({ partial }: { partial: PartialCv | null }) {
  return (
    <GenerationProgress
      title="Đang viết CV của bạn"
      hint="Mục nào xong sẽ hiện ngay bên phải. Bạn có thể rời trang — CV vẫn được viết tiếp và nằm trong “CV của bạn”."
      expectedSeconds={60}
      steps={STEPS.map(({ label, of }) => {
        const value = partial ? of(partial) : undefined;
        return {
          label,
          done: typeof value === "number" ? value > 0 : Boolean(value),
        };
      })}
    >
      {partial ? (
        <CvContentView cv={parseCvContent(partial)} />
      ) : (
        <DraftPlaceholder />
      )}
    </GenerationProgress>
  );
}
