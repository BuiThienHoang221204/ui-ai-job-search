"use client";

import {
  ArrowDown,
  ArrowUp,
  EyeSlash,
  Plus,
  Trash,
} from "@phosphor-icons/react/ssr";
import { useCvDraft } from "@/hooks/use-cv-draft";
import { ADD_ENTRY_LABELS, SECTION_LABELS, swap } from "@/lib/cv-fields";
import type { CvSectionKey } from "@/types";

const ICON_BUTTON =
  "inline-flex h-7 min-w-7 cursor-pointer items-center justify-center gap-1 rounded-md px-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent";

/** Thanh công cụ của mục đang chọn trên trang CV: đổi thứ tự, ẩn, thêm mục, xoá mục đang sửa. */
export function SectionToolbar({
  section,
  entry,
  top,
}: {
  section: CvSectionKey;
  entry: string | null;
  top: number;
}) {
  const layout = useCvDraft((state) => state.layout);
  const setLayout = useCvDraft((state) => state.setLayout);
  const addEntry = useCvDraft((state) => state.addEntry);
  const removeEntry = useCvDraft((state) => state.removeEntry);

  const visible = layout.order.filter((key) => !layout.hidden.includes(key));
  const position = visible.indexOf(section);
  const addLabel = ADD_ENTRY_LABELS[section];

  const move = (step: number) => {
    const at = layout.order.indexOf(section);
    setLayout({ ...layout, order: swap(layout.order, at, at + step) });
  };

  return (
    <div
      className="absolute right-3 z-10 flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5 text-xs shadow-md"
      style={{ top: Math.max(0, top - 34) }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <span className="px-2 font-semibold text-slate-800">
        {SECTION_LABELS[section]}
      </span>
      <button
        type="button"
        title="Đưa lên trên"
        aria-label={`Đưa ${SECTION_LABELS[section]} lên trên`}
        disabled={position <= 0}
        onClick={() => move(-1)}
        className={ICON_BUTTON}
      >
        <ArrowUp className="size-4" />
      </button>
      <button
        type="button"
        title="Đưa xuống dưới"
        aria-label={`Đưa ${SECTION_LABELS[section]} xuống dưới`}
        disabled={position === visible.length - 1}
        onClick={() => move(1)}
        className={ICON_BUTTON}
      >
        <ArrowDown className="size-4" />
      </button>
      <button
        type="button"
        title="Ẩn khỏi CV — bật lại ở tab Bố cục"
        aria-label={`Ẩn ${SECTION_LABELS[section]} khỏi CV`}
        onClick={() =>
          setLayout({ ...layout, hidden: [...layout.hidden, section] })
        }
        className={ICON_BUTTON}
      >
        <EyeSlash className="size-4" />
      </button>
      {entry && (
        <button
          type="button"
          title="Xoá mục đang sửa"
          aria-label="Xoá mục đang sửa"
          onClick={() => removeEntry(entry)}
          className={ICON_BUTTON}
        >
          <Trash className="size-4" />
        </button>
      )}
      {addLabel && (
        <>
          <span className="mx-0.5 h-4 w-px bg-slate-200" />
          <button
            type="button"
            onClick={() => addEntry(section)}
            className={`${ICON_BUTTON} font-semibold text-primary-700`}
          >
            <Plus className="size-4" />
            {addLabel}
          </button>
        </>
      )}
    </div>
  );
}
