"use client";

import Link from "next/link";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  ArrowSquareOut,
  Lock,
  Prohibit,
  Shield,
  SignOut,
  UserGear,
} from "@phosphor-icons/react/ssr";
import { useSession } from "@/components/dashboard/session";
import { PageHeader } from "@/components/dashboard/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { DisplayCard } from "./display-card";
import { Skeleton } from "@/components/ui/skeleton";

/** Trang tài khoản; chỉ hiện những gì backend thật sự có. */
export default function SettingsPage() {
  const { user, loading, logout } = useSession();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tài khoản"
        subtitle="Giao diện, dữ liệu và phiên đăng nhập"
      />

      <div className="space-y-4">
        <DisplayCard />

        <SectionCard icon={UserGear} title="Thông tin đăng nhập">
          {loading ? (
            <Skeleton className="h-24 animate-pulse" />
          ) : (
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium text-slate-400">Họ và tên</dt>
                <dd className="mt-0.5 text-sm text-slate-900">
                  {user?.name ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Email</dt>
                <dd className="mt-0.5 font-mono text-sm text-slate-900">
                  {user?.email ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Vai trò</dt>
                <dd className="mt-0.5 text-sm text-slate-900">
                  {user?.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
                </dd>
              </div>
            </dl>
          )}

          <p className="mt-5 max-w-2xl border-t border-slate-100 pt-4 text-xs text-slate-500">
            Chưa đổi được tên hay email từ giao diện — backend chưa có endpoint
            cập nhật. Kỹ năng, kinh nghiệm và định hướng nghề nghiệp nằm ở{" "}
            <Link
              href="/dashboard/profile"
              className="font-medium text-slate-900 underline underline-offset-2"
            >
              Hồ sơ của tôi
            </Link>
            .
          </p>
        </SectionCard>

        <SectionCard
          icon={Shield}
          title="Dữ liệu của bạn đi những đâu"
          description="Ba việc hệ thống làm với hồ sơ của bạn"
        >
          <dl className="grid gap-6 sm:grid-cols-3">
            <DataFact
              icon={ArrowSquareOut}
              tone="bg-amber-50 text-amber-700"
              term="Gửi tới nhà cung cấp model"
              detail="Mỗi lần chấm điểm việc làm hoặc sinh CV. Đó là cách hệ thống hoạt động."
            />
            <DataFact
              icon={Prohibit}
              tone="bg-emerald-50 text-emerald-700"
              term="Không gửi cho nhà tuyển dụng"
              detail="Việc nộp hồ sơ trên trang tuyển dụng vẫn do bạn tự làm."
            />
            <DataFact
              icon={Lock}
              tone="bg-primary-50 text-primary-700"
              term="Lưu trên máy chủ hệ thống"
              detail="CV và thư xin việc đã sinh — chỉ tài khoản của bạn đọc được."
            />
          </dl>
        </SectionCard>

        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1">
          <p className="text-xs text-slate-500">
            Đăng xuất cũng có sẵn ở chân thanh bên.
          </p>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <SignOut className="size-4.5" />
            Đăng xuất khỏi thiết bị này
          </button>
        </div>
      </div>
    </div>
  );
}

/** Một dòng thông tin kèm biểu tượng về dữ liệu tài khoản. */
function DataFact({
  icon: Icon,
  tone,
  term,
  detail,
}: {
  icon: PhosphorIcon;
  tone: string;
  term: string;
  detail: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-2.5 text-sm font-medium text-slate-900">
        <span
          className={`flex size-6 shrink-0 items-center justify-center rounded-md ${tone}`}
        >
          <Icon className="size-3.5" />
        </span>
        {term}
      </dt>
      <dd className="mt-2 text-xs leading-relaxed text-slate-600">{detail}</dd>
    </div>
  );
}
