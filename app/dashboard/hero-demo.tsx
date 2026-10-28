"use client";

import { useRef, type CSSProperties } from "react";
import { Bell } from "@phosphor-icons/react/ssr";
import { formatCount } from "@/lib/number";

const CARD =
  "rounded-2xl border border-slate-200 bg-white shadow-[0_24px_50px_-24px_rgba(30,27,75,0.35)]";
const LABEL = "text-primary-600 text-2xs font-bold tracking-widest uppercase";
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const BARS = [
  { label: "ATS đọc được", value: 100, score: "30/30" },
  { label: "Nội dung", value: 51, score: "23/45" },
  { label: "Cấu trúc", value: 84, score: "21/25" },
];

/** Đoạn trình diễn lặp trên trang chào: đọc CV, chấm điểm, viết lại một dòng, đối chiếu tin, báo tin mới; chạy bằng CSS, chuột chỉ để nghiêng khung. */
export function HeroDemo({ jobCount }: { jobCount: number | null }) {
  const stage = useRef<HTMLDivElement>(null);

  return (
    <div
      className="@container relative h-[32.5rem] [perspective:1200px]"
      onMouseMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        if (stage.current) {
          stage.current.style.transform = `rotateX(${-y * 8}deg) rotateY(${x * 10}deg)`;
        }
      }}
      onMouseLeave={() => {
        if (stage.current) stage.current.style.transform = "";
      }}
    >
      <span aria-hidden className="hd-orb hd-orb-1" />
      <span aria-hidden className="hd-orb hd-orb-2" />
      <span aria-hidden className="hd-orb hd-orb-3" />

      <div ref={stage} className="hd-stage absolute inset-0">
        <div className="hd-glow absolute inset-[1.25rem_0_6.5rem_0] @lg:inset-[1.25rem_0_7.5rem_2.5rem] rounded-[1.125rem] p-0.5">
          <div className="relative h-full overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <i className="size-2.5 rounded-full bg-slate-300" />
              <i className="size-2.5 rounded-full bg-slate-300" />
              <i className="size-2.5 rounded-full bg-slate-300" />
              <span className="ml-2.5 flex h-6 flex-1 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-500">
                <i className="size-2 rounded-full bg-emerald-500" />
                careelot.vn/dashboard/cv-check
              </span>
            </div>

            <div className="relative grid grid-cols-[minmax(0,1fr)] gap-3.5 p-4 @lg:gap-4 @lg:px-5 @lg:py-4.5">
              <div className="hd-reading absolute inset-0 z-10 grid place-content-center justify-items-center gap-3 bg-white">
                <div className="relative h-37 w-30 overflow-hidden rounded-lg border border-slate-300 px-3 py-3.5">
                  {[
                    "w-3/5",
                    "w-full",
                    "w-5/6",
                    "w-full",
                    "w-2/3",
                    "w-full",
                    "w-4/5",
                  ].map((width, index) => (
                    <i
                      key={index}
                      className={`mb-2 block h-1.5 rounded-sm bg-slate-100 ${width}`}
                    />
                  ))}
                  <span className="hd-scan absolute inset-x-0 top-0 h-9" />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  Đang đọc CV…
                </p>
              </div>

              <div className="flex items-center gap-4.5">
                <div className="relative size-18 shrink-0 @lg:size-21">
                  <svg
                    viewBox="0 0 84 84"
                    className="hd-ring size-full -rotate-90"
                  >
                    <defs>
                      <linearGradient id="hd-grad" x1="0" x2="1">
                        <stop offset="0" stopColor="var(--color-primary-600)" />
                        <stop offset="1" stopColor="oklch(0.72 0.15 220)" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="42"
                      cy="42"
                      r="36"
                      fill="none"
                      strokeWidth="9"
                      className="stroke-slate-100"
                    />
                    <circle
                      cx="42"
                      cy="42"
                      r="36"
                      fill="none"
                      strokeWidth="9"
                      stroke="url(#hd-grad)"
                      strokeLinecap="round"
                      strokeDasharray="226"
                      strokeDashoffset="63.3"
                    />
                  </svg>
                  <Odometer value={72} className="text-2xl" />
                </div>
                <div className="hd-grade min-w-0">
                  <p className={LABEL}>Phân tích CV</p>
                  <p className="font-display text-lg text-slate-900 @lg:text-xl">
                    Khá · 3 lỗi đáng sửa
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    Hướng tới Backend Developer · Junior
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                {BARS.map((bar, index) => (
                  <div
                    key={bar.label}
                    className="grid grid-cols-[6.5rem_minmax(0,1fr)_2.5rem] items-center @lg:grid-cols-[7.5rem_minmax(0,1fr)_2.5rem] gap-2.5 text-xs text-slate-500"
                  >
                    {bar.label}
                    <i className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <span
                        className="hd-bar from-primary-600 block h-full rounded-full bg-linear-to-r to-sky-500"
                        style={{
                          width: `${bar.value}%`,
                          animationDelay: `${index * 0.22}s`,
                        }}
                      />
                    </i>
                    <em className="text-right font-mono font-semibold text-slate-900 not-italic">
                      {bar.score}
                    </em>
                  </div>
                ))}
              </div>

              <div className="hd-rewrite overflow-hidden rounded-xl border border-slate-200 text-sm">
                <div className="grid gap-0.5 bg-slate-50 @lg:grid-cols-[5.5rem_minmax(0,1fr)] @lg:gap-2.5 px-3 py-2.5 text-slate-500">
                  <span className="text-2xs font-bold text-rose-600">
                    Câu trong CV
                  </span>
                  <span className="hd-strike relative justify-self-start">
                    Tham gia tối ưu hệ thống
                  </span>
                </div>
                <div className="grid gap-0.5 border-t @lg:grid-cols-[5.5rem_minmax(0,1fr)] @lg:gap-2.5 border-slate-200 px-3 py-2.5">
                  <span className="text-2xs font-bold text-emerald-600">
                    Gợi ý viết lại
                  </span>
                  <span className="hd-type relative justify-self-start text-slate-900">
                    Tối ưu truy vấn PostgreSQL, giảm độ trễ{" "}
                    <span className="rounded border border-dashed border-amber-500 bg-amber-50 px-1 font-mono text-xs font-bold text-amber-600">
                      [__]
                    </span>
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`hd-match absolute inset-x-3 bottom-0 @lg:right-auto @lg:bottom-2.5 @lg:left-0 @lg:w-72 px-4 py-3.5 ${CARD}`}
        >
          <div className="flex items-center gap-3">
            <div className="relative size-13.5 shrink-0">
              <svg
                viewBox="0 0 84 84"
                className="hd-ring hd-late size-full -rotate-90"
              >
                <defs>
                  <linearGradient id="hd-grad-2" x1="0" x2="1">
                    <stop offset="0" stopColor="oklch(0.65 0.17 160)" />
                    <stop offset="1" stopColor="var(--color-primary-600)" />
                  </linearGradient>
                </defs>
                <circle
                  cx="42"
                  cy="42"
                  r="36"
                  fill="none"
                  strokeWidth="8"
                  className="stroke-slate-100"
                />
                <circle
                  cx="42"
                  cy="42"
                  r="36"
                  fill="none"
                  strokeWidth="8"
                  stroke="url(#hd-grad-2)"
                  strokeLinecap="round"
                  strokeDasharray="226"
                  strokeDashoffset="40.7"
                />
              </svg>
              <Odometer value={82} suffix="%" late className="text-sm" />
            </div>
            <div className="min-w-0">
              <p className={LABEL}>Đối chiếu tin</p>
              <p className="truncate font-semibold text-slate-900">
                Backend Developer (NestJS)
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs font-semibold">
            {[
              { label: "✓ NestJS", tone: "bg-emerald-50 text-emerald-600" },
              { label: "✓ Redis", tone: "bg-emerald-50 text-emerald-600" },
              { label: "✕ Kubernetes", tone: "bg-rose-50 text-rose-600" },
            ].map((chip, index) => (
              <span
                key={chip.label}
                className={`hd-chip rounded-md px-2 py-0.5 ${chip.tone}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>

        <div
          className={`hd-toast absolute -top-1 -right-2 flex items-center gap-2.5 px-3.5 py-2.5 ${CARD}`}
        >
          <span className="bg-primary-50 text-primary-600 grid size-7.5 place-items-center rounded-lg">
            <Bell weight="fill" className="size-4" />
          </span>
          <span className="text-sm font-semibold text-slate-900">
            +12 tin mới khớp hồ sơ
            <span className="block text-xs font-normal text-slate-500">
              Cập nhật lúc 06:00 sáng nay
            </span>
          </span>
        </div>

        {jobCount !== null && (
          <div
            className={`hd-pill absolute right-8 bottom-10 hidden @lg:flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold text-slate-900 ${CARD}`}
          >
            <i className="hd-ping relative size-2 rounded-full bg-emerald-500" />
            {formatCount(jobCount)} tin đang tuyển
          </div>
        )}
      </div>
    </div>
  );
}

/** Số chạy kiểu đồng hồ cơ: mỗi chữ số là cột 0–9 trượt bằng transform, nên vòng lặp không bắt trình duyệt tính lại style. */
function Odometer({
  value,
  suffix,
  late,
  className,
}: {
  value: number;
  suffix?: string;
  late?: boolean;
  className: string;
}) {
  return (
    <b
      aria-label={`${value}${suffix ?? ""}`}
      className={`font-display absolute inset-0 flex items-center justify-center leading-none text-slate-900 ${className}`}
    >
      {String(value)
        .split("")
        .map((digit, index) => (
          <span key={index} aria-hidden className="h-[1em] overflow-hidden">
            <span
              className={`hd-digit flex flex-col ${late ? "hd-late" : ""}`}
              style={{ "--d": digit } as CSSProperties}
            >
              {DIGITS.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        ))}
      {suffix}
    </b>
  );
}
