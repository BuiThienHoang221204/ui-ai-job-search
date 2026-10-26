"use client";

import type { ReactNode } from "react";
import { Check, Sparkle } from "@phosphor-icons/react/ssr";
import { ModelElapsed } from "@/components/ui/model-elapsed";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

/** Màn chờ trong lúc AI viết một tài liệu: các bước xong dần bên trái, bản nháp hiện dần bên phải (`children`). */
export function GenerationProgress({
  title,
  hint,
  steps,
  expectedSeconds,
  children,
}: {
  title: string;
  hint: string;
  steps: { label: string; done: boolean }[];
  expectedSeconds: number;
  children: ReactNode;
}) {
  const current = steps.findIndex((step) => !step.done);

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <Card className="p-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
          <Sparkle className="size-3.5" />
          AI đang viết
        </span>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 mb-5 text-sm text-slate-500">{hint}</p>
        <ol>
          {steps.map((step, index) => {
            let dotClass = "border-slate-200 text-slate-400";
            if (step.done)
              dotClass = "border-emerald-500 bg-emerald-500 text-white";
            else if (index === current)
              dotClass = "animate-spin border-primary-600 border-t-transparent";
            return (
              <li
                key={step.label}
                className="relative grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 pb-4 last:pb-0"
              >
                {index < steps.length - 1 && (
                  <span
                    className={cn(
                      "absolute top-8 bottom-1 left-[0.8rem] w-0.5",
                      step.done ? "bg-emerald-500" : "bg-slate-200",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border-2 text-xs",
                    dotClass,
                  )}
                >
                  {step.done ? (
                    <Check weight="bold" className="size-3.5" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "pt-1 text-sm",
                    step.done || index === current
                      ? "font-semibold text-slate-900"
                      : "text-slate-400",
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
        <ModelElapsed expected={expectedSeconds} className="mt-5 mb-0" />
      </Card>

      <div className="rounded-2xl border border-slate-200/80 bg-slate-100/70 p-4 sm:p-5">
        <p className="mb-3 px-1 text-xs text-slate-500">
          Bản nháp đang hình thành
        </p>
        <div className="mx-auto min-h-[32rem] max-w-3xl rounded bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Vài dòng xám nhấp nháy thay cho bản nháp khi AI chưa trả về chữ nào. */
export function DraftPlaceholder() {
  return (
    <div className="space-y-3">
      {[80, 64, 72, 48].map((width) => (
        <div
          key={width}
          className="h-2.5 animate-pulse rounded bg-slate-100"
          style={{ width: `${width}%` }}
        />
      ))}
    </div>
  );
}
