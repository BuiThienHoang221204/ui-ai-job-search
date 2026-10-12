"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { apiErrorStatus } from "@/lib/axios";
import { invalidateAfter } from "@/lib/query-keys";
import { applicationsService, jobsService } from "@/services";
import type { Application } from "@/types";
import { toJobCard } from "@/lib/adapters";
import { Alert } from "@/components/ui/alert";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { CompanyBriefPanel } from "./company-brief/company-brief-panel";
import { JobDescriptionCard } from "./job-description-card";
import { JobDetailHeader } from "./job-detail-header";
import { MatchInsights } from "./match/match-insights";
import { MatchPanel } from "./match/match-panel";
import { SystemMatchCard } from "./match/system-match-card";
import { JobSectionNav } from "./job-section-nav";
import {
  afterSaveJob,
  updateJobDetail,
  useJobDetail,
} from "@/hooks/use-job-detail";
import { SalaryGuidePanel } from "./salary-guide-panel";
import { JobActionCards } from "@/components/dashboard/job-action-cards";
import { ResponsiveBannerAd } from "@/components/ads/ad-slot";
import { SkillResources } from "@/components/ads/affiliate-inline";
import { missingSkillsOf } from "@/lib/affiliate";

const APPLY_TOAST_DURATION = 60_000;

interface JobDetailViewProps {
  jobId: string;
  embedded?: boolean;
}
export function JobDetailView({ jobId, embedded }: JobDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [savePending, setSavePending] = useState<boolean | null>(null);
  const toast = useToast();
  const { data, error } = useJobDetail(jobId);

  const job = data?.job ?? null;
  const match = data?.match ?? null;
  const saved = savePending ?? job?.saved ?? false;
  const toggleSave = () => {
    const next = !saved;
    setSavePending(next);
    void (next ? jobsService.save(jobId) : jobsService.unsave(jobId))
      .then(() => {
        afterSaveJob(queryClient, jobId, next);
        setSavePending(null);
      })
      .catch(() => setSavePending(!next));
  };
  const setApplication = (application: Application) => {
    updateJobDetail(queryClient, jobId, (data) => ({
      ...data,
      job: {
        ...data.job,
        application: { id: application.id, status: application.status },
      },
    }));
    invalidateAfter(queryClient, "applicationStatus");
  };

  const handleApply = async () => {
    if (job?.application) {
      if (job?.url) window.open(job.url, "_blank", "noopener");
      return;
    }
    try {
      const result = await applicationsService.create(jobId, {
        skipDocuments: true,
      });
      setApplication(result);
      if (job?.url) window.open(job.url, "_blank", "noopener");
      toast.success(
        (dismiss) => (
          <span>
            Đã lưu tin này vào{" "}
            <Link
              href="/dashboard/applications"
              className="font-semibold text-slate-900 underline"
            >
              Lịch sử ứng tuyển
            </Link>{" "}
            (Đã xem). Nộp xong trên trang tuyển dụng thì bấm{" "}
            <button
              type="button"
              onClick={() => void markApplied(result.id, dismiss)}
              className="font-medium text-primary-600 underline hover:text-primary-700"
            >
              Tôi đã nộp đơn
            </button>
            .
          </span>
        ),
        { position: "bottom-right", duration: APPLY_TOAST_DURATION },
      );
    } catch (err) {
      if (apiErrorStatus(err) === 401) {
        router.replace(`/login?next=/dashboard/jobs/${jobId}`);
        return;
      }
      if (job?.url) window.open(job.url, "_blank", "noopener");
    }
  };

  const markApplied = async (applicationId: string, dismiss: () => void) => {
    try {
      setApplication(
        await applicationsService.updateStatus(applicationId, "APPLIED"),
      );
      dismiss();
    } catch {}
  };

  if (error) return <Alert tone="danger">{error}</Alert>;

  if (!job) return <JobDetailSkeleton />;
  const card = toJobCard({
    jobId: job.id,
    status: match?.status ?? "PENDING",
    overallScore: match?.overallScore ?? null,
    strengths: match?.strengths ?? [],
    job,
  });

  return (
    <div className="space-y-6">
      <ResponsiveBannerAd align="start" />

      <JobDetailHeader
        card={card}
        job={job}
        match={match}
        saved={saved}
        onToggleSave={toggleSave}
        onApply={handleApply}
      />

      <JobSectionNav jobId={jobId} />

      <MatchPanel jobId={jobId} />

      <MatchInsights jobId={jobId} />

      <SystemMatchCard jobId={jobId} />

      <JobActionCards
        id="chuan-bi"
        jobId={jobId}
        actions={["cv", "letter", "interview"]}
      />

      <div className={embedded ? "space-y-6" : "grid gap-6 lg:grid-cols-3"}>
        <div className={embedded ? "space-y-6" : "space-y-6 lg:col-span-2"}>
          <SkillResources
            jobId={job.id}
            occupation={job.occupationCode}
            skills={missingSkillsOf(job.systemMatch)}
          />

          <div id="mo-ta" className="scroll-mt-20">
            <JobDescriptionCard
              description={job.description}
              defaultOpen={
                !match || match.strengths.length + match.gaps.length === 0
              }
            />
          </div>
        </div>

        <div className="space-y-6">
          <SalaryGuidePanel guide={job.salaryGuide} />
          <div id="cong-ty" className="scroll-mt-20">
            <CompanyBriefPanel jobId={jobId} />
          </div>
        </div>
      </div>
    </div>
  );
}
function JobDetailSkeleton() {
  return (
    <SkeletonPage>
      <Skeleton className="h-44 rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-56" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </SkeletonPage>
  );
}
