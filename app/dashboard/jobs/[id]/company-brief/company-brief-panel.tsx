"use client";

import { BriefLiveProgress, type PartialBrief } from "./brief-live-progress";
import { streamModel } from "@/lib/model-stream";
import { BriefBody, Signals } from "./company-brief-body";
import { useState } from "react";
import { ArrowsClockwise, Buildings } from "@phosphor-icons/react/ssr";
import { companiesService } from "@/services";

import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { isBriefPending } from "@/lib/company-brief";
import { apiErrorMessage } from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { useToast } from "@/components/ui/toast";

const POLL_MS = 2_500;

interface CompanyBriefPanelProps {
  jobId: string;
}

/** Thẻ "Về công ty này" trên trang chi tiết tin, có query riêng. */
export function CompanyBriefPanel({ jobId }: CompanyBriefPanelProps) {
  const toast = useToast();
  const [pendingSince, setPendingSince] = useState<string | null | undefined>(
    undefined,
  );
  const [partial, setPartial] = useState<PartialBrief | null>(null);

  const { data, error, reload } = useApiQuery(
    keys.companyBrief(jobId),
    () => companiesService.briefForJob(jobId),
    {
      errorMessage: "Không tải được thông tin công ty",
      refetchInterval: pendingSince !== undefined ? POLL_MS : false,
    },
  );

  if (error || !data || !data.researchable) return null;

  const brief = data.brief;
  const waiting = isBriefPending(pendingSince, brief?.updatedAt ?? null);

  async function research(force: boolean) {
    setPendingSince(brief?.updatedAt ?? null);
    setPartial(null);
    try {
      await streamModel<unknown, PartialBrief>({
        path: `/companies/brief/by-job/${jobId}/stream`,
        onPartial: setPartial,
        force,
      });
      setPendingSince(undefined);
      reload();
    } catch (err: unknown) {
      try {
        await companiesService.refreshForJob(jobId, force);
        reload();
      } catch {
        setPendingSince(undefined);
        toast.danger(apiErrorMessage(err, "Không xếp được lượt tìm hiểu"));
      }
    } finally {
      setPartial(null);
    }
  }

  return (
    <SectionCard
      title="Về công ty này"
      description={data.company}
      icon={Buildings}
      compact
      actions={brief ? <Signals brief={brief} /> : null}
    >

      {!brief && waiting && <BriefLiveProgress partial={partial} />}

      {!brief && !waiting && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Chưa có thông tin đánh giá. Hệ thống sẽ tra các trang đánh giá công
            khai và tóm tắt lại — mất khoảng một phút.
          </p>
          <Button size="sm" onClick={() => void research(false)}>
            Tìm hiểu công ty này
          </Button>
        </div>
      )}

      {brief && <BriefBody brief={brief} stale={data.stale} />}

      {brief && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-500">
            {data.stale ? "Thông tin đã cũ" : "Cập nhật"}{" "}
            {new Date(brief.updatedAt).toLocaleDateString("vi-VN")}
          </span>
          <Button
            size="sm"
            variant="ghost"
            disabled={waiting}
            onClick={() => void research(true)}
          >
            <ArrowsClockwise className="size-4" />
            {waiting ? "Đang tra..." : "Làm mới"}
          </Button>
        </div>
      )}
    </SectionCard>
  );
}
