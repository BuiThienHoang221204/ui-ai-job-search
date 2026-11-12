"use client";

import Link from "next/link";
import { useState } from "react";
import { ChartLineUp } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { DashSection } from "@/components/ui/dash-section";
import { EmptyState } from "@/components/ui/empty-state";
import { UnderlineTabs } from "@/components/ui/underline-tabs";
import { MeterRow } from "@/components/ui/meter-row";
import { useDashboard } from "@/hooks/use-dashboard";

type View = "province" | "sub";

const VIEWS: { value: View; label: string }[] = [
  { value: "province", label: "Theo tỉnh" },
  { value: "sub", label: "Theo nghề" },
];

/** "Ngành của bạn tuần này": số tin mới trong ngành và top 5 tỉnh / nghề, mỗi dòng mở danh sách việc đã lọc sẵn. */
export function MarketCard() {
  const { data } = useDashboard();
  const [view, setView] = useState<View>("province");
  const market = data?.market;
  if (!market) return null;
  const rows = view === "province" ? market.provinces : market.subs;
  const max = Math.max(1, ...rows.map((row) => row.count));
  const hrefOf = (code: string) =>
    `/dashboard/jobs?scored=1&${view === "province" ? "province" : "subOccupation"}=${code}`;


  return (
    <DashSection
      title="Ngành của bạn tuần này"
      action={<UnderlineTabs tabs={VIEWS} value={view} onChange={setView} label="Xem theo" />}
      className="flex flex-col"
    >
      {rows.length === 0 ? (
        <EmptyState
          icon={ChartLineUp}
          title={`Chưa có tin mới trong ${market.days} ngày qua`}
          description="Mỗi đêm hệ thống quét tin mới đúng ngành của bạn. Xem thị trường để biết nghề nào đang tuyển nhiều."
          className="flex-1 justify-center py-6"
          action={
            <Link href="/dashboard/market">
              <Button variant="outline" size="sm">Xem thị trường việc làm</Button>
            </Link>
          }
        />
      ) : (
        <>
          <p className="text-sm text-slate-600">
            <b className="font-semibold text-slate-900 tabular-nums">{market.total}</b> tin mới trong {market.days} ngày
          </p>

          <ul className="mt-3 grid gap-1">
            {rows.map((row) => (
              <li key={row.code}>
                <Link href={hrefOf(row.code)} className="block rounded-lg py-1.5">
                  <MeterRow label={row.name} value={row.count} percent={Math.max(3, (row.count / max) * 100)} />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </DashSection>
  );
}
