"use client";

import {
  ArrowCounterClockwise,
  Check,
  CircleNotch,
  FilePdf,
  Info,
  ListBullets,
  LockSimple,
  TextT,
} from "@phosphor-icons/react/ssr";
import { failureMessage, isWorthRetrying } from "@/lib/failure-message";
import { DashSection } from "@/components/ui/dash-section";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PdfDropZone } from "@/components/ui/pdf-drop-zone";
import type { PartialProposal, ProfileDraftRecord } from "@/types";

const LIVE_ROWS = [
  {
    label: "Chức danh, giới thiệu",
    of: (p: PartialProposal) => (p.headline || p.summary ? "xong" : ""),
  },
  {
    label: "Kỹ năng",
    of: (p: PartialProposal) =>
      p.primarySkills?.length ? `${p.primarySkills.length} kỹ năng` : "",
  },
  {
    label: "Kinh nghiệm làm việc",
    of: (p: PartialProposal) =>
      p.experiences?.length ? `${p.experiences.length} mục` : "",
  },
  {
    label: "Học vấn",
    of: (p: PartialProposal) =>
      p.educations?.length ? `${p.educations.length} mục` : "",
  },
];

/** Tên file và danh sách phần AI đã đọc xong, hiện dần theo stream. */
function Reading({
  file,
  draft,
  partial,
}: {
  file: File | null;
  draft: ProfileDraftRecord | null;
  partial: PartialProposal | null;
}) {
  const name = file?.name ?? draft?.filename ?? "CV";
  return (
    <div>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-3">
        <FilePdf weight="duotone" className="size-8 shrink-0 text-rose-500" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {name}
          </p>
          {file && (
            <p className="text-xs text-slate-500">
              {Math.max(1, Math.round(file.size / 1024))} KB
            </p>
          )}
        </div>
      </div>
      <ul className="mt-3 divide-y divide-slate-100">
        {LIVE_ROWS.map((row) => {
          const done = partial ? row.of(partial) : "";
          return (
            <li
              key={row.label}
              className="flex items-center gap-2.5 py-2.5 text-sm"
            >
              {done ? (
                <Check
                  weight="bold"
                  className="size-4.5 shrink-0 text-emerald-600"
                />
              ) : (
                <CircleNotch className="size-4.5 shrink-0 animate-spin text-primary-400" />
              )}
              <span className={done ? "text-slate-800" : "text-slate-500"}>
                {row.label}
              </span>
              {done && (
                <span className="ml-auto text-xs text-slate-500">{done}</span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
        Thường mất 20–60 giây. Bạn có thể rời trang, đọc xong kết quả vẫn chờ ở
        đây.
      </p>
    </div>
  );
}

/** Màn tải lên: ô kéo thả, hoặc tiến độ đọc khi đang chạy; kèm báo lỗi lượt đọc trước nếu có. */
export function UploadPanel({
  reading,
  file,
  draft,
  partial,
  onPick,
  onRetry,
}: {
  reading: boolean;
  file: File | null;
  draft: ProfileDraftRecord | null;
  partial: PartialProposal | null;
  onPick: (file: File) => void;
  onRetry: () => void;
}) {
  const failed = !reading && draft?.status === "FAILED";

  return (
    <Card className="p-5">
      {failed && (
        <Alert
          tone="danger"
          title="Lần đọc trước không thành công"
          className="mb-4"
        >
          <p>{failureMessage(draft.failureKind)}</p>
          {isWorthRetrying(draft.failureKind) && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3"
            >
              <ArrowCounterClockwise className="size-4" />
              Thử đọc lại file cũ
            </Button>
          )}
        </Alert>
      )}
      {reading ? (
        <Reading file={file} draft={draft} partial={partial} />
      ) : (
        <PdfDropZone onPick={onPick} />
      )}
    </Card>
  );
}

const TIPS = [
  {
    icon: TextT,
    title: "Cần PDF có chữ chọn được",
    detail:
      "Bản xuất từ Word, Canva, TopCV đều được. Ảnh chụp hay bản scan chưa đọc được.",
  },
  {
    icon: ListBullets,
    title: "AI đọc gì",
    detail:
      "Chức danh, giới thiệu, kỹ năng, kinh nghiệm, dự án, học vấn, chứng chỉ.",
  },
  {
    icon: LockSimple,
    title: "Bạn xem lại trước",
    detail: "Hồ sơ chỉ đổi khi bạn bấm Lưu.",
  },
];

/** Cột phải màn tải lên: vài điều cần biết trước khi nộp CV. */
export function UploadTips() {
  return (
    <Card>
      <DashSection title="Trước khi tải lên" icon={Info}>
        <ul className="grid gap-3">
          {TIPS.map((tip) => (
            <li
              key={tip.title}
              className="grid grid-cols-[1.875rem_minmax(0,1fr)] gap-2.5 text-sm"
            >
              <span className="flex size-7.5 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <tip.icon className="size-4" />
              </span>
              <span>
                <b className="block font-semibold text-slate-900">
                  {tip.title}
                </b>
                <span className="text-slate-600">{tip.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </DashSection>
    </Card>
  );
}
