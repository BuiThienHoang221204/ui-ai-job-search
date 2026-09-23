"use client";

import { useState } from "react";
import { Clipboard, Sparkle } from "@phosphor-icons/react/ssr";
import type { JobMatchWithJob } from "@/types";
import type { ApplicationEmailInput } from "@/services";
import {
  JobSelect,
  PastedJobFields,
  usePastedJob,
} from "@/components/dashboard/document-job";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Tabs } from "@/components/ui/tabs";

type Source = "paste" | "pick";

const SOURCES = [
  { value: "paste", label: "Dán mô tả công việc" },
  { value: "pick", label: "Chọn tin đã có" },
];

/**
 * Chọn nguồn tin tuyển dụng cho mail: dán JD, hoặc lấy một tin đã chấm điểm.
 *
 * Dán JD là nhánh MẶC ĐỊNH, và đó là chủ ý: thao tác thật của người dùng là
 * copy mô tả từ một trang tuyển dụng bất kỳ rồi nhờ AI viết mail, chứ không
 * phải chờ tin đó được hệ thống quét về và chấm điểm xong.
 */
export function ApplicationEmailSourceCard({
  matches,
  fixedJobId,
  disabled,
  onSubmit,
}: {
  matches: JobMatchWithJob[];
  /** Vào từ trang chi tiết tin: khoá luôn vào tin đó, không cho đổi. */
  fixedJobId: string | null;
  disabled: boolean;
  onSubmit: (input: ApplicationEmailInput) => void;
}) {
  const [source, setSource] = useState<Source>(fixedJobId ? "pick" : "paste");
  const [jobId, setJobId] = useState(fixedJobId ?? "");
  const pasted = usePastedJob("email");

  const handleSubmit = () => {
    if (disabled) return;
    if (source === "pick") {
      if (jobId) onSubmit({ jobId });
      return;
    }
    if (pasted.ready) onSubmit(pasted.value);
  };

  return (
    <SectionCard
      compact
      icon={Clipboard}
      iconClassName="size-4"
      title="Tin tuyển dụng"
      description="Mail luôn viết cho một vị trí cụ thể. Dán mô tả công việc bạn copy được, hoặc chọn một tin hệ thống đã có."
      className="border-slate-200/90"
    >
      {!fixedJobId && (
        <Tabs
          tabs={SOURCES}
          value={source}
          onChange={(value) => setSource(value as Source)}
        />
      )}

      {source === "paste" ? (
        <div className="space-y-4">
          <PastedJobFields
            idPrefix="email"
            state={pasted}
            disabled={disabled}
            readyHint="JD này không được lưu thành tin tuyển dụng, chỉ dùng để viết mail."
          />
          <p className="text-xs text-slate-500">
            Tên công ty và vị trí đi thẳng vào tiêu đề mail nên bạn tự điền, hệ
            thống không đoán từ JD.
          </p>
        </div>
      ) : (
        <JobSelect
          selectId="email-job"
          matches={matches}
          value={jobId}
          onChange={setJobId}
          disabled={disabled || Boolean(fixedJobId)}
          emptyOptionLabel="— Chọn một công việc —"
          hint={
            matches.length === 0
              ? "Chưa có công việc nào được chấm điểm. Dán JD ở tab bên cạnh thì không cần chờ."
              : undefined
          }
        />
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          loading={disabled}
          disabled={source === "pick" ? !jobId : !pasted.ready}
        >
          <Sparkle className="size-4.5" />
          {disabled ? "Đang viết…" : "Viết mail ứng tuyển"}
        </Button>
      </div>
    </SectionCard>
  );
}
