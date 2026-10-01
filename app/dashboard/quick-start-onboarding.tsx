"use client";

import { useState } from "react";
import { Check } from "@phosphor-icons/react/ssr";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiErrorMessage } from "@/lib/axios";
import { jobsService, profileService } from "@/services";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";

const EXPERIENCE_OPTIONS = [
  { value: "FRESHER", label: "Mới tốt nghiệp", detail: "0 - 1 năm" },
  { value: "JUNIOR", label: "Junior", detail: "1 - 3 năm" },
  { value: "MIDDLE", label: "Mid-level", detail: "3 - 5 năm" },
  { value: "SENIOR", label: "Senior", detail: "5 - 8 năm" },
  { value: "LEAD", label: "Lead", detail: "trên 8 năm" },
] as const;

interface QuickStartOnboardingProps {
  firstName: string;
  onDone: () => void;
  onSkip: () => void;
}

/** Hàng chọn 2 cột (nhóm ngành -> nghề), chọn ĐÚNG MỘT, dùng chung style với OccupationPicker nhưng đơn chọn. */
function OccupationStep({
  occupationCode,
  subOccupationCode,
  onPickGroup,
  onPickSub,
  onNext,
}: {
  occupationCode: string | null;
  subOccupationCode: string | null;
  onPickGroup: (code: string) => void;
  onPickSub: (code: string) => void;
  onNext: () => void;
}) {
  const { data: filters, loading } = useApiQuery(
    ["jobs", "filters"],
    () => jobsService.filters(),
    { errorMessage: "Không tải được danh mục ngành nghề" },
  );

  const groups = filters?.occupations ?? [];
  const activeGroup = groups.find((group) => group.code === occupationCode);

  return (
    <>
      <p className="mb-3 text-sm font-semibold text-slate-900">
        Bạn đang/muốn làm ngành nào?
      </p>

      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] overflow-hidden rounded-xl border border-slate-200">
          <div className="scrollbar-thin max-h-72 overflow-y-auto border-r border-slate-100 py-1.5">
            {groups.map((group) => (
              <button
                key={group.code}
                type="button"
                onClick={() => onPickGroup(group.code)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm",
                  occupationCode === group.code
                    ? "bg-primary-50 text-primary-800 font-semibold"
                    : "text-slate-700 hover:bg-slate-50",
                )}
              >
                <span className="min-w-0 truncate">{group.name}</span>
                {occupationCode === group.code && (
                  <Check className="size-4 shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="scrollbar-thin max-h-72 overflow-y-auto py-1.5">
            {activeGroup?.subs?.length ? (
              activeGroup.subs.map((sub) => (
                <button
                  key={sub.code}
                  type="button"
                  onClick={() => onPickSub(sub.code)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm",
                    subOccupationCode === sub.code
                      ? "bg-primary-50 text-primary-800 font-semibold"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <span className="min-w-0 truncate">{sub.name}</span>
                  {subOccupationCode === sub.code && (
                    <Check className="size-4 shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-xs text-slate-400">
                {occupationCode
                  ? "Nhóm này chưa tách nghề chi tiết, bấm Tiếp tục luôn cũng được."
                  : "Chọn nhóm ngành ở bên trái trước."}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button disabled={!occupationCode} onClick={onNext}>
          Tiếp tục
        </Button>
      </div>
    </>
  );
}

function ExperienceStep({
  experienceLevel,
  onPick,
  onBack,
  onFinish,
  submitting,
  error,
}: {
  experienceLevel: string | null;
  onPick: (value: string) => void;
  onBack: () => void;
  onFinish: () => void;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <>
      <p className="mb-3 text-sm font-semibold text-slate-900">
        Kinh nghiệm của bạn?
      </p>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {EXPERIENCE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onPick(option.value)}
            className={cn(
              "flex items-center justify-between gap-2 rounded-xl border p-3.5 text-left",
              experienceLevel === option.value
                ? "border-primary-400 bg-primary-50/60"
                : "border-slate-200 hover:bg-slate-50",
            )}
          >
            <span>
              <span className="block text-sm font-semibold text-slate-900">
                {option.label}
              </span>
              <span className="block text-xs text-slate-500">
                {option.detail}
              </span>
            </span>
            {experienceLevel === option.value && (
              <Check className="text-primary-600 size-4 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          Quay lại
        </Button>
        <Button loading={submitting} onClick={onFinish}>
          Hoàn thành
        </Button>
      </div>
    </>
  );
}

/** Bước "Chọn nhanh" ngay sau đăng ký - mở khoá "Việc làm phù hợp" trong lúc chờ user tải CV thật lên. Bỏ qua được, không ép. */
export function QuickStartOnboarding({
  firstName,
  onDone,
  onSkip,
}: QuickStartOnboardingProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [occupationCode, setOccupationCode] = useState<string | null>(null);
  const [subOccupationCode, setSubOccupationCode] = useState<string | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFinish() {
    if (!occupationCode) return;
    setSubmitting(true);
    setError(null);
    try {
      await profileService.quickStart({
        occupationCode,
        subOccupationCode: subOccupationCode ?? undefined,
        experienceLevel: experienceLevel ?? undefined,
      });
      onDone();
    } catch (err) {
      setError(apiErrorMessage(err, "Không lưu được lựa chọn, thử lại sau"));
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              Chào {firstName}, cho chúng tôi biết thêm về bạn
            </h1>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500 sm:text-sm">
              Vài giây để thấy việc làm phù hợp ngay, trong lúc bạn hoàn thiện hồ sơ đầy đủ sau.
            </p>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="shrink-0 text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Bỏ qua
          </button>
        </div>

        <div className="mt-5">
          {step === 1 ? (
            <OccupationStep
              occupationCode={occupationCode}
              subOccupationCode={subOccupationCode}
              onPickGroup={(code) => {
                setOccupationCode(code);
                setSubOccupationCode(null);
              }}
              onPickSub={setSubOccupationCode}
              onNext={() => setStep(2)}
            />
          ) : (
            <ExperienceStep
              experienceLevel={experienceLevel}
              onPick={setExperienceLevel}
              onBack={() => setStep(1)}
              onFinish={() => void handleFinish()}
              submitting={submitting}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
}
