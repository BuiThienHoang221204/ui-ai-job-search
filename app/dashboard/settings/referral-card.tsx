"use client";

import { Copy, Gift } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { useCopy } from "@/hooks/use-copy";
import { useReferrals } from "@/hooks/use-referrals";

/** Thẻ "Mời bạn bè": link mời, số bạn đã tham gia và phút giọng nói được thưởng còn lại. */
export function ReferralCard() {
  const { data } = useReferrals();
  const { copied, copy } = useCopy();
  if (!data) return null;

  const link = `${window.location.origin}/register?ref=${data.code}`;

  return (
    <SectionCard
      icon={Gift}
      title="Mời bạn bè"
      description={`Mỗi người bạn mời đăng ký và chọn ngành nghề: cả hai được thêm ${data.rewardMinutes} phút luyện phỏng vấn bằng giọng nói. Tối đa ${data.maxRewarded} người.`}
    >
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-1.5 pl-3">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700">
          {link}
        </span>
        <Button size="sm" onClick={() => copy("referral", link)}>
          <Copy className="size-3.5" />
          {copied === "referral" ? "Đã chép" : "Chép link"}
        </Button>
      </div>
      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
        <div>
          <dd className="font-display text-xl font-semibold text-slate-900">
            {data.joined}
          </dd>
          <dt className="text-xs text-slate-500">người đã tham gia</dt>
        </div>
        <div>
          <dd className="font-display text-xl font-semibold text-slate-900">
            {data.pending}
          </dd>
          <dt className="text-xs text-slate-500">đang chờ chọn ngành</dt>
        </div>
        <div>
          <dd className="font-display text-xl font-semibold text-slate-900">
            {data.bonusMinutesLeft} phút
          </dd>
          <dt className="text-xs text-slate-500">thưởng còn lại</dt>
        </div>
      </dl>
      <p className="mt-3 text-xs text-slate-500">
        Phút thưởng dùng khi đã hết 30 phút giọng nói trong 24 giờ, không hết
        hạn.
      </p>
    </SectionCard>
  );
}
