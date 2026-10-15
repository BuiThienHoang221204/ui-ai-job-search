"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCvDraft } from "@/hooks/use-cv-draft";
import { useCvInlineEdit } from "@/hooks/use-cv-inline-edit";
import { placeCaretAtEnd } from "@/lib/cv-frame";
import { SectionToolbar } from "./section-toolbar";

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

const PREVIEW_PAGES = 2;

/** Trang CV đúng tỉ lệ A4 trong iframe `srcDoc`, gõ sửa thẳng lên trang được. `fullSize` hiện đúng 100% thay vì vừa khung. */
export function CvPreview({
  html,
  fullSize,
}: {
  html: string | null;
  fullSize: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [fitScale, setFitScale] = useState(0);
  const [loads, setLoads] = useState(0);
  const active = useCvInlineEdit(frameRef, loads);
  const target = useCvDraft((state) => state.target);
  const scale = fullSize ? 1 : fitScale;

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const observer = new ResizeObserver(([entry]) => {
      setFitScale(entry.contentRect.width / PAGE_WIDTH);
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (loads === 0 || !target || scale <= 0) return;
    const doc = frameRef.current?.contentDocument;
    const box = boxRef.current;
    const section = doc?.querySelector<HTMLElement>(
      `[data-section="${target}"]`,
    );
    useCvDraft.getState().goTo(null);
    if (!box || !section) return;

    box.scrollTo({
      top: Math.max(0, section.offsetTop * scale - 48),
      behavior: "smooth",
    });
    const fields = [...section.querySelectorAll<HTMLElement>("[data-field]")];
    const field = fields.find((item) => item.textContent === "") ?? fields[0];
    if (field) placeCaretAtEnd(field);
  }, [loads, target, scale]);

  return (
    <div
      ref={boxRef}
      className="aspect-210/297 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      {html && scale > 0 ? (
        <div
          className="relative"
          style={{
            width: PAGE_WIDTH * scale,
            height: PAGE_HEIGHT * PREVIEW_PAGES * scale,
          }}
        >
          <iframe
            ref={frameRef}
            title="Xem trước CV"
            srcDoc={html}
            sandbox="allow-same-origin"
            onLoad={() => setLoads((n) => n + 1)}
            className="max-md:pointer-events-none"
            style={{
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT * PREVIEW_PAGES,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              border: 0,
            }}
          />
          {active && (
            <SectionToolbar
              section={active.section}
              entry={active.entry}
              top={active.top * scale}
            />
          )}
        </div>
      ) : (
        <Skeleton className="size-full" />
      )}
    </div>
  );
}
