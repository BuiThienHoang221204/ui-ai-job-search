"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { documentsService } from "@/services";
import { DocumentJobStatus } from "@/components/documents";
import { useDocumentJob } from "@/hooks/use-document-job";
import type { LetterKind, PartialLetter, ApplicationEmailInput } from "@/types";
import { LetterHero } from "./home/letter-hero";
import { LetterList } from "./home/letter-list";
import { LetterSuggestions } from "./home/letter-suggestions";
import { LetterGenerating } from "./letter-generating";
import { LetterWorkspace } from "./workspace/letter-workspace";

const LOGIN_NEXT = "/dashboard/cover-letter";

const KINDS: LetterKind[] = ["APPLICATION_EMAIL", "COVER_LETTER"];

/** Trang Thư xin việc, ba trạng thái: danh sách và viết mới, AI đang viết, mở một thư (`?doc=`). */
export function CoverLetterView() {
  const router = useRouter();
  const params = useSearchParams();
  const documentId = params.get("doc");
  const fixedJobId = params.get("jobId");
  const fixedKind = KINDS.find((kind) => kind === params.get("kind")) ?? null;

  const job = useDocumentJob(LOGIN_NEXT);
  const [writing, setWriting] = useState<LetterKind | null>(null);
  const lastInput = useRef<[LetterKind, ApplicationEmailInput] | null>(null);
  const opened = useRef<string | null>(null);

  const generate = (kind: LetterKind, input: ApplicationEmailInput) => {
    lastInput.current = [kind, input];
    setWriting(kind);
    if (kind === "COVER_LETTER" && "jobId" in input) {
      job.startStream(() =>
        documentsService.createCoverLetter(input.jobId, true),
      );
    } else {
      job.start(() => documentsService.createApplicationEmail(input));
    }
  };

  const finished = job.phase === "done" ? job.document?.id : undefined;
  useEffect(() => {
    if (!finished || opened.current === finished) return;
    opened.current = finished;
    router.push(`/dashboard/cover-letter?doc=${finished}`);
  }, [finished, router]);

  if (documentId)
    return <LetterWorkspace key={documentId} documentId={documentId} />;
  if (job.phase === "generating") {
    return (
      <LetterGenerating
        kind={writing}
        partial={job.partial as PartialLetter | null}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DocumentJobStatus
        job={job}
        onRegenerate={() => lastInput.current && generate(...lastInput.current)}
      />
      <LetterHero
        fixedJobId={fixedJobId}
        fixedKind={fixedKind}
        onGenerate={generate}
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <LetterList />
        <LetterSuggestions />
      </div>
    </div>
  );
}
