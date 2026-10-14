"use client";

import { useState } from "react";
import { useLearning, useLearningActions } from "@/hooks/use-learning";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SkillGapCard } from "./skill-gap-card";

type Filter = "ALL" | "REQUIRED" | "NICE";

const PAGE = 12;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "REQUIRED", label: "Bắt buộc trong tin" },
  { value: "NICE", label: "Ưu tiên (có thì cộng điểm)" },
];

/** Danh sách kỹ năng nên học, xếp theo số tin yêu cầu; kỹ năng đã bỏ qua gom xuống cuối. */
export function SkillGapList() {
  const { data } = useLearning();
  const { busyKey, remove } = useLearningActions();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [limit, setLimit] = useState(PAGE);
  if (!data) return null;

  const visible = data.gaps.filter(
    (gap) =>
      gap.status !== "SKIPPED" && (filter === "ALL" || gap.kind === filter),
  );

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-lg font-semibold text-slate-900">Kỹ năng nên học</h2>
        <span className="text-xs text-slate-500">
          {visible.length} kỹ năng · xếp theo số tin yêu cầu
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setFilter(item.value);
              setLimit(PAGE);
            }}
            aria-pressed={filter === item.value}
            className={cn(
              "h-7 cursor-pointer rounded-full border px-3 text-xs transition-colors",
              filter === item.value
                ? "border-primary-300 bg-primary-50 text-primary-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-50",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2.5">
        {visible.length ? (
          visible
            .slice(0, limit)
            .map((gap) => (
              <SkillGapCard key={gap.key} gap={gap} jobsAnalysed={data.jobsAnalysed} />
            ))
        ) : (
          <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
            Không còn kỹ năng nào trong bộ lọc này.
          </p>
        )}
      </div>

      {visible.length > limit && (
        <Button
          variant="outline"
          className="mt-3 w-full"
          onClick={() => setLimit((current) => current + PAGE)}
        >
          Xem thêm {Math.min(PAGE, visible.length - limit)} kỹ năng ({visible.length - limit} còn lại)
        </Button>
      )}

      {data.skipped.length > 0 && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-slate-500">
            Không quan tâm ({data.skipped.length})
          </summary>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.skipped.map((item) => (
              <span
                key={item.skillKey}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700"
              >
                {item.skillName}
                <button
                  type="button"
                  disabled={busyKey === item.skillKey}
                  onClick={() => void remove(item.skillKey)}
                  className="cursor-pointer font-medium text-primary-700 hover:underline"
                >
                  Hiện lại
                </button>
              </span>
            ))}
          </div>
        </details>
      )}
    </Card>
  );
}
