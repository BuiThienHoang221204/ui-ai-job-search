import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Không tìm thấy trang — Careelot" };

const QUICK_LINKS = [
  { href: "/dashboard/jobs?scored=1", label: "Việc làm phù hợp" },
  { href: "/salary", label: "Tra cứu lương" },
  { href: "/dashboard/cv-optimizer", label: "Tối ưu CV" },
];

/** Trang 404 cho đường dẫn sai và cho mọi trang gọi `notFound()`. */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md text-center">
        <Link href="/" className="mb-8 inline-block">
          <BrandLogo className="h-[35px] w-[140px]" />
        </Link>
        <p className="font-display text-7xl leading-none tracking-tight text-primary-600">
          404
        </p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
          Không tìm thấy trang này
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Đường dẫn có thể đã sai, hoặc tin tuyển dụng đã hết hạn và bị gỡ.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Link href="/dashboard/jobs">
            <Button size="lg">Xem việc làm</Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="outline">
              Về trang chủ
            </Button>
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-dashed border-slate-200 pt-5 text-sm">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-600 hover:text-primary-600"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
