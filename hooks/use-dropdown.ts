"use client";

import { useEffect, useRef, useState } from "react";

/** Trạng thái mở/đóng của dropdown, tự đóng khi bấm ra ngoài. */
export function useDropdown() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocumentClick = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, [open]);

  return { open, setOpen, root };
}
