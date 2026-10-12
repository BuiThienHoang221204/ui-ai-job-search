"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  documentsService,
  type CvLanguage,
  type CvSourceInput,
} from "@/services";
import { DocumentJobStatus } from "@/components/dashboard/document-job";
import { useDocumentJob } from "@/hooks/use-document-job";
import { CvGenerating } from "./cv-generating";
import { CvHome } from "./home/cv-home";
import { CvWorkspace } from "./workspace/cv-workspace";

const LOGIN_NEXT = "/dashboard/cv-optimizer";

/** Trang Tối ưu CV, ba trạng thái: danh sách và tạo mới, AI đang viết, sửa một CV (`?doc=`). */
export function CvOptimizerView() {
  const router = useRouter();
  const params = useSearchParams();
  const documentId = params.get("doc");
  const fixedJobId = params.get("jobId");

  const job = useDocumentJob(LOGIN_NEXT);
  const lastInput = useRef<[CvSourceInput, CvLanguage] | null>(null);
  const opened = useRef<string | null>(null);

  const generate = (input: CvSourceInput, language: CvLanguage) => {
    lastInput.current = [input, language];
    job.startStream(() => documentsService.createCv(input, true, language));
  };

  const finished = job.phase === "done" ? job.document?.id : undefined;
  useEffect(() => {
    if (!finished || opened.current === finished) return;
    opened.current = finished;
    router.push(`/dashboard/cv-optimizer?doc=${finished}`);
  }, [finished, router]);

  if (documentId)
    return <CvWorkspace key={documentId} documentId={documentId} />;
  if (job.phase === "generating") return <CvGenerating partial={job.partial} />;

  return (
    <div className="space-y-4">
      <DocumentJobStatus
        job={job}
        onRegenerate={() => lastInput.current && generate(...lastInput.current)}
      />
      <CvHome fixedJobId={fixedJobId} onGenerate={generate} />
    </div>
  );
}
