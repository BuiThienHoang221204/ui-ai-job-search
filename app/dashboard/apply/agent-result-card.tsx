"use client";

import { Check, ClipboardText, Copy } from "@phosphor-icons/react/ssr";
import type { AgentRunRecord } from "@/services";
import { useCopy } from "@/hooks/use-copy";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { SectionCard } from "@/components/ui/section-card";

/**
 * Câu kết luận của agent, chỉ có nghĩa khi lượt chạy đã dừng.
 *
 * File agent ghi ra KHÔNG nằm ở đây mà ở `AgentFilesCard` phía trên: chúng có
 * ích ngay lúc vừa lưu xong, còn khối này thì phải đợi tới cuối.
 */
export function AgentResultCard({ run }: { run: AgentRunRecord }) {
  const { copied, copy } = useCopy();

  const text = run.result?.text ?? "";
  const artifacts = run.result?.artifacts ?? [];

  return (
    <SectionCard
      compact
      icon={ClipboardText}
      iconClassName="size-4 text-emerald-600"
      title="Kết quả"
      description={
        run.finishedAt ? `Xong · ${artifacts.length} file` : "Đang cập nhật"
      }
      className="border-slate-200/90"
      actions={
        text ? (
          <Button variant="outline" size="sm" onClick={() => copy("result", text)}>
            {copied === "result" ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied === "result" ? "Đã sao chép" : "Sao chép"}
          </Button>
        ) : undefined
      }
    >
      {text ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <Markdown text={text} />
        </div>
      ) : (
        <Alert tone="warning">
          Lượt chạy kết thúc nhưng agent không viết câu kết luận nào. Xem bảng
          các bước ở trên để biết nó đã đi tới đâu.
        </Alert>
      )}

      <p className="text-xs text-slate-400">
        Nội dung do AI sinh — đọc lại trước khi gửi cho nhà tuyển dụng.
      </p>
    </SectionCard>
  );
}
