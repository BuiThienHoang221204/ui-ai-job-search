"use client";

import { documentsService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";
import { useCvDraft } from "@/hooks/use-cv-draft";

const ACCENT_CHOICES = [
  "#3873b3",
  "#0f766e",
  "#b45309",
  "#1f3864",
  "#334155",
  "#9d174d",
] as const;

/** Dải chọn mẫu trình bày ngay dưới đầu khu làm việc; đổi mẫu chỉ đổi bản xem trước, không gọi AI. */
export function CvTemplateStrip() {
  const { data: templates } = useApiQuery(
    keys.cvTemplates(),
    () => documentsService.cvTemplates(),
    { errorMessage: "Không tải được danh sách mẫu", staleTime: Infinity },
  );
  const templateId = useCvDraft((state) => state.templateId);
  const accent = useCvDraft((state) => state.accent);
  const setTemplate = useCvDraft((state) => state.setTemplate);
  const setAccent = useCvDraft((state) => state.setAccent);
  const selected = templates?.find((template) => template.id === templateId);

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

      {selected?.usesAccent && (
        <span className="ml-auto flex items-center gap-1.5">
          <span className="mr-1 text-xs text-slate-500">Màu nhấn</span>
          {ACCENT_CHOICES.map((choice) => (
            <button
              key={choice}
              type="button"
              aria-label={`Màu ${choice}`}
              aria-pressed={(accent ?? selected.accent) === choice}
              onClick={() => setAccent(choice)}
              className={cn(
                "size-6 cursor-pointer rounded-full border-2 transition",
                (accent ?? selected.accent) === choice
                  ? "border-slate-900"
                  : "border-transparent hover:border-slate-300",
              )}
              style={{ backgroundColor: choice }}
            />
          ))}
        </span>
      )}
    </div>
  );
}
