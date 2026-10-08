"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin } from "@phosphor-icons/react/ssr";
import { cn } from "@/utils";
import { DashSection } from "@/components/dashboard/dash-section";
import { useDashboard } from "./use-dashboard";

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

  const switcher = (
    <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
      {VIEWS.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => setView(item.value)}
          aria-pressed={view === item.value}
          className={cn(
            "cursor-pointer rounded-md px-2.5 py-1 text-xs",
            view === item.value ? "bg-white font-semibold text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <DashSection title="Ngành của bạn tuần này" icon={MapPin} action={switcher}>
      <p className="flex flex-wrap items-baseline gap-x-2.5">
        <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">{market.total}</span>
        <span className="text-sm text-slate-500">tin mới trong {market.days} ngày</span>
      </p>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Chưa có tin mới nào trong {market.days} ngày qua.</p>
      ) : (
        <ul className="mt-4">
          {rows.map((row, index) => (
            <li key={row.code}>
              <Link
                href={hrefOf(row.code)}
                className="group grid grid-cols-[minmax(5.5rem,8rem)_minmax(0,1fr)_2.25rem] items-center gap-3.5 py-1.5"
              >
                <span className="truncate text-sm text-slate-700 group-hover:text-primary-600">{row.name}</span>
                <span className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className={cn("block h-full rounded-full", index === 0 ? "bg-primary-600" : "bg-primary-200")}
                    style={{ width: `${Math.max(3, (row.count / max) * 100)}%` }}
                  />
                </span>
                <span className="text-right text-sm font-semibold text-slate-800 tabular-nums">{row.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-slate-400">Theo tin Careelot thu thập từ các trang tuyển dụng. Bấm một dòng để xem việc đã lọc sẵn.</p>
    </DashSection>
  );
}
