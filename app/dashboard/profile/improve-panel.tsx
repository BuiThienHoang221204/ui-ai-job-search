"use client";

import Link from "next/link";
import {
  ArrowSquareOut,
  FilePdf,
  ArrowRight,
  Check,
  FileText,
  Target,
  UploadSimple,
} from "@phosphor-icons/react/ssr";
import { useApiQuery } from "@/hooks/use-api-query";
import { profileDraftService } from "@/services";
import { DashSection } from "@/components/dashboard/dash-section";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn, formatDate } from "@/utils";
import { improvements, type Improvement } from "./profile-config";
import { useProfile, useProfileUi } from "./use-profile";

/** Chuyển sang đúng tab rồi cuộn tới phần cần sửa. */
function useGoTo() {
  const setTab = useProfileUi((state) => state.setTab);
  return (item: Improvement) => {
    setTab(item.tab);
    requestAnimationFrame(() =>
      document
        .getElementById(item.anchor)
        ?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  };
}

/** Cột phải trang hồ sơ: việc nên làm để AI hiểu đúng hơn, và tệp CV gốc. */
export function ImprovePanel() {
  const { data: profile } = useProfile();
  const goTo = useGoTo();
  const cv = useApiQuery(
    ["profile", "cv"],
    () => profileDraftService.latest().catch(() => null),
    {
      errorMessage: "Không tải được CV gần nhất",
    },
  );
  if (!profile) return null;

  const items = improvements(profile);
  const done = items.filter((item) => item.done).length;
  const file = cv.data?.storageKey ? cv.data : null;

  return (
    <Card className="divide-y divide-slate-100 lg:sticky lg:top-6">
      <DashSection title="Cải thiện kết quả" icon={Target}>
        <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
          <Progress value={(done / items.length) * 100} className="h-1.5" />
          <span className="shrink-0 tabular-nums">
            {done}/{items.length} việc
          </span>
        </div>
        <ul className="-mx-2">
          {items.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => goTo(item)}
                className="grid w-full cursor-pointer grid-cols-[1.875rem_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg px-2 py-2.5 text-left hover:bg-slate-50"
              >
                <span
                  className={cn(
                    "flex size-7.5 items-center justify-center rounded-lg",
                    item.done
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600",
                  )}
                >
                  {item.done ? (
                    <Check className="size-4" weight="bold" />
                  ) : (
                    <Target className="size-4" />
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm",
                      item.done
                        ? "text-slate-400 line-through"
                        : "font-semibold text-slate-900",
                    )}
                  >
                    {item.title}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {item.detail}
                  </span>
                </span>
                <ArrowRight className="size-4 text-slate-400" />
              </button>
            </li>
          ))}
        </ul>
      </DashSection>

      <DashSection title="CV gốc" icon={FileText}>
        {file ? (
          <a
            href={profileDraftService.fileUrl(file.id)}
            target="_blank"
            rel="noreferrer"
            className="group grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 hover:border-primary-300"
          >
            <FilePdf weight="duotone" className="size-8 text-rose-500" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-primary-600">
                {file.filename}
              </span>
              <span className="block text-xs text-slate-500">
                PDF · tải lên {formatDate(file.createdAt)}
              </span>
            </span>
            <ArrowSquareOut className="size-4 text-slate-400 group-hover:text-primary-600" />
          </a>
        ) : (
          <p className="text-sm text-slate-500">
            Chưa có CV nào. Tải CV lên để hệ thống tự điền hồ sơ.
          </p>
        )}
        <Link
          href="/dashboard/profile/upload"
          className="mt-4 flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:border-primary-300 hover:text-primary-600"
        >
          <UploadSimple className="size-4" />
          {file ? "Đọc lại từ CV mới" : "Tải CV lên"}
        </Link>
      </DashSection>
    </Card>
  );
}
