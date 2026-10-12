"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Tabs } from "@/components/ui/tabs";
import { ApplicationEmailPanel } from "./application-email-panel";
import { CoverLetterPanel } from "./cover-letter-panel";

const LOGIN_NEXT = "/dashboard/cover-letter";

type Kind = "email" | "letter";

const KINDS = [
  { value: "email", label: "Mail ứng tuyển" },
  { value: "letter", label: "Thư xin việc (PDF)" },
];

/** Màn viết thư với hai tab: mail ứng tuyển và thư xin việc trang trọng. */
export function CoverLetterView() {
  const fixedJobId = useSearchParams().get("jobId");

  const [kind, setKind] = useState<Kind>(fixedJobId ? "letter" : "email");

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

      {kind === "email" ? (
        <ApplicationEmailPanel fixedJobId={fixedJobId} loginNext={LOGIN_NEXT} />
      ) : (
        <CoverLetterPanel fixedJobId={fixedJobId} loginNext={LOGIN_NEXT} />
      )}
    </div>
  );
}
