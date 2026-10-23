"use client";

import Link from "next/link";
import { PencilSimple } from "@phosphor-icons/react/ssr";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { jobsService } from "@/services";
import { Card } from "@/components/ui/card";
import { SelectMenu } from "@/components/ui/select-menu";
import { MultiPickField } from "@/components/ui/multi-pick-field";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { EXPERIENCE_LEVELS } from "@/lib/profile-form";
import { pickableSubs } from "@/lib/job-options";
import { useProfile, useProfileUi, useSaveProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/cn";
import { personInitials } from "@/lib/company";
import { useSession } from "@/hooks/use-session";

/** Đầu trang hồ sơ: tên, chức danh và bốn ô Ngành / Nghề / Cấp bậc / Nơi làm việc quyết định "Việc làm phù hợp". */
export function ProfileHeader() {
  const { user } = useSession();
  const { data: profile } = useProfile();
  const edit = useProfileUi((state) => state.edit);
  const { saveSearch, saving } = useSaveProfile();
  const filters = useApiQuery(keys.jobFilters(), () => jobsService.filters(), {
    errorMessage: "Không tải được danh mục ngành nghề",
    staleTime: Infinity,
  });
  const matching = useApiQuery(
    keys.jobList({ scored: true, limit: 1 }),
    () => jobsService.list({ scored: true, limit: 1 }),
    { errorMessage: "Không đếm được việc làm phù hợp" },
  );
  if (!profile) return null;

  const occupation = profile.occupationCode ?? "";
  const level =
    profile.experienceLevel === "UNKNOWN" ? "" : profile.experienceLevel;
  const search = {
    occupationCode: occupation,
    subOccupationCodes: profile.subOccupationCodes,
    experienceLevel: level || undefined,
    preferredProvinces: profile.preferredProvinces,
  };
  const subs = pickableSubs(
    filters.data?.occupations.find((item) => item.code === occupation),
  );

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
              “Việc làm phù hợp” chỉ hiện tin đúng ngành, các nghề và nơi làm
              việc đã chọn, cấp bậc lệch tối đa một bậc.
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
                saveSearch({ ...search, occupationCode: next, subOccupationCodes: [] })
              }
            />
          </div>
          <div>
            <p
              className={cn(
                "mb-1 text-2xs",
                search.subOccupationCodes.length ? "text-slate-500" : "text-amber-600",
              )}
            >
              Nghề
              {search.subOccupationCodes.length
                ? ""
                : " · chưa chọn, đang hiện mọi tin của ngành"}
            </p>
            <MultiPickField
              title="Nghề (chọn nhiều)"
              emptyLabel="Chưa chọn"
              options={subs}
              selected={search.subOccupationCodes}
              disabled={saving || !occupation}
              onSave={(codes) => saveSearch({ ...search, subOccupationCodes: codes })}
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
              onChange={(next) => saveSearch({ ...search, experienceLevel: next })}
            />
          </div>
          <div>
            <p
              className={cn(
                "mb-1 text-2xs",
                search.preferredProvinces.length ? "text-slate-500" : "text-amber-600",
              )}
            >
              Nơi làm việc
              {search.preferredProvinces.length
                ? ""
                : " · chưa chọn, đang hiện tin mọi tỉnh"}
            </p>
            <MultiPickField
              title="Tỉnh/thành (chọn nhiều)"
              emptyLabel="Mọi nơi"
              options={filters.data?.provinces ?? []}
              selected={search.preferredProvinces}
              searchPlaceholder="Tìm tỉnh/thành…"
              disabled={saving || !occupation}
              onSave={(codes) => saveSearch({ ...search, preferredProvinces: codes })}
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
