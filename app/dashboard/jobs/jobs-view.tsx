"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { Job, JobListItem, JobSort, JobFilterValue } from "@/types";
import { jobsService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { useDebounce } from "@/hooks/use-debounce";
import { DEFAULT_SORT, readFilter, writeFilter } from "@/lib/job-filter-url";
import { keys } from "@/lib/query-keys";
import { toJobCardFromPublic, toJobCardFromRecord } from "@/lib/adapters";
import { squeezeSidebar } from "@/lib/sidebar";
import { JobFilterBar } from "./job-filter-bar";
import { SortDescending } from "@phosphor-icons/react/ssr";
import { SelectMenu } from "@/components/ui/select-menu";
import { Alert } from "@/components/ui/alert";
import Link from "next/link";
import { EmptyHint, EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton, SkeletonGrid, SkeletonPage } from "@/components/ui/skeleton";
import { JobDetailView } from "./[id]/job-detail-view";
import { JobList } from "./job-list";
import { cn } from "@/lib/cn";
import { useSession } from "@/hooks/use-session";
import { afterSaveJob } from "@/lib/job-cache";

const SORT_OPTIONS: { value: JobSort; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "salary", label: "Lương cao nhất" },
  { value: "match", label: "Điểm AI Match" },
];
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 500;

