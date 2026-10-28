"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowCounterClockwise,
  Info,
  ShareNetwork,
} from "@phosphor-icons/react/ssr";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { useLoginModal } from "@/hooks/use-login-modal";
import { usePendingCv } from "@/hooks/use-pending-cv";
import { useSession } from "@/hooks/use-session";
import {
  CV_RUBRIC,
  LEVEL_LABELS,
  SAMPLE_CV_CHECK,
  gradeOf,
  quickReasonMessage,
} from "@/lib/cv-check";
import { cn } from "@/lib/cn";
import type { CvCheckResult, CvCheckSource } from "@/types";
import { AtsChecks } from "./ats-checks";
import { CvShare } from "./cv-share";
import { FlagList } from "./flag-list";
import { NextStep } from "./next-step";
import { ParsedFields } from "./parsed-fields";
import { ReportHeading } from "./report-heading";
import { ReportOverview } from "./report-overview";
import { ReportQuestions } from "./report-questions";
import { RewriteList } from "./rewrite-list";
import { RubricChecks } from "./rubric-checks";

const SECTION = "scroll-mt-20";

/** Báo cáo phân tích CV: khối điểm, mục lục dính bên trái, tổng quan, đề xuất sửa, máy lọc, câu hỏi phỏng vấn dự đoán và việc làm tiếp. */
export function CvCheckReport({
  result,
  source,
  onReset,
}: {
  result: CvCheckResult;
  source: CvCheckSource;
  onReset: () => void;
}) {
  const { user } = useSession();
  const router = useRouter();
  const openLogin = useLoginModal((state) => state.open);
  const [sharing, setSharing] = useState(false);
  const [active, setActive] = useState("overview");

  const review = result.review;
  const issues = review?.sections.flatMap((part) => part.issues) ?? [];
  const rewrites = issues.filter((issue) => issue.quote);
  const general = issues.filter((issue) => !issue.quote);
  const questions = review?.questions ?? [];
  const grade = gradeOf(result.score);
  const sample = result === SAMPLE_CV_CHECK;
  const atsChecks =
    (review?.ats.length ?? 0) > 0 || source.multiColumn !== null;

  const toc = [
    { id: "overview", label: "Tổng quan", show: Boolean(review) },
    { id: "fixes", label: "Đề xuất sửa CV", show: true },
    { id: "ats", label: "Máy lọc ATS đọc CV thế nào", show: true },
    {
      id: "questions",
      label: "Câu hỏi phỏng vấn dự đoán",
      show: questions.length > 0,
    },
    { id: "next", label: "Việc cần làm tiếp", show: true },
  ].filter((item) => item.show);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );
    for (const element of document.querySelectorAll("[data-report-section]")) {
      observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  const practice = () => {
    if (user) router.push("/dashboard/interview");
    else
      openLogin({
        reason: "Đăng nhập miễn phí để luyện phỏng vấn theo CV của bạn.",
        next: "/dashboard/cv-check",
      });
  };

  const importCv = () => {
    if (source.file) usePendingCv.getState().hold(source.file);
    router.push("/dashboard/profile/upload");
  };

  return (
    <div className="space-y-7">
      {sample && (
        <Alert
          tone="info"
          title="Đây là phân tích mẫu"
          actions={<Button onClick={onReset}>Phân tích CV của bạn</Button>}
        >
          Kết quả của một CV Backend Developer giả định, để bạn xem trước báo
          cáo trông thế nào. Tải CV của bạn lên để nhận phân tích thật, miễn phí
          và không cần tài khoản.
        </Alert>
      )}
      <Card className="overflow-hidden">
        <div className="from-primary-50 grid items-center gap-6 bg-linear-to-br to-transparent p-6 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
          <ProgressCircle value={result.score} size={120} strokeWidth={10}>
            <span className="text-center">
              <span className="font-display block text-4xl leading-none text-slate-900">
                {result.score}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </span>
          </ProgressCircle>
          <div className="min-w-0">
            <p className="text-sm text-slate-600">
              {source.name}
              {review && (
                <>
                  {" "}
                  · Hướng tới{" "}
                  <b className="font-semibold text-slate-900">
                    {review.targetRole}
                  </b>{" "}
                  · {LEVEL_LABELS[review.level]}
                </>
              )}
            </p>
            <p className="font-display text-primary-600 mt-1 text-[1.75rem] leading-tight">
              {grade}
            </p>
            {review && (
              <p className="mt-2.5 max-w-3xl text-slate-700">
                <b className="text-slate-900">Nhận xét:</b> {review.summary}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 self-start lg:flex-col">
            {!sample && (
              <Button variant="outline" onClick={() => setSharing(true)}>
                <ShareNetwork className="size-4" />
                Chia sẻ
              </Button>
            )}
            <Button variant="outline" onClick={onReset}>
              <ArrowCounterClockwise className="size-4" />
              {sample ? "Phân tích CV của bạn" : "Phân tích CV khác"}
            </Button>
          </div>
        </div>
        <div className="grid border-t border-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-slate-200">
          {result.groups.map((group) => {
            const rubric = CV_RUBRIC.find((item) => item.key === group.key);
            return (
              <div
                key={group.key}
                tabIndex={0}
                className="group relative px-6 py-4 outline-none"
              >
                <p className="flex items-center gap-1.5 text-sm text-slate-600">
                  {group.label}
                  <Info className="size-4 text-slate-400" />
                  <span className="ml-auto text-xs text-slate-400">
                    {rubric?.reader}
                  </span>
                </p>
                <p className="mt-0.5 flex items-baseline justify-between">
                  <span className="font-display text-2xl text-slate-900">
                    {group.earned}
                    <span className="text-xs text-slate-500">/{group.max}</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    chiếm {group.max}%
                  </span>
                </p>
                <Progress
                  value={(group.earned / group.max) * 100}
                  className="mt-2 h-1.5"
                />
                <div className="invisible absolute inset-x-3 bottom-full z-10 mb-1 rounded-lg bg-slate-900 px-3 py-2.5 text-xs leading-relaxed text-slate-100 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100">
                  <p className="font-semibold">{group.max} điểm, gồm:</p>
                  <ul className="mt-1 space-y-1">
                    {rubric?.items.map((item) => (
                      <li key={item.key}>
                        <b>
                          {item.label} · {item.points}đ:
                        </b>{" "}
                        {item.note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {result.reason && (
        <Alert tone="warning">{quickReasonMessage(result.reason)}</Alert>
      )}

      <div className="grid items-start gap-9 lg:grid-cols-[12.5rem_minmax(0,1fr)]">
        <nav className="sticky top-4 hidden lg:block">
          <div className="mb-3.5 border-b border-slate-200 pb-3.5">
            <p className="flex items-baseline gap-1">
              <span className="font-display text-2xl text-slate-900">
                {result.score}
              </span>
              <span className="text-sm text-slate-500">/100</span>
              <span className="text-primary-600 ml-1.5 text-sm font-semibold">
                {grade}
              </span>
            </p>
            <Progress value={result.score} className="mt-2 h-1.5" />
          </div>
          <p className="mb-2 text-sm font-semibold text-slate-900">
            Trong báo cáo
          </p>
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                document
                  .getElementById(item.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
                setActive(item.id);
              }}
              className={cn(
                "block border-l-2 border-slate-200 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-900",
                active === item.id &&
                  "border-primary-600 font-semibold text-slate-900",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="min-w-0 space-y-11">
          {review && (
            <section id="overview" data-report-section className={SECTION}>
              <ReportHeading title="Tổng quan" />
              <ReportOverview review={review} />
            </section>
          )}

          <section id="fixes" data-report-section className={SECTION}>
            <ReportHeading
              title="Đề xuất sửa CV"
              count={review ? issues.length : result.flags.length}
            />
            {!review && <FlagList flags={result.flags} />}
            {rewrites.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-slate-900">
                  Câu nên viết lại
                  <span className="ml-1 font-normal text-slate-500">
                    {rewrites.length}
                  </span>
                </h3>
                <p className="text-sm text-slate-500">
                  Mỗi câu đã được viết lại cho rõ kết quả; bạn chỉ cần điền số
                  liệu thật vào chỗ [__].
                </p>
                <RewriteList issues={rewrites} />
              </div>
            )}
            {general.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-slate-900">
                  Góp ý chung
                  <span className="ml-1 font-normal text-slate-500">
                    {general.length}
                  </span>
                </h3>
                <p className="text-sm text-slate-500">
                  Những điều nên chỉnh cho cả CV, không riêng một câu nào.
                </p>
                <Card className="mt-3 divide-y divide-slate-200">
                  {general.map((issue) => (
                    <div key={issue.title} className="px-5 py-4">
                      <h4 className="font-semibold text-slate-900">
                        {issue.title}
                      </h4>
                      <p className="mt-1 text-sm text-slate-600">
                        <b className="text-slate-900">Cách sửa:</b> {issue.why}
                      </p>
                    </div>
                  ))}
                </Card>
              </div>
            )}
            {review && issues.length === 0 && (
              <p className="mt-3 text-sm text-slate-500">
                AI không thấy câu nào cần viết lại.
              </p>
            )}
          </section>

          <section id="ats" data-report-section className={SECTION}>
            <ReportHeading
              title="Máy lọc ATS đọc CV thế nào"
              sub={`${result.score}/100 theo bảng chấm 8 tiêu chí`}
            />
            {review?.parsed && (
              <div className="mt-3">
                <ParsedFields parsed={review.parsed} />
              </div>
            )}
            <div
              className={cn("mt-3 grid gap-3", atsChecks && "xl:grid-cols-2")}
            >
              {atsChecks && (
                <AtsChecks
                  ats={review?.ats ?? []}
                  multiColumn={source.multiColumn}
                />
              )}
              <RubricChecks result={result} />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Không có điểm ATS chung: mỗi công ty cài đặt máy lọc một kiểu.
              Điểm ở đây do hệ thống đếm theo 8 tiêu chí cố định, nên cùng một
              CV luôn ra cùng một điểm: nhóm ATS đọc được đo thứ máy lọc cần đọc
              ra, nhóm Nội dung đo thứ nhà tuyển dụng muốn đọc.
              {review &&
                " AI tách CV thành từng mục, từng dòng để đếm, rồi nhận xét và gợi ý viết lại."}
              {review &&
                !sample &&
                " Mọi “Câu trong CV” đã được kiểm là có thật trong file của bạn."}
            </p>
          </section>

          {questions.length > 0 && (
            <section id="questions" data-report-section className={SECTION}>
              <ReportHeading
                title="Câu hỏi phỏng vấn dự đoán"
                count={questions.length}
                sub="Nhà tuyển dụng thường hỏi xoáy vào chính những gì bạn ghi trong CV."
              />
              <ReportQuestions questions={questions} onPractice={practice} />
            </section>
          )}

          <section id="next" data-report-section className={SECTION}>
            <ReportHeading title="Việc cần làm tiếp" />
            <div className="mt-3 space-y-2.5">
              <NextStep
                index={1}
                title="Sửa các câu ở trên rồi phân tích lại"
                note="Điền số liệu thật vào chỗ [__], xuất lại PDF rồi phân tích lại để xem điểm tăng."
                action={
                  <Button variant="outline" onClick={onReset}>
                    Phân tích lại
                  </Button>
                }
              />
              <NextStep
                index={2}
                title="Tạo hồ sơ từ chính CV này"
                note="Hệ thống tìm việc đúng ngành và gợi ý viết lại từng dòng theo tin bạn nhắm."
                action={
                  user ? (
                    <Button onClick={importCv}>Tạo hồ sơ từ CV này</Button>
                  ) : (
                    <Button
                      onClick={() =>
                        openLogin({
                          mode: "register",
                          next: "/dashboard/cv-check",
                        })
                      }
                    >
                      Tạo tài khoản miễn phí
                    </Button>
                  )
                }
              />
              <NextStep
                index={3}
                title="Luyện phỏng vấn"
                note="Phỏng vấn thử bằng chữ hoặc giọng nói, có nhận xét từng câu trả lời."
                action={
                  <Button variant="outline" onClick={practice}>
                    Luyện phỏng vấn
                  </Button>
                }
              />
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={sharing}
        onClose={() => setSharing(false)}
        title="Chia sẻ kết quả"
        className="max-w-lg"
      >
        <CvShare result={result} />
      </Modal>
    </div>
  );
}
