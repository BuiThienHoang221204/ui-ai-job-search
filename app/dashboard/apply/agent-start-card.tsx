"use client";

import { useState } from "react";
import { LinkSimple, Robot, Sparkle } from "@phosphor-icons/react/ssr";
import type { AgentRunInput } from "@/services";
import { useDraftState } from "@/hooks/use-draft-state";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/form";
import { SectionCard } from "@/components/ui/section-card";
import { Tabs } from "@/components/ui/tabs";

/** Sàn của backend cho JD dán tay. Giữ khớp với `StartAgentDto`. */
const MIN_JD_LENGTH = 50;

type Source = "paste" | "url";

const SOURCES = [
  { value: "paste", label: "Dán mô tả công việc" },
  { value: "url", label: "Dán link tin tuyển dụng" },
];

/**
 * Điểm khởi động một lượt chạy: nguồn tin, ghi chú, rồi bấm.
 *
 * Nội dung ba ô được giữ qua `useDraftState`, vì một lượt chạy mất vài phút và
 * người dùng hay chuyển tab trong lúc chờ.
 */
export function AgentStartCard({
  disabled,
  onStart,
}: {
  disabled: boolean;
  onStart: (input: AgentRunInput) => void;
}) {
  const [source, setSource] = useState<Source>("paste");
  const [jobDescription, setJobDescription] = useDraftState("agent-jd");
  const [jobUrl, setJobUrl] = useDraftState("agent-url");
  const [note, setNote] = useDraftState("agent-note");
  const [coverLetter, setCoverLetter] = useState(false);

  const jd = jobDescription.trim();
  const url = jobUrl.trim();
  const ready = source === "paste" ? jd.length >= MIN_JD_LENGTH : url !== "";

  const handleStart = () => {
    if (disabled || !ready) return;
    const common = {
      workflow: "apply",
      note: note.trim() || undefined,
      coverLetter,
    };
    onStart(
      source === "paste"
        ? { ...common, jobDescription: jd }
        : { ...common, jobUrl: url },
    );
  };

  return (
    <SectionCard
      compact
      icon={Robot}
      iconClassName="size-4"
      title="Chạy quy trình ứng tuyển"
      description="AI sẽ tự đánh giá độ phù hợp, hỏi ý bạn và soạn CV. Một chuyên gia tuyển dụng đọc lại và góp ý ngay sau đó, bạn không phải đợi."
      className="border-slate-200/90"
    >
      <Tabs
        tabs={SOURCES}
        value={source}
        onChange={(value) => setSource(value as Source)}
      />

      {source === "paste" ? (
        <div>
          <Label htmlFor="agent-jd">Mô tả công việc (JD)</Label>
          <Textarea
            id="agent-jd"
            rows={8}
            value={jobDescription}
            disabled={disabled}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Dán toàn bộ mô tả công việc vào đây…"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            {jd.length < MIN_JD_LENGTH
              ? `Cần ít nhất ${MIN_JD_LENGTH} ký tự (đang có ${jd.length}).`
              : `${jd.length} ký tự.`}
          </p>
        </div>
      ) : (
        <div>
          <Label htmlFor="agent-url">Link tin tuyển dụng</Label>
          <Input
            id="agent-url"
            value={jobUrl}
            disabled={disabled}
            onChange={(event) => setJobUrl(event.target.value)}
            placeholder="https://…"
          />
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
            <LinkSimple className="size-4" />
            AI sẽ tự tải trang này. Nếu portal chặn máy tự động thì hãy dán chữ
            ở tab bên cạnh.
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="agent-note">Ghi chú cho AI (không bắt buộc)</Label>
        <Input
          id="agent-note"
          value={note}
          disabled={disabled}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Ví dụ: tôi chấp nhận đi làm ở Hà Nội"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-white p-3.5 text-sm text-slate-700">
        <input
          type="checkbox"
          className="accent-primary-600 mt-0.5 size-4 cursor-pointer"
          checked={coverLetter}
          disabled={disabled}
          onChange={(event) => setCoverLetter(event.target.checked)}
        />
        <span>
          Soạn kèm thư xin việc
          <span className="mt-0.5 block text-xs text-slate-500">
            Phần lớn tin trên TopCV, ITviec hay VietnamWorks không đòi thư. Bật
            lên thì lượt chạy lâu hơn khoảng một phần tư.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {coverLetter
            ? "Soạn cả CV lẫn thư nên mất lâu hơn. CV xong là hiện ra ngay, không phải đợi hết lượt."
            : "CV xong là hiện ra ngay, không phải đợi hết lượt chạy."}
        </p>
        <Button onClick={handleStart} loading={disabled} disabled={!ready}>
          <Sparkle className="size-4.5" />
          {disabled ? "Đang chạy…" : "Bắt đầu"}
        </Button>
      </div>
    </SectionCard>
  );
}
