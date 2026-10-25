"use client";

import { Buildings } from "@phosphor-icons/react/ssr";
import { FilterChip } from "@/components/ui/filter-chip";
import { useCompanyFollows } from "@/hooks/use-company-follows";

/** Dòng "Công ty đang theo dõi" trong mục Thông báo: bấm ✕ để bỏ theo dõi. */
export function FollowedCompanies() {
  const { list, unfollow } = useCompanyFollows();

  return (
    <div className="flex items-start gap-3 py-3">
      <Buildings className="mt-0.5 size-5 shrink-0 text-slate-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">
          Công ty đang theo dõi ({list.length})
        </p>
        {list.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {list.map((item) => (
              <FilterChip
                key={item.id}
                label={item.name}
                onRemove={() => void unfollow(item.id)}
              />
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-slate-500">
          Bấm &quot;Theo dõi&quot; cạnh tên công ty ở trang chi tiết tin để
          thêm. Tin mới của các công ty này có trong thông báo tìm việc lúc
          07:30.
        </p>
      </div>
    </div>
  );
}
