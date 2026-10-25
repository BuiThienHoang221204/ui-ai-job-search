"use client";

import { CheckCircle, Plus } from "@phosphor-icons/react/ssr";
import { useCompanyFollows } from "@/hooks/use-company-follows";
import { cn } from "@/lib/cn";

/** Nút theo dõi công ty của tin, cạnh tên công ty. */
export function FollowCompanyButton({
  jobId,
  companyKey,
}: {
  jobId: string;
  companyKey: string;
}) {
  const { list, busy, follow, unfollow } = useCompanyFollows();
  const current = list.find((item) => item.companyKey === companyKey);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void (current ? unfollow(current.id) : follow(jobId))}
      className={cn(
        "border-primary-200 text-primary-700 hover:bg-primary-50 inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors disabled:opacity-50",
        current ? "bg-primary-50" : "bg-white",
      )}
    >
      {current ? (
        <CheckCircle className="size-3.5" weight="fill" />
      ) : (
        <Plus className="size-3.5" />
      )}
      {current ? "Đang theo dõi" : "Theo dõi"}
    </button>
  );
}
