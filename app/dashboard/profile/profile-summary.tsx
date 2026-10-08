"use client";

import Link from "next/link";
import { PencilSimple } from "@phosphor-icons/react/ssr";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { jobsService } from "@/services";
import { useSession } from "@/components/dashboard/session";
import { Card } from "@/components/ui/card";
import { SelectMenu } from "@/components/ui/select-menu";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { cn, personInitials } from "@/utils";
import { EXPERIENCE_LEVELS } from "./profile-config";
import { useProfile, useProfileUi, useSaveProfile } from "./use-profile";

/** Đầu trang hồ sơ: tên, chức danh và hai ô Ngành / Cấp bậc quyết định "Việc làm phù hợp". */
export function ProfileHeader() {
  const { user } = useSession();
  const { data: profile } = useProfile();
  const edit = useProfileUi((state) => state.edit);
  const { saveSearch, saving } = useSaveProfile();
  const filters = useApiQuery(
    ["jobs", "filters"],
    () => jobsService.filters(),
    {
      errorMessage: "Không tải được danh mục ngành nghề",
    },
  );
  const matching = useApiQuery(
    keys.jobList({ scored: true, limit: 1 }),
    () => jobsService.list({ scored: true, limit: 1 }),
    { errorMessage: "Không đếm được việc làm phù hợp" },
  );
  if (!profile) return null;

  const occupation = profile.occupationCode ?? "";
  const level =
    profile.experienceLevel === "UNKNOWN" ? "" : profile.experienceLevel;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-lg font-bold text-white">
          {personInitials(user?.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">
            {user?.name ?? "Hồ sơ của tôi"}
          </h1>
          <p className="truncate text-sm text-slate-500">
            {profile.headline || "Chưa có chức danh"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => edit({ kind: "basic" })}
          className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 hover:border-primary-300 hover:text-primary-600"
        >
          <PencilSimple className="size-3.5" />
          Sửa
        </button>
      </div>

      <div id="profile-search" className="mt-5 rounded-2xl bg-primary-50 p-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Hệ thống đang tìm việc cho bạn theo
            </p>
            <p className="text-xs text-slate-500">
              “Việc làm phù hợp” chỉ hiện tin đúng ngành này, cấp bậc lệch tối
              đa một bậc.
            </p>
          </div>
          <p className="text-sm text-slate-600">
            <b className="mr-1 text-xl text-primary-600 tabular-nums">
              {matching.data?.total ?? "…"}
            </b>
            tin phù hợp
            <Link
              href="/dashboard/jobs?scored=1"
              className="ml-2 font-semibold text-primary-600 hover:text-primary-700"
            >
              Xem việc →
            </Link>
          </p>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-2xs text-slate-500">Ngành</p>
            <SelectMenu
              variant="field"
              label="Chưa chọn"
              searchPlaceholder="Tìm ngành…"
              value={occupation}
              disabled={saving}
              options={(filters.data?.occupations ?? []).map((group) => ({
                value: group.code,
                label: group.name,
              }))}
              onChange={(next) =>
                saveSearch({
                  occupationCode: next,
                  experienceLevel: level || undefined,
                })
              }
            />
          </div>
          <div>
            <p
              className={cn(
                "mb-1 text-2xs",
                level ? "text-slate-500" : "text-amber-600",
              )}
            >
              Cấp bậc{level ? "" : " · chưa chọn, đang suy từ số năm trong CV"}
            </p>
            <SelectMenu
              variant="field"
              label="Chưa chọn"
              value={level}
              disabled={saving || !occupation}
              options={EXPERIENCE_LEVELS}
              onChange={(next) =>
                saveSearch({
                  occupationCode: occupation,
                  experienceLevel: next,
                })
              }
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

/** Khung xám giữ đúng bố cục trang thật, để nội dung không nhảy khi tải xong. */
export function ProfileSkeleton() {
  return (
    <SkeletonPage>
      <Skeleton className="h-48" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(18.75rem,1fr)]">
        <Skeleton className="h-96" />
        <Skeleton className="h-72" />
      </div>
    </SkeletonPage>
  );
}
