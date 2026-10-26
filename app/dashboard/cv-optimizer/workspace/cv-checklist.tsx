"use client";

import { useMemo, type ReactNode } from "react";
import { Briefcase, GraduationCap, Hash } from "@phosphor-icons/react/ssr";
import { useJobDetail } from "@/hooks/use-job-detail";
import { cvChecklist } from "@/lib/cv-checklist";
import { Progress } from "@/components/ui/progress";
import { useCvDraft } from "@/hooks/use-cv-draft";
import { KeywordChip } from "./keyword-chip";
import { TodoRow } from "./todo-row";

const ROW_ICONS = {
  experience: Briefcase,
  education: GraduationCap,
} as const;

/** Danh sách việc để CV sẵn sàng gửi; tự tính lại mỗi khi bản nháp đổi. */
export function CvChecklist({ jobId }: { jobId: string | null }) {
  const { data } = useJobDetail(jobId ?? "", Boolean(jobId));
  const content = useCvDraft((state) => state.content);
  const skipped = useCvDraft((state) => state.skipped);

  const keywords = useMemo(
    () =>
      (data?.job.systemMatch?.checks ?? [])
        .filter((check) => check.kind === "SKILL" || check.kind === "NICE")
        .map((check) => check.label),
    [data],
  );
  const { todos, done, total } = useMemo(
    () => cvChecklist(content, keywords, skipped),
    [content, keywords, skipped],
  );

  const keywordTodos = todos.filter((todo) => todo.kind === "keyword");
  const fieldTodos = todos.filter((todo) => todo.kind === "field");
  const metricTodos = todos.filter(
    (todo) => todo.kind === "metric" && !todo.done,
  );
  const left = total - done;

  let keywordSection: ReactNode;
  if (jobId === null) {
    keywordSection = (
      <p className="text-xs text-slate-500">
        CV tổng quát không nhắm tin nào nên không có từ khoá để đối chiếu.
      </p>
    );
  } else if (keywordTodos.length === 0) {
    keywordSection = (
      <p className="text-xs text-slate-500">
        Tin này chưa được phân tích yêu cầu nên chưa có từ khoá.
      </p>
    );
  } else {
    keywordSection = (
      <>
        <div className="flex flex-wrap gap-1.5">
          {keywordTodos.map((todo) => (
            <KeywordChip key={todo.id} todo={todo} />
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Bấm để thêm vào mục Kỹ năng — chỉ thêm kỹ năng bạn thật sự có; không
          phù hợp thì bấm × để bỏ qua.
        </p>
      </>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1.5 flex items-center gap-3">
          <Progress
            value={total ? (done / total) * 100 : 100}
            className="h-1.5"
          />
          <span className="shrink-0 text-xs text-slate-500">
            <b className="font-mono text-slate-700">
              {done}/{total}
            </b>{" "}
            việc
          </span>
        </div>
        <p className="text-xs text-slate-500">
          {left === 0
            ? "CV đã sẵn sàng để gửi."
            : `Còn ${left} việc. Danh sách tự cập nhật khi bạn sửa CV.`}
        </p>
      </div>

      <section>
        <h3 className="mb-2 text-2xs font-semibold tracking-wide text-slate-500 uppercase">
          Từ khoá của tin
          {keywordTodos.length > 0 && (
            <span className="ml-1 font-mono">
              · {keywordTodos.filter((todo) => todo.done).length}/
              {keywordTodos.length}
            </span>
          )}
        </h3>
        {keywordSection}
      </section>

      {fieldTodos.length > 0 && (
        <section>
          <h3 className="text-2xs font-semibold tracking-wide text-slate-500 uppercase">
            Cần bạn điền
          </h3>
          <p className="mb-1 text-xs text-slate-500">
            Hồ sơ chưa có nên PDF đang in câu giữ chỗ.
          </p>
          <ul>
            {fieldTodos.map((todo) => (
              <TodoRow
                key={todo.id}
                todo={todo}
                icon={
                  ROW_ICONS[todo.section as keyof typeof ROW_ICONS] ?? Briefcase
                }
              />
            ))}
          </ul>
        </section>
      )}

      {metricTodos.length > 0 && (
        <section>
          <h3 className="text-2xs font-semibold tracking-wide text-slate-500 uppercase">
            Thêm số liệu
          </h3>
          <p className="mb-1 text-xs text-slate-500">
            Có số thật thì thêm (thời gian, người dùng, %). Không có thì giữ
            nguyên, đừng bịa.
          </p>
          <ul>
            {metricTodos.map((todo) => (
              <TodoRow key={todo.id} todo={todo} icon={Hash} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
