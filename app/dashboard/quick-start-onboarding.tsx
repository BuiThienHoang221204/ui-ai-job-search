"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, X } from "@phosphor-icons/react/ssr";
import { useApiQuery } from "@/hooks/use-api-query";
import { invalidateAfter, keys } from "@/lib/query-keys";
import { apiErrorMessage } from "@/lib/axios";
import { jobsService, profileService } from "@/services";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckList } from "@/components/ui/check-list";
import { cn } from "@/lib/cn";
import { pickableSubs } from "@/lib/job-options";

const EXPERIENCE_OPTIONS = [
  { value: "FRESHER", label: "Mới tốt nghiệp", detail: "0 - 1 năm" },
  { value: "JUNIOR", label: "Junior", detail: "1 - 3 năm" },
  { value: "MIDDLE", label: "Mid-level", detail: "3 - 5 năm" },
  { value: "SENIOR", label: "Senior", detail: "5 - 8 năm" },
  { value: "LEAD", label: "Lead", detail: "trên 8 năm" },
] as const;

interface QuickStartOnboardingProps {
  firstName: string;
}

/** Hàng chọn 2 cột: đúng MỘT nhóm ngành, rồi một hoặc nhiều nghề trong nhóm đó. */
function OccupationStep({
  occupationCode,
  subOccupationCodes,
  onPickGroup,
  onChangeSubs,
  onNext,
}: {
  occupationCode: string | null;
  subOccupationCodes: string[];
  onPickGroup: (code: string) => void;
  onChangeSubs: (codes: string[]) => void;
  onNext: () => void;
}) {
  const { data: filters, loading } = useApiQuery(
    keys.jobFilters(),
    () => jobsService.filters(),
    { errorMessage: "Không tải được danh mục ngành nghề", staleTime: Infinity },
  );

  const groups = filters?.occupations ?? [];
  const activeGroup = groups.find((group) => group.code === occupationCode);
  const subs = pickableSubs(activeGroup);
  const picked = subs.filter((sub) => subOccupationCodes.includes(sub.code));
  const toggle = (code: string) =>
    onChangeSubs(
      subOccupationCodes.includes(code)
        ? subOccupationCodes.filter((item) => item !== code)
        : [...subOccupationCodes, code],
    );

  return (
    <>
      <p className="text-sm font-semibold text-slate-900">
        Bạn đang/muốn làm ngành nào?
      </p>
      <p className="mb-3 text-xs text-slate-500">
        Chọn một nhóm ngành, rồi chọn một hoặc nhiều nghề bạn muốn nhận việc làm.
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
            {subs.length ? (
              <CheckList
                title="Nghề (chọn nhiều)"
                options={subs}
                selected={subOccupationCodes}
                onChange={onChangeSubs}
              />
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

      {picked.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {picked.map((sub) => (
            <span
              key={sub.code}
              className="border-primary-200 bg-primary-50 text-primary-800 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
            >
              {sub.name}
              <button
                type="button"
                onClick={() => toggle(sub.code)}
                aria-label={`Bỏ ${sub.name}`}
                className="text-primary-600 cursor-pointer"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-3">
        {subs.length > 0 && (
          <span className="text-xs text-slate-500">
            Đã chọn {picked.length}/{subs.length} nghề
          </span>
        )}
        <Button
          disabled={!occupationCode || (subs.length > 0 && picked.length === 0)}
          onClick={onNext}
        >
          Tiếp tục
        </Button>
      </div>
    </>
  );
}

function ExperienceStep({
  experienceLevel,
  onPick,
  preferredProvinces,
  onChangeProvinces,
  onBack,
  onFinish,
  submitting,
  error,
}: {
  experienceLevel: string | null;
  onPick: (value: string) => void;
  preferredProvinces: string[];
  onChangeProvinces: (codes: string[]) => void;
  onBack: () => void;
  onFinish: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const { data: filters } = useApiQuery(
    keys.jobFilters(),
    () => jobsService.filters(),
    { errorMessage: "Không tải được danh mục tỉnh/thành", staleTime: Infinity },
  );

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

      <p className="mt-5 text-sm font-semibold text-slate-900">
        Bạn muốn làm việc ở đâu?
      </p>
      <p className="mb-3 text-xs text-slate-500">
        Không bắt buộc. Bỏ trống thì hiện việc làm ở mọi nơi; tin làm từ xa luôn được hiện.
      </p>
      <div className="scrollbar-thin max-h-60 overflow-y-auto rounded-xl border border-slate-200 py-1.5">
        <CheckList
          title="Tỉnh/thành (chọn nhiều)"
          options={filters?.provinces ?? []}
          selected={preferredProvinces}
          onChange={onChangeProvinces}
          searchPlaceholder="Tìm tỉnh/thành…"
        />
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
        <Button loading={submitting} disabled={!experienceLevel} onClick={onFinish}>
          Hoàn thành
        </Button>
      </div>
    </>
  );
}

/** Bước bắt buộc sau đăng ký: chọn ngành và kinh nghiệm - "Việc làm phù hợp" lọc theo đúng hai câu trả lời này. */
export function QuickStartOnboarding({ firstName }: QuickStartOnboardingProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  const [occupationCode, setOccupationCode] = useState<string | null>(null);
  const [subOccupationCodes, setSubOccupationCodes] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [preferredProvinces, setPreferredProvinces] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFinish() {
    if (!occupationCode || !experienceLevel) return;
    setSubmitting(true);
    setError(null);
    try {
      await profileService.quickStart({
        occupationCode,
        subOccupationCodes,
        experienceLevel,
        preferredProvinces,
      });
      invalidateAfter(queryClient, "quickStart");
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
              Chọn ngành và kinh nghiệm để chúng tôi hiển thị đúng việc làm phù hợp với bạn.
            </p>
          </div>
        </div>

        <div className="mt-5">
          {step === 1 ? (
            <OccupationStep
              occupationCode={occupationCode}
              subOccupationCodes={subOccupationCodes}
              onPickGroup={(code) => {
                setOccupationCode(code);
                setSubOccupationCodes([]);
              }}
              onChangeSubs={setSubOccupationCodes}
              onNext={() => setStep(2)}
            />
          ) : (
            <ExperienceStep
              experienceLevel={experienceLevel}
              onPick={setExperienceLevel}
              preferredProvinces={preferredProvinces}
              onChangeProvinces={setPreferredProvinces}
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
