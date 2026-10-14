"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowsClockwise, ChatsCircle } from "@phosphor-icons/react/ssr";
import { failureMessage, isWorthRetrying } from "@/lib/failure-message";
import { apiErrorMessage } from "@/lib/axios";
import { interviewService, type InterviewPrepRecord } from "@/services";
import {
  answerOf,
  indexedStarAnswers,
  indexedToughQuestions,
  isInterviewPrepEmpty,
} from "@/lib/interview-content";
import {
  isPrepBusy,
  useInterviewPrep,
  useInterviewRefresh,
} from "@/hooks/use-interview-prep";
import { companyColor, companyInitials, relativeDay } from "@/utils";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { InterviewDate } from "./interview-date";
import { PracticeQuestion } from "./practice-question";

export const STATUS_LABEL: Record<InterviewPrepRecord["status"], string> = {
  PENDING: "Đang chờ",
  RUNNING: "Đang soạn",
  DONE: "Xong",
  FAILED: "Soạn lỗi",
};

export const STATUS_VARIANT: Record<
  InterviewPrepRecord["status"],
  "info" | "warning" | "success" | "danger"
> = {
  PENDING: "info",
  RUNNING: "warning",
  DONE: "success",
  FAILED: "danger",
};

type TabKey = "star" | "tough" | "probes" | "points" | "ask";

const TAB_COPY: Record<TabKey, { label: string; description: string }> = {
  star: {
    label: "STAR",
    description:
      "Dựng từ kinh nghiệm có thật trong hồ sơ. Tự kể trước, rồi mới mở gợi ý để so.",
  },
  tough: {
    label: "Câu hỏi khó",
    description: "Đào vào khoảng trống thật giữa hồ sơ và tin tuyển dụng.",
  },
  probes: {
    label: "Bị đào sâu",
    description:
      "Những điểm hồ sơ còn mỏng so với yêu cầu. Chuẩn bị trước thì không bị bất ngờ.",
  },
  points: {
    label: "Ý cần nhắc",
    description:
      "Nếu buổi phỏng vấn không tự dẫn tới những ý này thì bạn nên đưa chúng vào.",
  },
  ask: {
    label: "Hỏi lại họ",
    description: "Cụ thể cho công ty và vị trí này, không phải câu hỏi chung chung.",
  },
};

/** Một mục có nhãn, dùng cho bốn phần của khung STAR trong phần gợi ý. */
function StarPart({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-2xs font-semibold tracking-wide text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-sm leading-relaxed text-slate-700">{value}</p>
    </div>
  );
}

/** Danh sách gạch đầu dòng đơn giản. */
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2 text-sm leading-relaxed text-slate-700">
          <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-300" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Soạn lại bộ đề; nếu đã có câu tự trả lời thì hỏi lại trước vì câu đổi sẽ không còn được tính. */
function RegenerateButton({
  prep,
  variant = "outline",
}: {
  prep: InterviewPrepRecord;
  variant?: "outline" | "primary";
}) {
  const toast = useToast();
  const refresh = useInterviewRefresh();
  const [confirming, setConfirming] = useState(false);
  const [queueing, setQueueing] = useState(false);

  const run = async () => {
    setQueueing(true);
    try {
      await interviewService.prep(prep.jobId, true);
      setConfirming(false);
      refresh();
    } catch (cause) {
      toast.danger(apiErrorMessage(cause, "Không xếp được vào hàng đợi"));
    } finally {
      setQueueing(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant={variant}
        loading={queueing}
        title="Soạn lại theo hồ sơ hiện tại"
        onClick={() => (prep.practiced > 0 ? setConfirming(true) : void run())}
      >
        {!queueing && <ArrowsClockwise className="size-4" />}
        Soạn lại
      </Button>
      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Soạn lại bộ câu hỏi?"
      >
        <p className="text-sm leading-relaxed text-slate-600">
          Bạn đã tự trả lời {prep.practiced} câu. Câu hỏi nào bị đổi trong bộ mới
          thì câu trả lời của nó sẽ không còn được tính vào mức sẵn sàng.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirming(false)}>
            Giữ bộ cũ
          </Button>
          <Button loading={queueing} onClick={() => void run()}>
            Soạn lại
          </Button>
        </div>
      </Modal>
    </>
  );
}

/** Phần đầu: công ty, ngày phỏng vấn, các nút và mức sẵn sàng. */
function PrepHeader({ prep }: { prep: InterviewPrepRecord }) {
  const done = prep.status === "DONE";
  const percent = prep.total ? Math.round((prep.practiced / prep.total) * 100) : 0;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <CompanyLogo
            initials={companyInitials(prep.job.company)}
            color={companyColor(prep.job.company)}
            src={prep.job.companyLogo}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              {prep.job.title}
            </h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="truncate">{prep.job.company}</span>
              {prep.generatedAt && <span>soạn {relativeDay(prep.generatedAt)}</span>}
              {!done && (
                <Badge variant={STATUS_VARIANT[prep.status]}>
                  {STATUS_LABEL[prep.status]}
                </Badge>
              )}
              <InterviewDate application={prep.application} />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {done && <RegenerateButton prep={prep} />}
          <Link href={`/dashboard/interview/${prep.jobId}/mock`}>
            <Button size="sm">
              <ChatsCircle className="size-4" />
              Phỏng vấn thử
            </Button>
          </Link>
        </div>
      </div>

      {done && prep.total > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Mức sẵn sàng</span>
          <Progress value={percent} className="h-1.5 max-w-60 flex-1" />
          <span>
            <b className="tabular-nums text-slate-900">
              {prep.practiced}/{prep.total}
            </b>{" "}
            câu đã tự trả lời
          </span>
        </div>
      )}
    </Card>
  );
}

