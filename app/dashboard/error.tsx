"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowClockwise } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";

/** Lỗi khi dựng một trang trong dashboard: giữ khung app, cho bấm thử lại thay vì sập cả trang. */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="max-w-md text-center">
        <Image
          src="/icons/warning-sign.png"
          alt=""
          width={144}
          height={144}
          priority
          className="mx-auto mb-5 size-36"
        />
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Trang này gặp sự cố khi hiển thị
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Dữ liệu của bạn vẫn an toàn. Bấm thử lại; nếu vẫn lỗi, quay về Tổng
          quan rồi mở lại trang sau ít phút.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Button size="lg" onClick={reset}>
            <ArrowClockwise className="size-4.5" />
            Thử lại
          </Button>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              Về Tổng quan
            </Button>
          </Link>
        </div>
        {error.digest && (
          <p className="mt-5 text-xs text-slate-400">
            Mã lỗi:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600">
              {error.digest}
            </code>
          </p>
        )}
      </div>
    </div>
  );
}
