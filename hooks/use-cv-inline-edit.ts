"use client";

import { useEffect, useState, type RefObject } from "react";
import { useCvDraft } from "@/hooks/use-cv-draft";
import {
  closestIn,
  parentPath,
  placeCaretAtEnd,
  renumberLines,
} from "@/lib/cv-frame";
import type { CvSectionKey } from "@/types";

export interface ActiveSection {
  section: CvSectionKey;
  entry: string | null;
  top: number;
}

const EDIT_CSS = `
  [data-field] { outline: 1px dashed transparent; outline-offset: 2px; border-radius: 2px; cursor: text; }
  [data-field]:hover { outline-color: rgba(73,82,255,.35); }
  [data-field]:focus { outline: 1.5px solid #4952ff; background: rgba(73,82,255,.05); }
  [data-field]:empty { display: inline-block; min-width: 8em; }
  li[data-field]:empty, p[data-field]:empty, div[data-field]:empty { display: block; }
  [data-field]:empty::before { content: attr(data-placeholder); color: #a1a1aa; font-style: italic; }
  [data-section].cv-hot { outline: 1.5px dashed rgba(73,82,255,.3); outline-offset: 6px; }
`;

/** Cho gõ thẳng lên trang CV trong iframe; mọi xử lý chạy từ trang cha nên iframe vẫn không được chạy script. */
export function useCvInlineEdit(
  frameRef: RefObject<HTMLIFrameElement | null>,
  loads: number,
): ActiveSection | null {
  const [active, setActive] = useState<ActiveSection | null>(null);

  useEffect(() => {
    if (loads === 0) return;
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    setActive(null);

    const style = doc.createElement("style");
    style.textContent = EDIT_CSS;
    doc.head.appendChild(style);

    for (const field of doc.querySelectorAll<HTMLElement>("[data-field]")) {
      field.setAttribute("contenteditable", "plaintext-only");
      if (field.contentEditable !== "plaintext-only") {
        field.setAttribute("contenteditable", "true");
      }
      field.spellcheck = false;
    }

    const draft = useCvDraft.getState();

    const showSection = (target: EventTarget | null, fromFocus: boolean) => {
      const section = closestIn(target, "[data-section]");
      if (!section) return;
      for (const other of doc.querySelectorAll("[data-section]")) {
        other.classList.toggle("cv-hot", other === section);
      }
      const key = section.getAttribute("data-section") as CvSectionKey;
      const entry =
        closestIn(target, "[data-entry]")?.getAttribute("data-entry") ?? null;
      setActive((now) => {
        const next = {
          section: key,
          entry: fromFocus ? entry : (now?.entry ?? null),
          top: section.offsetTop,
        };
        if (
          now &&
          now.section === next.section &&
          now.entry === next.entry &&
          now.top === next.top
        ) {
          return now;
        }
        return next;
      });
    };

    const onInput = (event: Event) => {
      const field = closestIn(event.target, "[data-field]");
      if (!field) return;
      if (field.textContent === "") field.innerHTML = "";
      draft.editText(field.dataset.field!, field.textContent ?? "");
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const field = closestIn(event.target, "[data-field]");
      if (!field) return;
      const path = field.dataset.field!;
      const list = field.tagName === "LI" ? field.parentElement : null;

      if (event.key === "Enter") {
        event.preventDefault();
        if (!list || field.textContent?.trim() === "") return;
        const line = doc.createElement("li");
        line.dataset.placeholder = field.dataset.placeholder ?? "";
        line.spellcheck = false;
        line.setAttribute(
          "contenteditable",
          field.getAttribute("contenteditable") ?? "true",
        );
        field.after(line);
        draft.insertLine(path);
        renumberLines(list, parentPath(path));
        line.focus();
        return;
      }

      if (event.key !== "Backspace" || !list || field.textContent !== "")
        return;
      const neighbour = (field.previousElementSibling ??
        field.nextElementSibling) as HTMLElement | null;
      if (!neighbour) return;
      event.preventDefault();
      draft.removeLine(path);
      field.remove();
      renumberLines(list, parentPath(path));
      placeCaretAtEnd(neighbour);
    };

    const onFocusIn = (event: FocusEvent) => showSection(event.target, true);
    const onMouseOver = (event: MouseEvent) => showSection(event.target, false);

    doc.addEventListener("input", onInput);
    doc.addEventListener("keydown", onKeyDown);
    doc.addEventListener("focusin", onFocusIn);
    doc.addEventListener("mouseover", onMouseOver);
    return () => {
      doc.removeEventListener("input", onInput);
      doc.removeEventListener("keydown", onKeyDown);
      doc.removeEventListener("focusin", onFocusIn);
      doc.removeEventListener("mouseover", onMouseOver);
      style.remove();
    };
  }, [frameRef, loads]);

  return active;
}
