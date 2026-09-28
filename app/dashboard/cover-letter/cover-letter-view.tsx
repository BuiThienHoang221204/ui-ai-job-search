"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { matchesService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { PageHeader } from "@/components/dashboard/page-header";
import { PageError } from "@/components/ui/alert";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { ApplicationEmailPanel } from "./application-email-panel";
import { CoverLetterPanel } from "./cover-letter-panel";

const LOGIN_NEXT = "/dashboard/cover-letter";

const MATCH_LIMIT = 50;

type Kind = "email" | "letter";

const KINDS = [
  { value: "email", label: "Mail ứng tuyển" },
  { value: "letter", label: "Thư xin việc (PDF)" },
];

/** Màn viết thư với hai tab: mail ứng tuyển và thư xin việc trang trọng. */
export function CoverLetterView() {
  const fixedJobId = useSearchParams().get("jobId");

  const [kind, setKind] = useState<Kind>(fixedJobId ? "letter" : "email");

  const page = useApiQuery(
    keys.matchList(MATCH_LIMIT),
    () => matchesService.list({ limit: MATCH_LIMIT }),
    { errorMessage: "Không tải được danh sách công việc" },
  );

  if (page.error)
    return <PageError title="Không tải được dữ liệu" message={page.error} />;

  const matches = page.data?.items ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={fixedJobId ? "Viết cho tin này" : "Thư đã viết"}
        subtitle={
          fixedJobId
            ? "AI viết dựa trên hồ sơ của bạn và đúng tin tuyển dụng bên dưới"
            : "Mail ứng tuyển gửi thẳng cho nhà tuyển dụng, hoặc thư xin việc trang trọng để đính kèm"
        }
      />

      <Tabs
        tabs={KINDS}
        value={kind}
        onChange={(value) => setKind(value as Kind)}
      />

      {!matches ? (
        <SkeletonPage>
          <Skeleton className="h-72" />
          <Skeleton className="h-56" />
        </SkeletonPage>
      ) : kind === "email" ? (
        <ApplicationEmailPanel
          matches={matches}
          fixedJobId={fixedJobId}
          loginNext={LOGIN_NEXT}
        />
      ) : (
        <CoverLetterPanel
          matches={matches}
          fixedJobId={fixedJobId}
          loginNext={LOGIN_NEXT}
        />
      )}
    </div>
  );
}
