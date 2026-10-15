"use client";

import { useCvTemplates } from "@/hooks/use-cv-templates";
import { Skeleton } from "@/components/ui/skeleton";
import { useCvDraft } from "@/hooks/use-cv-draft";
import { cn } from "@/lib/cn";

/** Dải chọn mẫu trình bày ngay dưới đầu khu làm việc; đổi mẫu chỉ đổi bản xem trước, không gọi AI. */
export function CvTemplateStrip() {
  const { data: templates } = useCvTemplates();
  const templateId = useCvDraft((state) => state.templateId);
  const setTemplate = useCvDraft((state) => state.setTemplate);

  return (
    <div className="flex flex-wrap items-center gap-2 px-5 py-4 sm:px-6">
      <span className="mr-1 text-xs text-slate-500">Mẫu trình bày</span>
      {!templates
        ? Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-28 rounded-lg" />
          ))
        : templates.map((template) => (
            <button
              key={template.id}
              type="button"
              title={template.description}
              aria-pressed={template.id === templateId}
              onClick={() => setTemplate(template.id)}
              className={cn(
                "flex h-9 cursor-pointer items-center gap-2 rounded-lg border bg-white pr-3 pl-1.5 text-sm transition",
                template.id === templateId
                  ? "border-primary-600 font-semibold text-slate-900 ring-3 ring-primary-50"
                  : "border-slate-200 font-medium text-slate-600 hover:border-slate-300",
              )}
            >
              <span
                className="size-6 rounded-md border border-slate-200"
                style={{
                  background: `linear-gradient(180deg, ${template.accent} 0 30%, #fff 30%)`,
                }}
              />
              {template.name}
            </button>
          ))}
    </div>
  );
}
