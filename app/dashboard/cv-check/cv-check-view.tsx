"use client";

import { useEffect } from "react";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { useCvCheck } from "@/hooks/use-cv-check";
import { useLoginModal } from "@/hooks/use-login-modal";
import { usePendingCv } from "@/hooks/use-pending-cv";
import { useSession } from "@/hooks/use-session";
import { CvCheckReport } from "./report/cv-check-report";
import { CvPicker } from "./cv-picker";
import { CvProgress } from "./cv-progress";
import { RubricCards } from "./rubric-cards";

/** Trang phân tích CV cho cả khách lẫn người đã đăng nhập: chọn file PDF hoặc dán chữ, chờ phân tích, xem báo cáo. */
export function CvCheckView() {
  const { source, phase, result, error, run, runText, reset } = useCvCheck();
  const { user } = useSession();
  const openLogin = useLoginModal((state) => state.open);

  useEffect(() => {
    const pending = usePendingCv.getState().take();
    if (pending) void run(pending);
  }, [run]);

  let content = (
    <div className="space-y-8">
      <CvPicker
        onPick={(picked) => void run(picked)}
        onText={(text) => void runText(text)}
      />
      <RubricCards />
      <div className="grid gap-5 border-t border-slate-200 pt-5 text-sm md:grid-cols-3 md:gap-7">
        <div>
          <p className="font-semibold text-slate-900">CV là ảnh quét?</p>
          <p className="mt-1 text-slate-500">
            Máy lọc hồ sơ cũng không đọc được. Xuất lại từ Word, Google Docs hay
            Canva thành PDF có chữ, hoặc dán chữ của CV vào tab bên cạnh.
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">
            Hết 4 lượt AI trong ngày?
          </p>
          <p className="mt-1 text-slate-500">
            Vẫn có điểm và các lỗi đáng sửa, chỉ thiếu phần nhận xét của AI.
          </p>
        </div>
        {!user && (
          <div>
            <p className="font-semibold text-slate-900">Muốn sửa luôn?</p>
            <p className="mt-1 text-slate-500">
              Có tài khoản thì tạo hồ sơ từ chính CV này và nhận gợi ý viết lại
              từng dòng.{" "}
              <button
                type="button"
                onClick={() =>
                  openLogin({ mode: "register", next: "/dashboard/cv-check" })
                }
                className="text-primary-600 cursor-pointer font-semibold hover:underline"
              >
                Tạo tài khoản
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
  if (phase !== "idle") {
    content = <CvProgress source={source} phase={phase} />;
  } else if (result && source) {
    content = <CvCheckReport result={result} source={source} onReset={reset} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phân tích CV"
        subtitle="Xem máy lọc hồ sơ có đọc được CV của bạn không, và những dòng nào nên viết lại."
      />
      {error && <Alert tone="danger">{error}</Alert>}
      {content}
    </div>
  );
}
