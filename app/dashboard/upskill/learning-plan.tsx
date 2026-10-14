"use client";

import { useLearning } from "@/hooks/use-learning";
import { Card } from "@/components/ui/card";
import { LearningPlanItem } from "./learning-plan-item";

const MAX_LEARNING = 3;

/** Kế hoạch của người dùng: tối đa 3 kỹ năng đang học, mỗi kỹ năng 3 mốc. */
export function LearningPlan() {
  const { data } = useLearning();
  if (!data) return null;
  const learning = data.plan.filter((item) => item.status === "LEARNING").length;

  return (
    <Card className="space-y-3 p-4 sm:p-5">
      <div>
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-lg font-semibold text-slate-900">Kế hoạch của bạn</h2>
          <span className="text-xs text-slate-500">
            {learning}/{MAX_LEARNING} kỹ năng
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Tập trung tối đa {MAX_LEARNING} kỹ năng cùng lúc. Xong mốc cuối thì kỹ năng tự vào hồ sơ.
        </p>
      </div>

      {data.plan.length ? (
        data.plan.map((item) => <LearningPlanItem key={item.skillKey} item={item} />)
      ) : (
        <p className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-center text-sm text-slate-500">
          Chưa có kỹ năng nào. Bấm <strong>Học kỹ năng này</strong> ở danh sách — nên chọn cái
          có nhiều tin gần đạt nhất.
        </p>
      )}

      {learning >= MAX_LEARNING && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
          Kế hoạch đã đủ {MAX_LEARNING} kỹ năng. Hoàn thành hoặc bỏ bớt một kỹ năng để thêm cái mới.
        </p>
      )}
    </Card>
  );
}