/** Màn tìm việc: bộ lọc trên URL, ô tìm kiếm debounce và danh sách phân trang. */
export function JobsView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const { user } = useSession();
  const scored = params.get("scored") === "1";
  const filter = useMemo(() => {
    const read = readFilter(new URLSearchParams(params.toString()));
    if (user) return read;
    return {
      ...read,
      salaryMin: 0,
      saved: false,
      applied: false,
      sort: DEFAULT_SORT,
    };
  }, [params, user]);
  const offset = Number(params.get("offset") ?? 0) || 0;
  const selected = params.get("job");
  const [draftQuery, setDraftQuery] = useState(filter.q);
  const [syncedQuery, setSyncedQuery] = useState(filter.q);
  if (syncedQuery !== filter.q) {
    setSyncedQuery(filter.q);
    setDraftQuery(filter.q);
  }

  const push = useCallback(
    (next: JobFilterValue, nextOffset: number, nextSelected?: string | null) => {
      router.push(
        `/dashboard/jobs?${writeFilter(next, nextOffset, scored, nextSelected)}`,
        { scroll: false },
      );
    },
    [router, scored],
  );
  const handleFilterChange = useCallback(
    (next: JobFilterValue) => {
      setDraftQuery(next.q);
      push(next, 0, null);
    },
    [push],
  );

  const debouncedQuery = useDebounce(draftQuery, SEARCH_DEBOUNCE_MS);
  useEffect(() => {
    if (debouncedQuery !== draftQuery) return;
    if (debouncedQuery === filter.q) return;
    push({ ...filter, q: debouncedQuery }, 0);
  }, [debouncedQuery, draftQuery, filter, push]);

  useEffect(() => squeezeSidebar(), []);
  const filters = useApiQuery(keys.jobFilters(), jobsService.filters, {
    errorMessage: "Không tải được danh mục bộ lọc",
    staleTime: Infinity,
  });

  const page = useApiQuery(
    keys.jobList({ ...filter, offset, scored }),
    () =>
      jobsService.list({
        limit: PAGE_SIZE,
        offset,
        ...(filter.q ? { q: filter.q } : {}),
        ...(filter.province.length ? { province: filter.province } : {}),
        ...(filter.occupation.length ? { occupation: filter.occupation } : {}),
        ...(filter.subOccupation.length
          ? { subOccupation: filter.subOccupation }
          : {}),
        ...(filter.salaryMin ? { salaryMin: filter.salaryMin } : {}),
        ...(filter.postedWithin ? { postedWithin: filter.postedWithin } : {}),
        ...(filter.saved ? { saved: true } : {}),
        ...(filter.applied ? { applied: true } : {}),
        sort: filter.sort,
        ...(scored ? { scored: true } : {}),
      }),
    {
      errorMessage: "Không tải được danh sách việc làm",
      keepPrevious: true,
      enabled: Boolean(user),
    },
  );

  const guestPage = useApiQuery(
    keys.publicJobList({ ...filter, offset }),
    () =>
      jobsService.publicList({
        limit: PAGE_SIZE,
        offset,
        ...(filter.q ? { q: filter.q } : {}),
        ...(filter.province.length ? { province: filter.province } : {}),
        ...(filter.occupation.length ? { occupation: filter.occupation } : {}),
        ...(filter.subOccupation.length
          ? { subOccupation: filter.subOccupation }
          : {}),
        ...(filter.postedWithin ? { postedWithin: filter.postedWithin } : {}),
      }),
    {
      errorMessage: "Không tải được danh sách việc làm",
      keepPrevious: true,
      enabled: !user && !scored,
    },
  );

  if (page.errorStatus === 401) router.replace("/login?next=/dashboard/jobs");
  const handleSelect = useCallback(
    (jobId: string) => {
      const wide =
        typeof window !== "undefined" &&
        window.matchMedia("(min-width: 1280px)").matches;
      if (wide) {
        window.history.pushState(
          null,
          "",
          `/dashboard/jobs?${writeFilter(filter, offset, scored, jobId)}`,
        );
        return;
      }
      router.push(`/dashboard/jobs/${jobId}`);
    },
    [filter, offset, scored, router],
  );

  const handleSavedChange = useCallback(
    (jobId: string, saved: boolean) => {
      const apply = (value: boolean) =>
        queryClient.setQueriesData<{ items: JobListItem[] }>(
          { queryKey: keys.jobLists() },
          (current) =>
            current
              ? {
                  ...current,
                  items: current.items.map((job) =>
                    job.id === jobId ? { ...job, saved: value } : job,
                  ),
                }
              : current,
        );

      apply(saved);
      void (saved ? jobsService.save(jobId) : jobsService.unsave(jobId))
        .then(() => afterSaveJob(queryClient, jobId, saved))
        .catch(() => apply(!saved));
    },
    [queryClient],
  );

  if (!user && scored) {
    return (
      <EmptyState
        title="Đăng nhập để xem việc làm phù hợp"
        description="Trang này lọc việc làm theo ngành và kinh nghiệm trong hồ sơ của bạn. Bạn vẫn xem được mọi tin ở Tất cả việc làm mà không cần đăng nhập."
        action={
          <Link
            href="/login?next=%2Fdashboard%2Fjobs%3Fscored%3D1"
            className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
          >
            Đăng nhập
          </Link>
        }
      />
    );
  }

  const error = user ? page.error : guestPage.error;
  const loading = user ? page.loading : guestPage.loading;
  let list: { jobs: Job[]; total: number } | null = null;
  if (user && page.data && !page.data.needsOccupation) {
    list = {
      jobs: page.data.items.map(toJobCardFromRecord),
      total: page.data.total,
    };
  }
  if (!user && guestPage.data) {
    list = {
      jobs: guestPage.data.items.map(toJobCardFromPublic),
      total: guestPage.data.total,
    };
  }

  if (error) return <Alert tone="danger">{error}</Alert>;

  if (page.data?.needsOccupation) {
    return (
      <EmptyState
        title="Chọn ngành nghề để xem việc làm phù hợp"
        description="Trang này hiển thị việc làm đúng ngành và kinh nghiệm của bạn. Hãy chọn ngành nghề ở trang Tổng quan trước."
        action={
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
            Đi tới Tổng quan
          </Link>
        }
      />
    );
  }

  if (!list) {
    return (
      <SkeletonPage className="space-y-4">
        <Skeleton className="h-14 w-72" />
        <SkeletonGrid
          count={4}
          className="grid gap-4 lg:grid-cols-2"
          itemClassName="h-52"
        />
      </SkeletonPage>
    );
  }

  return (
    <div className="flex flex-col xl:h-[calc(100dvh-3rem)]">
      <JobFilterBar
        value={{ ...filter, q: draftQuery }}
        filters={filters.data}
        onChange={handleFilterChange}
      />
      <div className="grid min-h-0 flex-1 items-start gap-4 xl:grid-cols-[360px_minmax(0,1fr)] xl:overflow-hidden 2xl:grid-cols-[400px_minmax(0,1fr)]">
        <div
          data-testid="job-list-pane"
          className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white xl:h-full"
        >
          
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2">
            <span className="text-xs text-slate-500">
              {list.total} tin
              {scored && (
                <span className="text-primary-600 ml-1 font-medium">
                  · Đúng ngành và kinh nghiệm
                </span>
              )}
            </span>
            {scored && (
              <span className="text-xs text-slate-500">Mới đăng trước</span>
            )}
            {!scored && !user && (
              <span className="text-xs text-slate-500">Mới nhất</span>
            )}
            {!scored && user && (
              <SelectMenu
                label="Sắp xếp"
                icon={SortDescending}
                align="right"
                value={filter.sort}
                options={SORT_OPTIONS}
                onChange={(next) => push({ ...filter, sort: next }, 0, selected)}
              />
            )}
          </div>
          <div
            className={cn(
              "min-h-0 flex-1 scrollbar-thin xl:overflow-y-auto",
              loading && "opacity-50 transition-opacity",
            )}
          >
            <JobList
              jobs={list.jobs}
              selectedId={selected}
              onSelect={handleSelect}
              onSavedChange={handleSavedChange}
            />
          </div>

          <div className="shrink-0 border-t border-slate-100">
            <Pagination
              offset={offset}
              limit={PAGE_SIZE}
              total={list.total}
              noun="tin"
              disabled={loading}
              onOffsetChange={(next) => push(filter, next, selected)}
            />
          </div>
        </div>

        <div
          data-testid="job-detail-pane"
          className="hidden min-w-0 scrollbar-thin xl:block xl:h-full xl:overflow-y-auto"
        >
          {selected ? (
            <JobDetailView key={selected} jobId={selected} embedded />
          ) : (
            <EmptyHint className="rounded-2xl border-slate-200 bg-white p-16 text-center">
              Chọn một việc làm ở danh sách bên trái để xem chi tiết.
            </EmptyHint>
          )}
        </div>
      </div>
    </div>
  );
}
