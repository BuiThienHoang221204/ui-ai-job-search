"use client";

import { SelectMenu } from "@/components/ui/select-menu";
import { useCvTemplates } from "@/hooks/use-cv-templates";
import { useCvDraft } from "@/hooks/use-cv-draft";
import { cn } from "@/lib/cn";
import type { CvFont, CvFontSize } from "@/types";

const ACCENT_CHOICES = [
  "#3873b3",
  "#0f766e",
  "#b45309",
  "#1f3864",
  "#334155",
  "#9d174d",
] as const;

const FONTS: { value: CvFont | ""; label: string }[] = [
  { value: "", label: "Theo mẫu" },
  { value: "noto-sans", label: "Noto Sans" },
  { value: "arial", label: "Arial" },
  { value: "noto-serif", label: "Noto Serif" },
  { value: "times", label: "Times New Roman" },
];

const SIZES: { value: CvFontSize; label: string }[] = [
  { value: "small", label: "Nhỏ" },
  { value: "medium", label: "Vừa" },
  { value: "large", label: "Lớn" },
];

const LINE_HEIGHTS: { value: number | undefined; label: string }[] = [
  { value: undefined, label: "Theo mẫu" },
  { value: 1.2, label: "1.2" },
  { value: 1.35, label: "1.35" },
  { value: 1.5, label: "1.5" },
  { value: 1.65, label: "1.65" },
  { value: 1.8, label: "1.8" },
];

const CHOICE =
  "h-9 flex-1 cursor-pointer rounded-lg border text-sm font-medium transition-colors";
const CHOSEN = "border-primary-600 bg-primary-50 text-primary-700";
const IDLE = "border-slate-200 text-slate-600 hover:border-slate-300";

/** Màu nhấn, font, cỡ chữ, khoảng cách dòng cho cả CV; đổi không tốn lượt gọi AI. */
export function CvDesignPanel() {
  const { data: templates } = useCvTemplates();
  const templateId = useCvDraft((state) => state.templateId);
  const accent = useCvDraft((state) => state.accent);
  const setAccent = useCvDraft((state) => state.setAccent);
  const selected = templates?.find((template) => template.id === templateId);
  const currentAccent = accent ?? selected?.accent;
  const typography = useCvDraft((state) => state.typography);
  const setTypography = useCvDraft((state) => state.setTypography);
  const size = typography.size ?? "medium";

  return (
    <div className="space-y-5">
      {selected?.usesAccent && (
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-700">Màu nhấn</p>
          <div className="flex flex-wrap gap-2">
            {ACCENT_CHOICES.map((choice) => (
              <button
                key={choice}
                type="button"
                aria-label={`Màu ${choice}`}
                aria-pressed={currentAccent === choice}
                onClick={() => setAccent(choice)}
                className={cn(
                  "size-8 cursor-pointer rounded-full border-2 transition",
                  currentAccent === choice
                    ? "border-slate-900"
                    : "border-transparent hover:border-slate-300",
                )}
                style={{ backgroundColor: choice }}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold text-slate-700">Font chữ</p>
        <SelectMenu<CvFont | "">
          variant="field"
          label="Font chữ"
          value={typography.font ?? ""}
          options={FONTS}
          onChange={(font) =>
            setTypography({ ...typography, font: font || undefined })
          }
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-slate-700">Cỡ chữ</p>
        <div className="flex gap-2">
          {SIZES.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={size === item.value}
              onClick={() =>
                setTypography({
                  ...typography,
                  size: item.value === "medium" ? undefined : item.value,
                })
              }
              className={`${CHOICE} ${size === item.value ? CHOSEN : IDLE}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-slate-700">
          Khoảng cách dòng
        </p>
        <div className="grid grid-cols-3 gap-2">
          {LINE_HEIGHTS.map((item) => (
            <button
              key={item.label}
              type="button"
              aria-pressed={typography.lineHeight === item.value}
              onClick={() =>
                setTypography({ ...typography, lineHeight: item.value })
              }
              className={`${CHOICE} ${typography.lineHeight === item.value ? CHOSEN : IDLE}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
        Áp cho cả CV và bản PDF tải về. Chỉ có các font in được đủ dấu tiếng
        Việt. Bấm “Lưu thay đổi” để giữ lại.
      </p>
    </div>
  );
}
