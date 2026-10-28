import { ProgressCircle } from "@/components/ui/progress-circle";
import { GuestStep } from "./guest-step";

const TAG = "text-primary-600 text-2xs font-bold tracking-widest uppercase";

/** Minh hoạ ba bước của sản phẩm trên trang chào (dữ liệu tĩnh): phân tích CV, đối chiếu tin, gợi ý viết lại. */
export function GuestSteps() {
  return (
    <div className="relative grid gap-3.5 pl-9 before:absolute before:top-6 before:bottom-6 before:left-3.5 before:border-l-2 before:border-dashed before:border-slate-200">
      <GuestStep n={1}>
        <ProgressCircle value={72} size={52} strokeWidth={6}>
          <span className="font-display text-base text-slate-900">72</span>
        </ProgressCircle>
        <div className="min-w-0">
          <p className={TAG}>Phân tích CV</p>
          <p className="font-semibold text-slate-900">Khá · 3 lỗi đáng sửa</p>
          <p className="text-xs text-slate-500">
            Máy lọc đọc được · thiếu số liệu
          </p>
        </div>
      </GuestStep>
      <GuestStep n={2} className="[animation-delay:-2s]">
        <ProgressCircle value={82} size={52} strokeWidth={6}>
          <span className="font-display text-base text-slate-900">
            82<small className="text-2xs text-slate-500">%</small>
          </span>
        </ProgressCircle>
        <div className="min-w-0">
          <p className={TAG}>Đối chiếu tin</p>
          <p className="font-semibold text-slate-900">
            Backend Developer (NestJS)
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5 text-2xs font-semibold">
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-600">
              ✓ NestJS
            </span>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-600">
              ✓ Redis
            </span>
            <span className="rounded-md bg-rose-50 px-2 py-0.5 text-rose-600">
              ✕ Kubernetes
            </span>
          </div>
        </div>
      </GuestStep>
      <GuestStep n={3} className="[animation-delay:-4s]">
        <div className="min-w-0">
          <p className={TAG}>Gợi ý viết lại</p>
          <p className="text-sm text-slate-500 line-through">
            Tham gia tối ưu hệ thống
          </p>
          <p className="text-sm text-slate-900">
            Tối ưu truy vấn PostgreSQL, giảm độ trễ{" "}
            <mark className="rounded bg-amber-50 px-1 font-bold text-amber-600">
              [__]%
            </mark>
          </p>
        </div>
      </GuestStep>
    </div>
  );
}