/** Nội dung bộ câu hỏi đã soạn xong, chia theo tab. */
function PrepContent({ prep }: { prep: InterviewPrepRecord }) {
  const star = indexedStarAnswers(prep.starAnswers);
  const tough = indexedToughQuestions(prep.toughQuestions);
  const counts: Record<TabKey, number> = {
    star: star.length,
    tough: tough.length,
    probes: prep.likelyProbes.length,
    points: prep.talkingPoints.length,
    ask: prep.questionsToAsk.length,
  };
  const available = (Object.keys(TAB_COPY) as TabKey[]).filter(
    (key) => counts[key] > 0,
  );
  const [chosen, setChosen] = useState<TabKey>("star");
  const tab = available.includes(chosen) ? chosen : available[0];

  if (isInterviewPrepEmpty(prep) || !tab) {
    return (
      <Alert
        tone="warning"
        title="Lượt soạn xong nhưng không dùng được"
        actions={<RegenerateButton prep={prep} variant="primary" />}
      >
        Model trả về nội dung rỗng. Bấm Soạn lại để soạn một lượt mới.
      </Alert>
    );
  }

  return (
    <Card className="p-4 sm:p-5">
      <Tabs
        tabs={available.map((key) => ({
          value: key,
          label: `${TAB_COPY[key].label} (${counts[key]})`,
        }))}
        value={tab}
        onChange={(value) => setChosen(value as TabKey)}
      />
      <p className="mt-3 mb-4 text-sm text-slate-500">{TAB_COPY[tab].description}</p>

      {tab === "star" && (
        <div className="space-y-3">
          {star.map((item) => (
            <PracticeQuestion
              key={`star-${item.index}-${item.question}`}
              jobId={prep.jobId}
              kind="STAR"
              index={item.index}
              question={item.question}
              answer={answerOf(prep.answers, "STAR", item.index)}
              meta={
                item.competency && <Badge variant="outline">{item.competency}</Badge>
              }
              hint={
                <div className="grid gap-3 sm:grid-cols-2">
                  <StarPart label="Bối cảnh" value={item.situation} />
                  <StarPart label="Nhiệm vụ" value={item.task} />
                  <StarPart label="Hành động" value={item.action} />
                  <StarPart label="Kết quả" value={item.result} />
                </div>
              }
            />
          ))}
        </div>
      )}

      {tab === "tough" && (
        <div className="space-y-3">
          {tough.map((item) => (
            <PracticeQuestion
              key={`tough-${item.index}-${item.question}`}
              jobId={prep.jobId}
              kind="TOUGH"
              index={item.index}
              question={item.question}
              answer={answerOf(prep.answers, "TOUGH", item.index)}
              subtitle={item.why && `Vì sao họ hỏi: ${item.why}`}
              hint={
                <p className="text-sm leading-relaxed text-slate-700">
                  {item.suggestedAnswer ?? "Chưa có gợi ý cho câu này."}
                </p>
              }
            />
          ))}
        </div>
      )}

      {tab === "probes" && <BulletList items={prep.likelyProbes} />}
      {tab === "points" && <BulletList items={prep.talkingPoints} />}
      {tab === "ask" && <BulletList items={prep.questionsToAsk} />}
    </Card>
  );
}

/** Cột phải: một bộ câu hỏi theo trạng thái soạn. */
export function PrepDetail({ jobId }: { jobId: string }) {
  const prep = useInterviewPrep(jobId);

  if (prep.error) return <Alert tone="danger">{prep.error}</Alert>;
  if (!prep.data) return <Skeleton className="h-96" />;
  const record = prep.data;

  return (
    <div className="space-y-4">
      <PrepHeader prep={record} />

      {record.status === "FAILED" ? (
        <Alert
          tone="danger"
          title="Lượt soạn bị lỗi"
          actions={
            isWorthRetrying(record.failureKind) && (
              <RegenerateButton prep={record} variant="primary" />
            )
          }
        >
          {failureMessage(record.failureKind)}
        </Alert>
      ) : isPrepBusy(record.status) ? (
        <Card className="p-5">
          <p className="font-medium text-slate-900">Đang soạn bộ câu hỏi…</p>
          <p className="mt-1 text-sm text-slate-500">
            Thường mất khoảng một phút. Bạn có thể rời trang, bộ câu hỏi vẫn được
            soạn và sẽ hiện ở đây.
          </p>
          <div className="mt-4 grid max-w-xl gap-2.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3.5" />
            <Skeleton className="h-3.5 w-5/6" />
          </div>
        </Card>
      ) : (
        <PrepContent key={record.updatedAt} prep={record} />
      )}
    </div>
  );
}
