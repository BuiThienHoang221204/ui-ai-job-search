"use client";

import Link from "next/link";
import { GraduationCap } from "@phosphor-icons/react/ssr";
import { useLearning } from "@/hooks/use-learning";
import { useSyncedSticky } from "@/hooks/use-synced-sticky";
import { EXPERIENCE_LEVELS } from "@/lib/profile-form";
import { PageHeader } from "@/components/ui/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { LearningPlan } from "./learning-plan";
import { SkillGapList } from "./skill-gap-list";
import { SoftGaps } from "./soft-gaps";

/** Trang Lộ trình học: kỹ năng nên học (đếm bằng code), kế hoạch của người dùng, và phần gợi ý do AI viết. */
export function UpskillView() {
  const { data, error } = useLearning();
  const [attachPanel, attachContainer] = useSyncedSticky();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lộ trình học"
        subtitle="Kỹ năng nhà tuyển dụng trong ngành của bạn hay đòi mà hồ sơ chưa có — học cái nào mở được nhiều việc nhất"
      />

      {error ? (
        <Alert tone="danger">{error}</Alert>
      ) : !data ? (
        <Skeleton className="h-96" />
      ) : data.needsOccupation ? (
        <Card>
          <EmptyState
            icon={GraduationCap}
            title="Chọn ngành nghề để xem kỹ năng còn thiếu"
            description="Lộ trình học so hồ sơ của bạn với các tin tuyển dụng đúng ngành và cấp bậc. Tải CV lên hoặc chọn ngành là có ngay, không phải chờ."
            action={
              <Link href="/dashboard">
                <Button>Chọn ngành nghề</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          <p className="-mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>
              Ngành{" "}
              <b className="font-semibold text-slate-800">
                {data.occupationName ?? data.occupationCode}
              </b>
            </span>
            {data.subOccupationNames.length > 0 && (
              <span>
                Nghề{" "}
                <b className="font-semibold text-slate-800">
                  {data.subOccupationNames.join(" · ")}
                </b>
              </span>
            )}
            {data.experienceLevel && (
              <span>
                Cấp bậc{" "}
                <b className="font-semibold text-slate-800">
                  {EXPERIENCE_LEVELS.find(
                    (level) => level.value === data.experienceLevel,
                  )?.label ?? data.experienceLevel}{" "}
                  · lệch tối đa một bậc
                </b>
              </span>
            )}
            <span>
              Dựa trên{" "}
              <b className="font-semibold text-slate-800">
                {data.jobsAnalysed} tin
              </b>{" "}
              trong 30 ngày
            </span>
            <span>Tự cập nhật khi có tin mới hoặc hồ sơ đổi</span>
          </p>

          <div
            ref={attachContainer}
            className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start"
          >
            <div className="min-w-0 space-y-4">
              <SkillGapList />
              <SoftGaps />
            </div>
            <div
              ref={attachPanel}
              className="order-first lg:sticky lg:order-none"
            >
              <LearningPlan />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
